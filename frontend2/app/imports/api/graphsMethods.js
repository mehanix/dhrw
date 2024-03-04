import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FunctionsCollection } from '../db/FunctionsCollection';
import {GraphsCollection} from "../db/GraphsCollection";

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
        if (graph.data.nodes.length > availableMachines) {
            Meteor.call("machines.scaleup", graph.data.nodes.length)
        }

        // queue up nodes to be picked up by machines
        for (let node of graph.data.nodes) {
            Meteor.call("machines.bindRequest", [graph._id, node])
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