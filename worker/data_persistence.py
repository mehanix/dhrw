from pymongo import MongoClient
import time
import pickle

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

    def extract_function_arguments(mongo_id_list, edges_data):
        print("extracting", mongo_id_list, edges_data)

    def extract_start_input(self, message):
        id = message.body.decode("utf-8")
        return WorkerDataPersistence.get(id)["batchData"]

    def package_and_publish(self, data):
        print("packaging to publish", data)
        data["batchData"] = pickle.dumps(data["batchData"])
#         mongo_id = self.publish(data, data["functionId"], data["batchId"], data["graphNodeId"])
        return WorkerDataPersistence.db.insert_one(data).inserted_id

    async def get_documents(function_id, batch_id, node_id):
        return await db.find({"_id":f"{function_id}.{batch_id}.{node_id}"})
