import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FunctionsCollection } from '../db/FunctionsCollection';
import {PythonShell} from 'python-shell';

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

    async 'functions.generateSchemas'(pythonCode) {
        // TODO. For demonstrative purposes. Change to docker container running this snippet.

        const schemaSnippet = "\n\ninput_schema = Input.model_json_schema()  # (1)!\n" +
                "output_schema = Output.model_json_schema()  # (1)!\n" +
                "print(json.dumps(input_schema))  # (2)!\n" +
                "print(json.dumps(output_schema))  # (2)!\n";

            console.log("codeeee", pythonCode + schemaSnippet)
        const messages = await PythonShell.runString(pythonCode + schemaSnippet, null)
        return messages
    },

    async 'functions.fetchCode'(functionFile) {
        const link = `https://gitlab.informatik.uni-wuerzburg.de/api/v4/projects/19733/repository/files/${functionFile}/raw?ref=t_main&private_token=${Meteor.settings.GITLAB_ACCESS_TOKEN}`
        const res = await fetch(link);
        const functionCode = await res.text();
        return functionCode

        //
        // const headers = new Headers();
        //
        // const codeRequest = new Request(gitlab_link, {
        //     headers: headers
        // }
        // )
        // console.log(codeRequest.headers)
        // const res = await fetch(codeRequest);
        // const functionCode = await res.text();
        // console.log(res)
        // return functionCode
    }

    // 'tasks.setIsChecked'(taskId, isChecked) {
    //     check(taskId, String);
    //     check(isChecked, Boolean);
    //
    //     if (!this.userId) {
    //         throw new Meteor.Error('Not authorized.');
    //     }
    //
    //     TasksCollection.update(taskId, {
    //         $set: {
    //             isChecked
    //         }
    //     });
    // }
});