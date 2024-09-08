import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FunctionsCollection } from '../db/FunctionsCollection';
import {GraphsCollection} from "../db/GraphsCollection";
import {publish, publishh} from "../../server/main";

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

    'graph.updateStatus'(_id, status) {
        console.log(_id, status)
        return GraphsCollection.update(_id, {
            $set: {
                "status": status
            }
        })
    },

    'graph.setNodeStatus'(graphId, nodeId, status) {
        console.log(graphId,nodeId,status)
        const graph = GraphsCollection.findOne(graphId)
        console.log(graph)
        for (let i = 0; i< graph.data.nodes.length; i++) {
            const node = graph.data.nodes[i]
            if (node.id === nodeId) {
                const key = `data.nodes.${i}.data`

                console.log(key)
                GraphsCollection.update(graphId, {
                    $set: {[key]:status}
                })
            }
        }

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
        console.log("Going live....")
        Meteor.call("graph.updateStatus", graph._id, "loading")

        const availableMachines = Meteor.call("machines.getAvailableCount")

        console.log("[Meteor] Available machines:", availableMachines)
        // start more machines if needed
        if (graph.data.nodes.length > availableMachines) {
            console.log("[Meteor] Not enough machines available. Scaling up!")
            Meteor.call("machines.scaleup", graph.data.nodes.length)
        }
        /** Edges have a ton of info in react-flow, we only need these fields for the machines to work */
        const formatSourceTargetEdge = (edge => {

            const [sourceFunction, sourceTitle, sourceType] = edge.sourceHandle.split('.')
            const [targetFunction, targetTitle, targetType] = edge.targetHandle.split('.')
            return  {
                sourceArgument: {
                    nodeId: edge.source,
                    functionId: sourceFunction,
                    name: sourceTitle,
                    datatype: sourceType
                },
                targetArgument: {
                    nodeId: edge.target,
                    functionId: targetFunction,
                    name: targetTitle,
                    datatype: targetType
                }
            }

        })

        /** queue nodes to be picked up by machines */
        /** Extracts data necessary for machine to run from node, filters out rendering info */

        for (let node of graph.data.nodes) {
            console.log("Going live:",node.data.name)
            const nodeInfo = {
                graphId: graph._id,
                nodeId: node.id,
                functionId: node.data._id,
                userId: node.data.userId,
                code: node.data.code,
                name: node.data.name,
                inputEdges:graph.data.edges
                    .filter(edge => edge.target === node.id)
                    .map(edge => formatSourceTargetEdge(edge)),
                outputEdges:graph.data.edges
                    .filter(edge => edge.source === node.id)
                    .map(edge => formatSourceTargetEdge(edge))
            }
            Meteor.callAsync("machines.bindRequest", nodeInfo)
            // console.log("\n")
            Meteor.call("graph.updateStatus", graph._id, "online")

        }
    },
    async 'graph.godown'(graph) {
        Meteor.call("machines.killGraph", graph._id)
        Meteor.call("graph.updateStatus", graph._id, "offline")
    }

});

//TODO: on drag n drop functie din repo in graf ia codul si salveaza l in nod!
