import asyncio
import aio_pika
from aio_pika.pool import Pool
import json
import uuid

RABBIT_URI = "amqp://guest:guest@rabbitmq/"
WORKER_EXCHANGE = "workers"
WORKER_TASK_QUEUE = "tasks"
SERVER_UPDATE_QUEUE = "server_responses"
tasks = []
is_busy = False
machine_id = uuid.uuid4()

# async def main_tester(CONSUMER_QUEUE, EXCHANGE_NAME, PUBLISH_QUEUE):
async def main_tester():
    loop = asyncio.get_event_loop()
    async def get_connection():
        return await aio_pika.connect_robust(RABBIT_URI)
        

    connection_pool = Pool(get_connection, max_size=5, loop=loop)

    async def get_channel() -> aio_pika.Channel:
        async with connection_pool.acquire() as connection:
            return await connection.channel()

    channel_pool = Pool(get_channel, max_size=10, loop=loop)

    async def consume_work(read_from, function_name, function_code):
        async with channel_pool.acquire() as channel:  # type: aio_pika.Channel
            exchange = await channel.declare_exchange(WORKER_EXCHANGE, aio_pika.ExchangeType.TOPIC, durable=True)
            while True:
                await channel.set_qos(10)

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
                        await publish(new_message, function_name)
                        await message.ack()
                await asyncio.sleep(0.1)

    async def consume_task():
        global is_busy
        async with channel_pool.acquire() as channel:  # type: aio_pika.Channel
            exchange = await channel.declare_exchange(WORKER_EXCHANGE, aio_pika.ExchangeType.TOPIC, durable=True)
            while True:
                await channel.set_qos(10)
                queue = await channel.declare_queue(
                    WORKER_TASK_QUEUE,
                    durable=True
                )

                await queue.bind(WORKER_EXCHANGE, routing_key=f"task.up")
                async with queue.iterator() as queue_iter:
                    async for message in queue_iter:
                        
                        msg = json.loads(message.body)
                        print("received ", msg, "from task.up")
                        # Do a lot of stuff with the received message..
                        # When the 'processing' of the received process is done, a new message is created which needs
                        # to be published to another queue.
                        if is_busy == True:
                            print("Node busy, rejecting...")
                            await message.reject(requeue=True)
                        else:
                            # TODO cleanup:
                            # nicer branching logic
                            # unique start/end topics per comp graph?
                            if len(msg['parents']) == 0:                                
                                work = loop.create_task(consume_work('start', msg['name'], msg['code']))
                                tasks.append(work)
                            else:
                                for parent in msg['parents']:
                                    work = loop.create_task(consume_work(parent['name'], msg['name'], msg['code']))
                                    tasks.append(work)                         
                            # await publish(new_message, PUBLISH_QUEUE)
                            await message.ack()

                            is_busy = True
                await asyncio.sleep(0.1)

    async def publish(msg: dict, routing_key: str):
        async with channel_pool.acquire() as channel:  # type: aio_pika.Channel
            exchange = await channel.declare_exchange(WORKER_EXCHANGE, aio_pika.ExchangeType.TOPIC, durable=True)
            print("sending:", msg)
            await exchange.publish(
                aio_pika.Message(
                    body=json.dumps(msg).encode(),
                    delivery_mode=aio_pika.DeliveryMode.PERSISTENT
                ),
                routing_key
            )

    # consume_work = loop.create_task(consume_work())
    tasks.append(loop.create_task(consume_task()))

    await asyncio.gather(*tasks)

if __name__ == "__main__":
    # consume_queue, produce_queue = sys.argv[1], sys.argv[2]
    loop = asyncio.get_event_loop()
    # print("Worker inputting from:", consume_queue, " and outputting to: ", produce_queue)
    loop.run_until_complete(main_tester())
    loop.close()


'''
{
    "from":"start",
    "name":"f1",
    "code":"def f1():\\n    return 'msg 1'\\n"
}

{
    "from":"f1",
    "name":"f2",
    "code":"def f2():\\n    return 'msg 2'\\n"
}
'''