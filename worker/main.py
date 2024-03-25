import asyncio
import aio_pika
import sys, os
import traceback
from pydantic import BaseModel
from typing import Any

import time
from aio_pika import DeliveryMode, ExchangeType, Message, connect
import json
import time
import pprint
import dill

RABBIT_URI = "amqp://guest:guest@rabbitmq/"
WORKER_EXCHANGE = "workers"
WORKER_TASK_QUEUE = "tasks"
SERVER_UPDATE_QUEUE = "server_responses"
HEARTBEAT_INTERVAL_SEC = 10

from data_persistence import WorkerDataPersistence
tasks = []
is_busy = False
graph_id,node_id,function_id = "unset","unset","unset"
loc = locals()

# db = client.meteor
# print(db.list_collection_names())

class StartOutput(BaseModel):
    StartCsv: str

class EndInput(BaseModel):
    EndCsv: Any

# only exists because all the graph nodes want pickled bodies. avoiding breaking the pattern.
def start_function(message):
    return StartOutput(StartCsv=message)

def end_function(input:EndInput):
    return input.EndCsv

with open("/etc/hostname") as f:
    CONTAINER_ID = f.readline().strip()

async def publish_rmq(exchange, message, routing_key):
    message = formatted_message(message)
    res = await exchange.publish(message, routing_key)
def formatted_message(message_body):
    if not isinstance(message_body, bytes):
        message_body = str.encode(json.dumps(message_body))

    message = Message(
        message_body,
        delivery_mode=DeliveryMode.PERSISTENT,
    )
    return message

async def main_loop() -> None:
    global is_busy, graph_id,node_id,function_id
    data_persistence = WorkerDataPersistence()

    async def get_connection_channel_exchange():
        connection = await connect(RABBIT_URI)
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=1)
        exchange = await channel.declare_exchange(WORKER_EXCHANGE, aio_pika.ExchangeType.TOPIC, durable=True, passive=True)
        return connection, channel, exchange


    async def add_task(function, args):
        loop = asyncio.get_event_loop()
        tasks.append(loop.create_task(function(*args)))

    def prepare_publish_mongo(node_info, batch_id, unpickled_batch_data):
        print("www", node_info, batch_id, unpickled_batch_data)
        if isinstance(unpickled_batch_data, BaseModel):
            batch_data = unpickled_batch_data.dict()
        else:
            batch_data = unpickled_batch_data
        return {
               "graphId":node_info['graphId'],
               "graphNodeId":node_info['nodeId'],
               "functionId":node_info['functionId'],
               "batchId":batch_id,
               "batchData":dill.dumps(batch_data),
               "createdAt":time.time()
        }
#     async def publish_processed_message(payload, node_info):
#         if node_info["code"] == "START_CODE":
#             for batch in payload:
#                 data_persistence.publish(batch, node_info["functionId"], node_info["batchId"], node_info["nodeId"])
#                 await publish_rmq(exchange, batch, output_routing_key)
#         else:
#             await publish_rmq(exchange, payload, output_routing_key)
    '''
    Each node:
     - belongs to the workers exchange

     Sending function results:
        - posts messages to the topic with its identifier

     Receiving input to process:
        - has its own queue that subscribes to the topics of its parent nodes with fanout operator (.#)
    '''
    async def consume_work(node_info):
        # collects batch data. all nodes sending input to this node
        # must have sent something before the function processes the batch.
        # Structure: batch_id: {sending node id: mongo entry id}
        batch_directory = {}

        try:
            connection, channel, exchange = await get_connection_channel_exchange()
            queue = await channel.declare_queue(CONTAINER_ID, auto_delete=True,durable=True)
            # TODO check for collision with locals
            functionToRun,function_input_type,function_output_type = "unset","unset","unset"
            if node_info["code"] == "START_CODE":
                functionToRun = start_function
                function_output_type = StartOutput
                input_routing_keys = [f"{node_info['graphId']}.START.INPUT.#"]
                output_routing_key = f"{node_info['graphId']}.{node_info['nodeId']}.{node_info['functionId']}"
            elif node_info["code"] == "END_CODE":
                functionToRun =  end_function
                function_input_type = EndInput
                input_routing_keys = [f"{node_info["graphId"]}.{edge["sourceArgument"]["nodeId"]}.{edge["sourceArgument"]["functionId"]}.#" for edge in node_info["inputEdges"]]
                output_routing_key = f"{node_info['graphId']}.END.END"
            else:
                codeToRun = node_info["code"].replace('\\n', '\n')
#                 print(f"[worker {CONTAINER_ID}]  pre exec")
                ex = exec(codeToRun, globals(), loc)
#                 print(f"[worker {CONTAINER_ID}]  post exec")
                functionToRun = loc[node_info["name"]] # TODO change to function_name
#                 print(f"[worker {CONTAINER_ID}]", functionToRun)
                function_input_type = loc["Input"]
                function_output_type = loc["Output"]
                print(f"[worker {CONTAINER_ID}] functions", functionToRun, function_input_type, function_output_type)
                input_routing_keys = list(set([f"{node_info["graphId"]}.{edge["sourceArgument"]["nodeId"]}.{edge["sourceArgument"]["functionId"]}.#" for edge in node_info["inputEdges"]]))
                output_routing_key = f"{node_info['graphId']}.{node_info['nodeId']}.{node_info['functionId']}"

