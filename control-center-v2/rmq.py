import aio_pika
import json
from fastapi.encoders import jsonable_encoder

RABBIT_URI = "amqp://guest:guest@rabbitmq/"
WORKER_EXCHANGE = "workers"

async def send_task(routing_key, body):
    connection = await aio_pika.connect_robust(RABBIT_URI, timeout=5)    
    channel = await connection.channel()
    exchange = await channel.declare_exchange(
        WORKER_EXCHANGE, aio_pika.ExchangeType.TOPIC,
        durable=True
    )
    res = await exchange.publish(
            aio_pika.Message(
                body=json.dumps(jsonable_encoder(body)).encode(),
                delivery_mode=aio_pika.DeliveryMode.PERSISTENT
            ),
            routing_key=routing_key
        )    
    await connection.close()
    return res