import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FunctionsCollection } from '../db/FunctionsCollection';
import {GraphsCollection} from "../db/GraphsCollection";
// import { Gitlab } from '@gitbeaker/rest';
import 'dotenv/config'

console.log("env", process.env)
Meteor.methods({
    'graphs.insert'(graphObject) {
        // GraphsCollection.rawCollection().drop();
        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }

        const id = GraphsCollection.insert(graphObject)
        return id
    },

    'graphs.remove'(id) {
        check(id, String);

        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }

        GraphsCollection.remove(id);
    },

    'graph.updateNodes'({_id, nodes}) {
        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }
        return GraphsCollection.update(_id, {
        $set: {
            "data.nodes": nodes
        }
        })
    },

    'graph.updateEdges'({_id, edges}) {
        // GraphsCollection.rawCollection().drop();
        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }
        return GraphsCollection.update(_id, {
            $set: {
                "data.edges": edges
            }
        })
    },

    'graph.golive'(graph) {
        console.log("GRAPH INFO ==================")

        const availableMachines = Meteor.call("machines.getAvailableCount")

        console.log("[Meteor] Available machines:", availableMachines)
        // start more machines if needed
        // if (graph.data.nodes.length > availableMachines) {
        //     Meteor.call("machines.scaleup", graph.data.nodes.length)
        // }

        // const gitlabApi = new Gitlab({
        //     token: process.env.GITLAB_ACCESS_TOKEN,
        // });

        const formatSourceTargetEdge = (edge => {
            const [sourceFunction, sourceTitle, sourceType] = edge.sourceHandle.split('.')
            const [targetFunction, targetTitle, targetType] = edge.targetHandle.split('.')
            return  {
                sourceArgument: {
                    nodeId: edge.source,
                    function: sourceFunction,
                    name: sourceTitle,
                    datatype: sourceType
                },
                targetArgument: {
                    nodeId: edge.target,
                    function: targetFunction,
                    name: targetTitle,
                    datatype: targetType
                }
            }

        })

        // queue nodes to be picked up by machines
        for (let node of graph.data.nodes) {
            const nodeInfo = {
                graphId: graph._id,
                nodeId: node.id,
                functionId: node.data._id,
                userId: node.data.userId,
                inputEdges:graph.data.edges
                    .filter(edge => edge.source === node.id)
                    .map(edge => formatSourceTargetEdge(edge)),
                outputEdges:graph.data.edges
                    .filter(edge => edge.target === node.id)
                    .map(edge => formatSourceTargetEdge(edge))
            }

            Meteor.call("machines.bindRequest", nodeInfo)
        }
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