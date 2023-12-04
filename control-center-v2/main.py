from typing import Union

from fastapi import Depends, FastAPI, BackgroundTasks
from sqlalchemy.orm import Session

from . import crud, models, schemas
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_root():
    return {"Hello": "Datahive"}

@app.get("/graph/create")
async def create_computation_graph(db: Session = Depends(get_db)):
    return crud.create_graph(db)

@app.get("/graph/{graph_id}")
async def get_computation_graph(graph_id: int, db: Session = Depends(get_db)):
    return crud.get_graph(db, graph_id)

@app.post("/node/create")
async def create_computation_node(node: schemas.GraphNodeCreate, db: Session = Depends(get_db)):
    return crud.create_node(db, node)

@app.post("/function/create")
async def create_function(func: schemas.FunctionCreate, db: Session = Depends(get_db)):
    return crud.create_function(db, func)

@app.delete("/function/{function_id}")
async def remove_function(function_id: str, db: Session = Depends(get_db)):
    return crud.remove_function(db, function_id)

@app.put("/graph/link/{from_id}/{to_id}")
async def connect_nodes(from_id:int, to_id:int, db: Session = Depends(get_db)):
    return crud.connect_nodes(db, from_id, to_id)

@app.delete("/graph/link/{from_id}/{to_id}") # graph_id
async def disconnect_nodes(from_id:int, to_id:int, db: Session = Depends(get_db)):
    return crud.disconnect_nodes(db, from_id, to_id)

@app.get("/node/{node_id}")
async def get_computation_node(node_id: int, db: Session = Depends(get_db)):
    return crud.get_node(db, node_id)

@app.put("/node/{node_id}")
async def edit_node(node_id:int, node: schemas.GraphNodeEdit, db: Session = Depends(get_db)):
    print(node)
    return crud.edit_node(db, node)

@app.put("/machine/up")
async def up_machine(db: Session = Depends(get_db)):
    return crud.create_machine(db)

@app.delete("/machine/{machine_id}")
async def down_machine(machine_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    return crud.remove_machine(db, machine_id, background_tasks)
   
@app.put("/machine/{machine_id}/bind/{node_id}")
async def bind_machine(machine_id: str, node_id: int, db: Session = Depends(get_db)):
    return crud.bind_machine(machine_id=machine_id, node_id=node_id, db=db)

@app.put("/graph/{graph_id}/up")
async def up_computation_graph(graph_id: int):
    return {}

@app.put("/graph/{graph_id}/down")
async def down_computation_graph(graph_id: int):
    return {}

# @app.put("/node/{node_id}/up")
# async def up_computation_node(node_id: int):
#     return {}

# @app.put("/node/{node_id}/down")
# async def down_computation_node(node_id: int):
#     return {}


