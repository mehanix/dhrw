import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FunctionsCollection } from '../db/FunctionsCollection';
import {GraphsCollection} from "../db/GraphsCollection";

Meteor.methods({
    'graphs.insert'(graphObject) {
        // GraphsCollection.rawCollection().drop();
        console.log("gro", graphObject)
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
        console.log(_id, nodes)
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