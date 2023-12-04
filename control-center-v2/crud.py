from sqlalchemy.orm import Session
from fastapi import BackgroundTasks


import os
import docker 

from dotenv import load_dotenv

import rabbit, gitlab

from . import models, schemas

load_dotenv()

client = docker.from_env()

def create_graph(db: Session):
    db_graph = models.Graph()
    db.add(db_graph)
    db.commit()
    db.refresh(db_graph)
    return db_graph

def get_graph(db: Session, id: str):
    graph = db.query(models.Graph).filter(models.Graph.id == id).first()
    graph.nodes

    return graph

def create_node(db: Session, node: schemas.GraphNodeCreate):

    db_function = db.query(models.Function).filter(models.Function.id == node.function_id).first()

    code = gitlab.get_code(db_function.gitlab_link, os.environ['GITLAB_ACCESS_TOKEN'])
    print("codeeeeee", code)

    db_node = models.GraphNode(name=node.name, function_id=node.function_id, graph_id=node.graph_id, code=code, is_dirty=False)
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

def edit_node(db: Session, node: schemas.GraphNodeEdit):
    db_node = db.query(models.GraphNode).filter(models.GraphNode.id == node.id).first()
    print(node)
    # for attribute in ['name', 'function', 'graph_id']:
    #     if node[attribute] is not None:
    #         db_node[attribute] = node
    
    db.add
    db.commit()
    db.refresh(db_node)
    return db_node
    
def get_node(db: Session, id: str):
    db_node = db.query(models.GraphNode).filter(models.GraphNode.id == id).first()
    db_node.children
    db_node.parents
    return db_node

def connect_nodes(db: Session, from_id: int, to_id: int):
    db_from_node = db.query(models.GraphNode).filter(models.GraphNode.id == from_id).first()
    db_to_node = db.query(models.GraphNode).filter(models.GraphNode.id == to_id).first()

    db_from_node.children.append(db_to_node)
    # db_to_node.parents.append(db_from_node)
    db.add(db_from_node)
    # db.session.add(db_to_node)
    db.commit()
    db.refresh(db_from_node)

    db_from_node.children
    return db_from_node

def disconnect_nodes(db: Session, from_id: int, to_id: int):
    db_from_node = db.query(models.GraphNode).filter(models.GraphNode.id == from_id).first()
    db_to_node = db.query(models.GraphNode).filter(models.GraphNode.id == to_id).first()

    db_from_node.children.remove(db_to_node)
    db.add(db_from_node)
    db.commit()
    db.refresh(db_from_node)
    db_from_node.children

    return db_from_node

def create_machine(db: Session):
    machine = client.containers.run("worker", detach=True, network="mp-nicoleta-datahive_datahive_net")
    db_machine = models.Machine(id=machine.id, status=machine.status)
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine

def remove_machine(db: Session, machine_id: str, background_tasks: BackgroundTasks):
    # todo remove from db
    def machine_stop_task():
        machine = client.containers.get(machine_id)
        machine.stop()
        status = machine.remove()
    
    background_tasks.add_task(machine_stop_task)

    return {
        "status":f"Initiated shutdown for {machine_id}"
    }

def bind_machine(db: Session, machine_id: str, node_id: int):
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    db_node = db.query(models.GraphNode).filter(models.GraphNode.id == node_id).first()


    rabbit.send_task(routing_key="task.up", body=db_node)
    db_machine.runs_node.append(db_node.id)
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine

def create_function(db: Session, func:schemas.FunctionCreate):
    db_function = models.Function(gitlab_link = func.gitlab_link)
    db.add(db_function)
    db.commit()
    db.refresh(db_function)
    return db_function

def remove_function(db: Session, function_id: str):
    function = db.query(models.Function).filter(models.Function.id == function_id).first()
    db.delete(function)
    db.commit()

    return function
    