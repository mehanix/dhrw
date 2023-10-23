import asyncio
import aio_pika
from aio_pika.pool import Pool
import json
import sys 

RABBIT_URI = "amqp://guest:guest@localhost/"

def user_function(value):
    return str(int(value) * 2)

async def main_tester(CONSUMER_QUEUE, EXCHANGE_NAME, PUBLISH_QUEUE):
    """Everything creating inside main_tester() for simplicity of this example"""
    loop = asyncio.get_event_loop()

    async def get_connection():
        return await aio_pika.connect_robust(RABBIT_URI)

    connection_pool = Pool(get_connection, max_size=2, loop=loop)

    async def get_channel() -> aio_pika.Channel:
        async with connection_pool.acquire() as connection:
            return await connection.channel()

    channel_pool = Pool(get_channel, max_size=10, loop=loop)

    async def consume():
        async with channel_pool.acquire() as channel:  # type: aio_pika.Channel
            exchange = await channel.declare_exchange(EXCHANGE_NAME, aio_pika.ExchangeType.TOPIC, durable=True)
            while True:
                await channel.set_qos(10)

                auto_delete = False if CONSUMER_QUEUE == "start" else True
                queue_name = "start" if CONSUMER_QUEUE == "start" else ""

                queue = await channel.declare_queue(
                    queue_name,
                    auto_delete=auto_delete,
                    durable=True
                )

                await queue.bind(EXCHANGE_NAME, routing_key=f"{CONSUMER_QUEUE}.#")
                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        
                        msg = json.loads(message.body)
                        print("received ", msg, "from ", CONSUMER_QUEUE)
                        # Do a lot of stuff with the received message..
                        # When the 'processing' of the received process is done, a new message is created which needs
                        # to be published to another queue.
                        new_message = user_function(msg)

                        await publish(new_message, PUBLISH_QUEUE)
                        await message.ack()
                await asyncio.sleep(0.1)


    async def publish(msg: dict, routing_key: str):
        async with channel_pool.acquire() as channel:  # type: aio_pika.Channel
            exchange = await channel.declare_exchange(EXCHANGE_NAME, aio_pika.ExchangeType.TOPIC, durable=True)
            # auto_delete = True
            # queue_name = PUBLISH_QUEUE
            # if PUBLISH_QUEUE == "end":
            #     auto_delete = False
            # else:
            #     queue_name = "q_" + PUBLISH_QUEUE
            
            # ready_queue = await channel.declare_queue(
            #     "", durable=True, auto_delete=auto_delete
            # )
            # await ready_queue.bind(exchange, routing_key)
            
            print("sending:", msg)
            await exchange.publish(
                aio_pika.Message(
                    body=json.dumps(msg).encode(),
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                ),
                routing_key
            )

    task = loop.create_task(consume())
    await task

if __name__ == "__main__":
    consume_queue, produce_queue = sys.argv[1], sys.argv[2]
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main_tester(consume_queue, "workers", produce_queue))
    loop.close()