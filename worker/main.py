import asyncio
import aio_pika

import sys
import time
from aio_pika import DeliveryMode, ExchangeType, Message, connect
import json
import time

RABBIT_URI = "amqp://guest:guest@localhost/"
WORKER_EXCHANGE = "workers"
WORKER_TASK_QUEUE = "tasks"
SERVER_UPDATE_QUEUE = "server_responses"
HEARTBEAT_INTERVAL_SEC = 10

tasks = []

with open("/etc/hostname") as f:
    CONTAINER_ID = f.readline().strip()


async def main_loop() -> None:

    async def publish(exchange, message, routing_key):
        await exchange.publish(formatted_message(message), routing_key)
        print(f" [workers] {CONTAINER_ID}: Sent ", message)

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

    async def consume_work(read_from, function_name, function_code):
        connection, channel, exchange = await get_connection_channel_exchange()

        while True:
            auto_delete = False if read_from == "start" else True
            queue_name = "start" if read_from == "start" else machine_id + "_in"

            queue = await channel.declare_queue(
               queue_name,
               auto_delete=auto_delete,
               durable=True
            )

            ex = exec(function_code.replace('\\n', '\n'), globals(), locals())

            await queue.bind(WORKER_EXCHANGE, routing_key=f"{read_from}.#")
            async with queue.iterator() as queue_iter:
                async for message in queue_iter:
                    msg = json.loads(message.body)
                    print("received ", msg, "from ", read_from)
                    print(read_from, function_name, function_code)
                    # Do a lot of stuff with the received message..
                    # When the 'processing' of the received process is done, a new message is created which needs
                    # to be published to another queue.

                    # check for collision with locals

                    # separate into process to prevent crashing + queue/multiprocessing
                    print(function_name in locals())
                    new_message = locals()[function_name](msg)
                    # use pydantic pt datatype enforcing!
                    await publish(exchange, new_message, function_name)
                    await message.ack()
            await asyncio.sleep(0.1)

       async def consume_task():
            global is_busy
            connection, channel, exchange = await get_connection_channel_exchange()
            await channel.set_qos(10)
            queue = await channel.declare_queue, WORKER_TASK_QUEUE, durable=True)
            await queue.bind(WORKER_EXCHANGE, routing_key=f"task.*")
            while True:
                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:

                        msg = json.loads(message.body)
                        print(f"[worker {CONTAINER_ID}] received task:", msg)
                        if is_busy == True:
                            print("[worker {CONTAINER_ID}] is busy, rejecting...")
                            await message.reject(requeue=True)
                        else:
                            # TODO rewrite:
                            # nicer branching logic
                            # unique start/end topics per comp graph?
                            if len(msg['parents']) == 0:
                                await add_task(consume_work, ['start', msg['name'], msg['code']])
                            else:
                                for parent in msg['parents']:
                                    await add_task(consume_work, [parent['name'], msg['name'], msg['code']])

                            is_busy = True
                            await message.ack()

                    await asyncio.sleep(0.1)


    async def publish_heartbeat():
        connection, channel, exchange = await get_connection_channel_exchange()

        while True:
            await asyncio.sleep(HEARTBEAT_INTERVAL_SEC)
            await publish(exchange, {
                "_id": CONTAINER_ID,
                "heartbeat": int(time.time()* 1000)
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