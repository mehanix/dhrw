from pymongo import MongoClient
import time

class WorkerDataPersistence:
    client = MongoClient('mongodb://mongo/')
    db = client.meteor.processed_work
    print()

    async def publish(payload, function_id, batch_id, node_id):
        payload["createdAt"] = time.time()

        return db.insert(
        {"_id":f"{function_id}.{batch_id}.{node_id}"},
        {"$set":payload}
        )

    def get(id):
        print(id)
        try:
            res = WorkerDataPersistence.db.find_one({"_id":id})
            print(res)
            return res
        except Exception as e:
            print("exc", e)
        print("didnt work")

    async def get_documents(function_id, batch_id, node_id):
        return await db.find({"_id":f"{function_id}.{batch_id}.{node_id}"})
