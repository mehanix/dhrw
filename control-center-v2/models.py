from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.orm import DeclarativeBase

from typing import Optional
from .database import Base

class Base(DeclarativeBase):
    pass

class Graph(Base):
    __tablename__ = "comp_graphs"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(50), default="down")
    nodes: Mapped["GraphNode"] = relationship(back_populates="belongs_to_graph")

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    gitlab_token: Mapped[str] = mapped_column(String(300))

class Machine(Base):
    __tablename__ = "machines"
    id: Mapped[str] = mapped_column(primary_key=True)
    status: Mapped[str] = mapped_column(String(50))
    runs_node: Mapped["GraphNode"] = relationship("GraphNode", back_populates="runs_on_machine")

node_to_node = Table(
    "node_to_node",
    Base.metadata,
    Column("from_node_id", Integer, ForeignKey("graph_nodes.id"), primary_key=True),
    Column("to_node_id", Integer, ForeignKey("graph_nodes.id"), primary_key=True),
)

class Function(Base):
    __tablename__ = "function_repository"
    id: Mapped[int] = mapped_column(primary_key=True)
    gitlab_link: Mapped[str] = mapped_column(String(300))
    
class GraphNode(Base):
    __tablename__ = "graph_nodes"

    id: Mapped[int] = mapped_column(primary_key=True)
    gitlab_token: Mapped[str] = mapped_column(String(300))
    function_id: Mapped[Optional[int]] = Column(Integer, ForeignKey("function_repository.id"), nullable=True)
    code: Mapped[str] = mapped_column(String())
    is_dirty: Mapped[bool] = mapped_column(Boolean(), default=False)

    graph_id: Mapped[int] = mapped_column(ForeignKey("comp_graphs.id"))
    belongs_to_graph: Mapped["Graph"] = relationship(back_populates="nodes")
    machine_id: Mapped[int] = mapped_column(ForeignKey("machines.id"))
    runs_on_machine: Mapped["Machine"] = relationship(back_populates="runs_node")

    children: Mapped["GraphNode"] = relationship(secondary=node_to_node,
                            primaryjoin=id == node_to_node.c.from_node_id,
                            secondaryjoin=id == node_to_node.c.to_node_id,
                            back_populates="parents")

    parents: Mapped["GraphNode"] = relationship(secondary=node_to_node,
                            primaryjoin=id == node_to_node.c.from_node_id,
                            secondaryjoin=id == node_to_node.c.to_node_id,
                            back_populates="children")
