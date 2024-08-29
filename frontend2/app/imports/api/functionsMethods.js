import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FunctionsCollection } from '../db/FunctionsCollection';
import {PythonShell} from 'python-shell';
import {publishh} from "../../server/main";
import { octokit } from "../../server/main";

    Meteor.methods({
    async 'functions.insert'(functionObject) {

        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }
        // TODO DO THIS IN A SEPARATE CONTAINER

        const code = await Meteor.callAsync("functions.fetchCode", functionObject.githubLink)
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

    async "functions.startWithCsv"(data, graphId, batchSize) {
        const dataLines = data.trim().split("\n")
        const header = dataLines[0]
        i = 1
        batchSize = Number(batchSize)
        while (i + batchSize <= dataLines.length) {
            console.log("aaaaaaaaaaaa")
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
 
            i+= batchSize
        }
        // Currently dropping the last batch that might not have enough elements to run if that happens.
        if (i+batchSize == dataLines.length) {
            console.log("last batch")
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
        const { data } = await octokit.rest.repos.getContent({
            mediaType: {
                format: "raw",
            },
            owner: "mehanix",
            repo: "disi-function-repo",
            path: functionFile,
        });

        return data;
    }
});
