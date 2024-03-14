from pymongo import MongoClient
import time

class WorkerDataPersistence:
    client = MongoClient("mongodb://127.0.0.1:3001/meteor")
    db = client.processed_work
    db.createIndex( { "createdAt": 1 }, {expireAfterSeconds: 3600 } )

    async def publish(payload, function_id, batch_id, node_id):
        payload["createdAt"] = time.time()

        return db.insert(
        {"_id":f"{function_id}.{batch_id}.{node_id}"},
        {"$set":payload}
        )

    async def get_documents(function_id, batch_id, node_id):
        return db.find({"_id":f"{function_id}.{batch_id}.{node_id}"})
