from typing import List
from pydantic import BaseModel

# from typing import TYPE_CHECKING
# if TYPE_CHECKING:
#     from .bar import Bar
# else:
#     Bar = "Bar"

class GraphBase(BaseModel):
    pass

class GraphCreate(GraphBase):
    name: str = "Unnamed Graph"
    pass

class Graph(GraphBase):
    id: int
 
    class Config:
        orm_mode = True
    
class GraphNodeBase(BaseModel):
    graph_id: int = None

class GraphNodeCreate(GraphNodeBase):
    name: str = None
    function_id: str = None

class GraphNodeEdit(GraphNodeCreate):
    id: int

class GraphNode(GraphNodeBase):
    id: int

    parents: List['GraphNode']
    children: List['GraphNode']
    belongs_to_graph: Graph

    class Config:
        orm_mode = True

class Function(BaseModel):
    gitlab_link: str
    name: str
    description: str

    class Config:
        orm_mode = True

class FunctionCreate(Function):
    pass
# GraphNode.model_rebuild()