#             print(f"[worker {CONTAINER_ID}]  input edges:", node_info["inputEdges"])
#             print(f"[worker {CONTAINER_ID}]  output edges:", node_info["outputEdges"])
            print(f"[worker {CONTAINER_ID}]  reads from:", input_routing_keys, "publish to", output_routing_key)

            input_count = len(input_routing_keys)

            for routing_key in input_routing_keys:
                await queue.bind(WORKER_EXCHANGE, routing_key=routing_key)

            while True:
                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        try:
                            # input received. index it in dictionary. when all input is received, run the function!
                            print(f"[worker {CONTAINER_ID}] RECEIVED ", message.body, message.routing_key)
                            graph_id,node_id,function_id,batch_id =  message.routing_key.split(".")

                            if batch_id not in batch_directory.keys():
                                batch_directory[batch_id] = {}

                            batch_directory[batch_id][node_id] = message

                            # if all nodes connected to this node have processed this batch and sent their results
                            # it means i can run this function now. so extract the arguments and run it!

                            if len(node_info["inputEdges"]) == 0 and function_id =="INPUT":

                                function_argument = data_persistence.extract_start_input(batch_directory[batch_id]['START'])
                                function_result = start_function(function_argument)

                                to_publish = prepare_publish_mongo(node_info, batch_id, function_result)
                                mongo_id = bytes(str(data_persistence.package_and_publish(to_publish)),"utf-8")

                                await publish_rmq(exchange,mongo_id,f"{output_routing_key}.{batch_id}")
#                                 to_publish = prepare_publish_mongo(node_info, batch_id, function_result)
#                                 mongo_id = bytes(str(data_persistence.package_and_publish(to_publish)),"utf-8")
#
#                                 await publish_rmq(exchange,mongo_id,f"{output_routing_key}.{batch_id}")
                                print(f"[worker {CONTAINER_ID} START] SENT ", function_result, f"{output_routing_key}.{batch_id}")
                                await message.ack()

                            elif len(batch_directory[batch_id].keys()) == input_count:
                                print(f"[worker {CONTAINER_ID}] can call function ")
                                function_arguments = data_persistence.extract_function_arguments(batch_directory[batch_id], node_info["inputEdges"])
                                print(f"[worker {CONTAINER_ID}] fun args", function_arguments)

                                print(f"[worker {CONTAINER_ID}] function_input_type", function_input_type)
                                input_object = function_input_type.model_validate(function_arguments)
                                function_result = functionToRun(input_object)
                                print("I RAN, function result:", function_result)

                                to_publish = prepare_publish_mongo(node_info, batch_id, function_result)
                                mongo_id = bytes(str(data_persistence.package_and_publish(to_publish)),"utf-8")

                                await publish_rmq(exchange,mongo_id,f"{output_routing_key}.{batch_id}")

                                print(f"[worker {CONTAINER_ID} END] SENT ", function_result, f"{output_routing_key}.{batch_id}")
                                await message.ack()
                        except Exception as e:
                            print(traceback.format_exc())
                        # TODO separate into process to prevent crashing + queue/multiprocessing
#                         result = functionToRun(msg)
#                         print(result)
#                         publish_processed_message(result, node_info)
                await asyncio.sleep(0.1)
        except Exception as e:
            print(traceback.format_exc())
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)

    async def consume_task():
        global is_busy, graph_id,node_id,function_id
        connection, channel, exchange = await get_connection_channel_exchange()
        await channel.set_qos(10)
        queue = await channel.declare_queue(WORKER_TASK_QUEUE, durable=True)
        await queue.bind(WORKER_EXCHANGE, routing_key=f"task.*")

        try:
            while True:
                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        msg = json.loads(message.body)
                        if is_busy == True:
                            await message.reject(requeue=True)
                        else:
#                             print(f"[worker {CONTAINER_ID}] received task:", msg)
                            await add_task(consume_work, [msg])
                            is_busy = True
                            await message.ack()

                    await asyncio.sleep(0.1)
        except Exception as e:
            print("Exc", e)
    async def publish_heartbeat():
        connection, channel, exchange = await get_connection_channel_exchange()
        global is_busy, graph_id, function_id, node_id

        while True:
            await asyncio.sleep(HEARTBEAT_INTERVAL_SEC)
            message = {
                      "_id": CONTAINER_ID,
                      "heartbeat": int(time.time()* 1000),
                      "is_busy": is_busy
                  }
            if is_busy:
                message["graph_id"] = graph_id
                message["node_id"] = node_id
                message["function_id"] = function_id
#             print(f"[worker] {CONTAINER_ID} heartbeat",message["heartbeat"])
            await publish_rmq(exchange, message,
            "worker_reply.up")

    await add_task(publish_heartbeat, [])
    await add_task(consume_task, [])
    await asyncio.gather(*tasks)

async def goodbye() -> None:
    print(f'[workers] {CONTAINER_ID} shutting down')

    connection =  await connect("amqp://guest:guest@rabbitmq/")
    channel = await connection.channel()

    exchange = await channel.declare_exchange(
        "workers", ExchangeType.TOPIC,
        passive=True
    )
    message_body = {
            "_id": CONTAINER_ID,
            "heartbeat": time.time()
        }

    await publish_rmq(exchange, message_body, routing_key="worker_reply.down")





if __name__ == "__main__":
    try:
        asyncio.run(main_loop())
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main_loop())
        loop.close()
    finally:
        time.sleep(5)
        asyncio.run(goodbye())

