import { Mongo } from 'meteor/mongo';
import SimpleSchema from "simpl-schema";

export const ResultsCollection = new Mongo.Collection('results');

ResultsCollection.schema = new SimpleSchema({
    userId:{type:String},
    graphId:{type: String},
    timestamp:{type: Date},
    batchId:{type:Number},
    data:{type:String}, // tries to base64 decode, if not, e .toString()
})

ResultsCollection.attachSchema(ResultsCollection.schema, {transform: true});