from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.orm import DeclarativeBase

from typing import Optional
from .database import Base

class Base(DeclarativeBase):
    pass

class Graph(Base):
    __tablename__ = "comp_graphs"

    id = Column(Integer, primary_key=True, index=True)
    nodes = relationship("GraphNode", back_populates="belongs_to_graph")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    gitlab_token = Column(String)

class Machine(Base):
    __tablename__ = "machines"
    id = Column(String, primary_key=True, index=True)
    status = Column(String)
    runs_node = relationship("GraphNode", back_populates="runs_on_machine")

node_to_node = Table(
    "node_to_node",
    Base.metadata,
    Column("from_node_id", Integer, ForeignKey("graph_nodes.id"), primary_key=True),
    Column("to_node_id", Integer, ForeignKey("graph_nodes.id"), primary_key=True),
)

class Function(Base):
    __tablename__ = "function_repository"
    id = Column(Integer, primary_key=True, index=True)
    gitlab_link = Column(String, unique=True)
    
class GraphNode(Base):
    __tablename__ = "graph_nodes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    function_id: Mapped[Optional[int]] = Column(Integer, ForeignKey("function_repository.id"), nullable=True)
    code = Column(String)
    is_dirty = Column(Boolean, default=False)

    graph_id = Column(Integer, ForeignKey("comp_graphs.id"))
    belongs_to_graph = relationship("Graph", back_populates="nodes")
    machine_id=Column(String, ForeignKey("machines.id"))
    runs_on_machine = relationship("Machine", back_populates="runs_node")

    children = relationship("GraphNode",
                            secondary=node_to_node,
                            primaryjoin=id == node_to_node.c.from_node_id,
                            secondaryjoin=id == node_to_node.c.to_node_id,
                            back_populates="parents")
    parents = relationship("GraphNode",
                            secondary=node_to_node,
                            primaryjoin=id == node_to_node.c.to_node_id,
                            secondaryjoin=id == node_to_node.c.from_node_id,
                            back_populates="children")
