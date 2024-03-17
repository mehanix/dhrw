import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FunctionsCollection } from '../db/FunctionsCollection';
import {PythonShell} from 'python-shell';
import {publishh} from "../../server/main";

    Meteor.methods({
    async 'functions.insert'(functionObject) {

        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }
        // TODO DO THIS IN A SEPARATE CONTAINER

        const code = await Meteor.callAsync("functions.fetchCode", functionObject.gitlabLink)
        const [input_schema, output_schema] = await Meteor.callAsync("functions.generateSchemas", code)
        functionObject.inputSchema = input_schema
        functionObject.outputSchema = output_schema
        console.log("fun", functionObject)
        return FunctionsCollection.insert(functionObject)
    },

    'functions.remove'(functionId) {
        check(functionId, String);

        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }
    
        FunctionsCollection.remove(functionId);
    },

    async "functions.startWithCsv"(data, graphId, batchSize= 1) {

        const dataLines = data.trim().split("\n")
        const header = dataLines[0]
        for (let i = 1; i < dataLines.length; i += batchSize) {
            const batchWithHeader = [header, ...dataLines.slice(i, i + batchSize)]
            const msg = {
                "graphId":graphId,
                "graphNodeId":"START",
                "functionId":"START",
                "batchId":i,
                "batchData":batchWithHeader.join("\n"),
                "createdAt":  new Date().getTime()
            }
            const recordId = Meteor.call("processed_work.insert", msg)
            await publishh(`${msg.graphId}.START.INPUT.${msg.batchId}`, recordId) // todo schimba input in start
        }
    },
    async 'functions.generateSchemas'(pythonCode) {
        // TODO. For demonstrative purposes. Change to docker container running this snippet.

        const schemaSnippet = "\n\ninput_schema = Input.model_json_schema()  # (1)!\n" +
                "output_schema = Output.model_json_schema()  # (1)!\n" +
                "print(json.dumps(input_schema))  # (2)!\n" +
                "print(json.dumps(output_schema))  # (2)!\n";

            console.log("codeeee", pythonCode + schemaSnippet)
        const messages = await PythonShell.runString(pythonCode + schemaSnippet)
        return messages
    },

    async 'functions.fetchCode'(functionFile) {
        const link = `https://gitlab.informatik.uni-wuerzburg.de/api/v4/projects/19733/repository/files/${functionFile}/raw?ref=t_main&private_token=${Meteor.settings.GITLAB_ACCESS_TOKEN}`
        const res = await fetch(link);
        return await res.text();
    }
});