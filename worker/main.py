import asyncio
import aio_pika

import sys
import time
from aio_pika import DeliveryMode, ExchangeType, Message, connect
import json
import time

RABBIT_URI = "amqp://guest:guest@rabbitmq/"
WORKER_EXCHANGE = "workers"
WORKER_TASK_QUEUE = "tasks"
SERVER_UPDATE_QUEUE = "server_responses"
HEARTBEAT_INTERVAL_SEC = 10

tasks = []
is_busy = False
loc = locals()

with open("/etc/hostname") as f:
    CONTAINER_ID = f.readline().strip()

def start_function(dataBytes):
    while True:
        print("sunt in start!", dataBytes)


async def main_loop() -> None:
    global is_busy
    async def publish(exchange, message, routing_key):
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

    '''
    Each node:
     - belongs to the workers exchange

     Sending function results:
        - posts messages to the topic with its identifier

     Receiving input to process:
        - has its own queue that subscribes to the topics of its parent nodes with fanout operator (.#)
    '''
    async def consume_work(node_info):
        try:
            connection, channel, exchange = await get_connection_channel_exchange()
            queue = await channel.declare_queue(CONTAINER_ID, auto_delete=True,durable=True)
            # TODO check for collision with locals
            functionToRun = "unset"
            if node_info["code"] == "START_CODE":
                 functionToRun = start_function
            elif node_info["code"] == "END_CODE":
                functionToRun =  start_function

            else:
                codeToRun = node_info["code"].replace('\\n', '\n')
                code = "import json\ndef a(x):\n    return x"
                ex = exec(codeToRun, globals(), loc)
                print(f"[worker {CONTAINER_ID}]", "exec worked")
                print(f"[worker {CONTAINER_ID}]", node_info["name"] in loc)
                functionToRun = loc[node_info["name"]] # TODO change to function_name
                print(f"[worker {CONTAINER_ID}]", "attr loc worked")
            print(f"[worker {CONTAINER_ID}]", functionToRun)
            input_routing_keys = [f"{node_info["graphId"]}.{edge["sourceArgument"]["nodeId"]}.#" for edge in node_info["inputEdges"]]
            output_routing_key = f"{node_info['graphId']}.{node_info['nodeId']}"
            print(f"[worker {CONTAINER_ID}]  input edges:", node_info["inputEdges"])
            print(f"[worker {CONTAINER_ID}]  output edges:", node_info["outputEdges"])
            print(f"[worker {CONTAINER_ID}]  reads from:", input_routing_keys, "publish to", output_routing_key)

            for routing_key in input_routing_keys:
                await queue.bind(WORKER_EXCHANGE, routing_key=routing_key)

            while True:
                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        msg = json.loads(message.body)
                        print("[worker {CONTAINER_ID}], received input", msg)

                        # TODO separate into process to prevent crashing + queue/multiprocessing
                        new_message = functionToRun(msg)
                        await publish(exchange, new_message, output_routing_key)
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
            await publish(exchange, {
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
    await exchange.publish(message, routing_key="worker_reply.down")




if __name__ == "__main__":
    try:
        asyncio.run(main_loop())
        loop = asyncio.get_event_loop()
        loop.run_until_complete(main_loop())
        loop.close()
    finally:
        time.sleep(5)
        asyncio.run(goodbye())
