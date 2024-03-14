import { Mongo } from 'meteor/mongo';
import SimpleSchema from "simpl-schema";

export const ProcessedWorkCollection = new Mongo.Collection('processed_work');

ProcessedWorkCollection.schema = new SimpleSchema({
    graphId:{type: String},
    graphNodeId:{type: String},
    functionId:{type: String},
    batchId:{type: String},
    batchData:{type: String},
    createdAt:{type: Number}
});

ProcessedWorkCollection.attachSchema(ProcessedWorkCollection.schema, {transform: true});

ProcessedWorkCollection.createIndex( { "createdAt": 1 }, {expireAfterSeconds: 3600 } )
