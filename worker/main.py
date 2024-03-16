import asyncio
import aio_pika

import sys
import time
from aio_pika import DeliveryMode, ExchangeType, Message, connect
import json
import time
import pprint


RABBIT_URI = "amqp://guest:guest@rabbitmq/"
WORKER_EXCHANGE = "workers"
WORKER_TASK_QUEUE = "tasks"
SERVER_UPDATE_QUEUE = "server_responses"
HEARTBEAT_INTERVAL_SEC = 10

from data_persistence import WorkerDataPersistence
tasks = []
is_busy = False
loc = locals()

# db = client.meteor
# print(db.list_collection_names())

with open("/etc/hostname") as f:
    CONTAINER_ID = f.readline().strip()
# This is the only function that breaks the pattern of 1 message input -> 1 message output
# Splits user-loaded input into multiple row batches.
def start_function(message):
    print("in start!", message)
    return message
#     batchSize = received_message["batchSize"]
#     csvLines = received_message["csv"].split("\n")
#     header = csvLines[0]
#     csvLines = csvLines[1:]
#     batches = [lst[i:i + n] for i in range(0, len(csvLines), n)]
#     for b in batches:
#         b.insert(0, x)
#     print("I RAN", batches)
#     return batches

async def main_loop() -> None:
    global is_busy
    data_persistence = WorkerDataPersistence()

    async def publish_rmq(exchange, message, routing_key):
        await exchange.publish(formatted_message(message), routing_key)


    async def get_connection_channel_exchange():
        connection = await connect(RABBIT_URI)
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=1)
        exchange = await channel.declare_exchange(WORKER_EXCHANGE, aio_pika.ExchangeType.TOPIC, durable=True, passive=True)
        return connection, channel, exchange

    def formatted_message(body):
        message_body = str.encode(json.dumps(body))

        message = Message(
            message_body,
            delivery_mode=DeliveryMode.PERSISTENT,
        )
        return message

    async def add_task(function, args):
        loop = asyncio.get_event_loop()
        tasks.append(loop.create_task(function(*args)))

    async def publish_processed_message(payload, node_info):
        if node_info["code"] == "START_CODE":
            for batch in payload:
                data_persistence.publish(batch, node_info["functionId"], node_info["batchId"], node_info["nodeId"])
                await publish_rmq(exchange, batch, output_routing_key)
        else:
            await publish_rmq(exchange, payload, output_routing_key)
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
            functionToRun = "unset"
            if node_info["code"] == "START_CODE":
                 functionToRun = start_function
                 input_routing_keys = [f"{node_info['graphId']}.START.INPUT.#"]
                 output_routing_key = f"{node_info['graphId']}.{node_info['nodeId']}.{node_info['functionId']}"
            elif node_info["code"] == "END_CODE":
                functionToRun =  start_function
                input_routing_keys = [f"{node_info["graphId"]}.{edge["sourceArgument"]["nodeId"]}.{edge["sourceArgument"]["functionId"]}.#" for edge in node_info["inputEdges"]]
                output_routing_key = f"{node_info['graphId']}.END.END"
            else:
                codeToRun = node_info["code"].replace('\\n', '\n')
                ex = exec(codeToRun, globals(), loc)
                functionToRun = loc[node_info["name"]] # TODO change to function_name

                input_routing_keys = [f"{node_info["graphId"]}.{edge["sourceArgument"]["nodeId"]}.{edge["sourceArgument"]["functionId"]}.#" for edge in node_info["inputEdges"]]
                output_routing_key = f"{node_info['graphId']}.{node_info['nodeId']}.{node_info['functionId']}"

            print(f"[worker {CONTAINER_ID}]  input edges:", node_info["inputEdges"])
            print(f"[worker {CONTAINER_ID}]  output edges:", node_info["outputEdges"])
            print(f"[worker {CONTAINER_ID}]  reads from:", input_routing_keys, "publish to", output_routing_key)

            input_count = len(input_routing_keys)

            for routing_key in input_routing_keys:
                await queue.bind(WORKER_EXCHANGE, routing_key=routing_key)

            while True:
                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        try:
                            # input received. index it in dictionary. when all input is received, run the function!
                            print(f"[worker {CONTAINER_ID}] received input!!!", message.body, message.routing_key.split("."))
                            _,node_id,function_id,batch_id =  message.routing_key.split(".")

                            if batch_id not in batch_directory.keys():
                                batch_directory[batch_id] = {}

                            batch_directory[batch_id][node_id] = message

                            # if all nodes connected to this node have processed this batch and sent their results
                            # it means i can run this function now. so extract the arguments and run it!
#                             if len(batch_directory[batch_id].keys()) == input_count:
#                                 function_arguments = WorkerDataPersistence.extract_function_arguments(batch_directory[batch_id], node_info["inputEdges"])
#                                 print(function_arguments)
                            if len(node_info["inputEdges"]) == 0 and function_id == "INPUT":
                                # nodes from START.INPUT can be processed immediately. just format and send forward
                                print(batch_directory[batch_id]['START'])
                                function_argument = data_persistence.extract_start_input(batch_directory[batch_id]['START'])
                                function_result = start_function(function_argument)

                            print("func_res", function_result)
                            data_persistence.package_and_publish(function_result)
                        except Exception as e:
                            print("failed with", e)
                        # TODO separate into process to prevent crashing + queue/multiprocessing
#                         result = functionToRun(msg)
#                         print(result)
#                         publish_processed_message(result, node_info)
                        await message.ack()
                await asyncio.sleep(0.1)
        except e:
            print("EXC", e)

    async def consume_task():
        global is_busy
        connection, channel, exchange = await get_connection_channel_exchange()
        await channel.set_qos(10)
        queue = await channel.declare_queue(WORKER_TASK_QUEUE, durable=True)
        await queue.bind(WORKER_EXCHANGE, routing_key=f"task.*")
        while True:
            async with queue.iterator() as queue_iter:
                async for message in queue_iter:
                    msg = json.loads(message.body)
                    if is_busy == True:
                        await message.reject(requeue=True)
                    else:
                        print(f"[worker {CONTAINER_ID}] received task:", msg)
                        await add_task(consume_work, [msg])
                        is_busy = True
                        await message.ack()

                await asyncio.sleep(0.1)

    async def publish_heartbeat():
        connection, channel, exchange = await get_connection_channel_exchange()
        global is_busy

        while True:
            await asyncio.sleep(HEARTBEAT_INTERVAL_SEC)
            await publish_rmq(exchange, {
                "_id": CONTAINER_ID,
                "heartbeat": int(time.time()* 1000),
                "is_busy": is_busy
            },
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

    message_body = str.encode(json.dumps(message_body))

    message = Message(
        message_body,
        delivery_mode=DeliveryMode.PERSISTENT,
    )
    await exchange.publish_rmq(message, routing_key="worker_reply.down")




if __name__ == "__main__":
    try:
        asyncio.run(main_loop())
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main_loop())
        loop.close()
    finally:
        time.sleep(5)
        asyncio.run(goodbye())
