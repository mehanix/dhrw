from pymongo import MongoClient
import time
import dill
from bson.objectid import ObjectId

class WorkerDataPersistence:
    client = MongoClient('mongodb://mongo/')
    db = client.meteor.processed_work
    results_db = client.meteor.results

    def publish_results(data, graph_id, batch_id):
        print("To Send To Mongo:", data.EndCsv[:100], graph_id, batch_id)
        print(WorkerDataPersistence.client, WorkerDataPersistence.client.meteor, WorkerDataPersistence.client.meteor.results)
        message = {
            "userId":"DYSNEQwkYuAfNj2Wu",
            "graphId":graph_id,
            "batchId":batch_id,
            "timestamp":time.time(),
            "data":str(data.EndCsv)
        }
        print("MSG sending")
        res = WorkerDataPersistence.results_db.insert_one(message)
        print("insert res:", res)

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

    def extract_function_arguments(self,batch_messages, edges_data):
        for k,v in batch_messages.items():
        #    print("extracting", v.body.decode("utf-8"))
            batch_messages[k] = WorkerDataPersistence.get(ObjectId(v.body.decode("utf-8")))
#         print("batch messages", batch_messages) # aparent insertul nu merge din pymongo.
#         batch_mongo_data = WorkerDataPersistence.get.find({"_id": {"$in": batch_mongo_ids}})

        for source_node_id,unformatted_mongo_message in batch_messages.items():
            batch_messages[source_node_id]["batchData"] = dill.loads(unformatted_mongo_message["batchData"])

        arguments_dict = {}
        # match source node id to target edge name. double check data types!
        for edge in edges_data:
            print(edge)
            source_id = edge["sourceArgument"]["nodeId"]
            matching_data = batch_messages[source_id]["batchData"]
            print("MATCHING", matching_data, edge["targetArgument"]["name"])
            if isinstance(matching_data, str): # if directly from start
                arguments_dict[edge["targetArgument"]["name"]] = matching_data
            else:
                source_field_name = edge["sourceArgument"]["name"]
                arguments_dict[edge["targetArgument"]["name"]] = matching_data[source_field_name]

#         print("pp",batch_messages, edges_data)
        print("arguments_dict", arguments_dict)
        return arguments_dict

    def extract_start_input(self, message):
        id = message.body.decode("utf-8")
        return WorkerDataPersistence.get(id)["batchData"]

    def package_and_publish(self, data):
#         data["batchData"] = dill.dumps(data["batchData"])
        return WorkerDataPersistence.db.insert_one(data).inserted_id

    async def get_documents(function_id, batch_id, node_id):
        return await db.find({"_id":f"{function_id}.{batch_id}.{node_id}"})
