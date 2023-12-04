import aio_pika

RABBIT_URI = "amqp://guest:guest@rabbitmq/"
WORKER_EXCHANGE = "workers"

async def send_task(routing_key, body):
    connection = await aio_pika.connect_robust(RABBIT_URI)    
    channel = connection.channel()
    channel.basic_publish(exchange=WORKER_EXCHANGE, routing_key=routing_key, body=body)
    print("[x] Sent {routing_key}, {body}")
    connection.close()