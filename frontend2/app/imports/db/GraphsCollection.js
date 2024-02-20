import { Mongo } from 'meteor/mongo';
import SimpleSchema from "simpl-schema";

export const GraphsCollection = new Mongo.Collection('graphs');

// GraphsCollection.schema = new SimpleSchema({
//     name: {type: String, optional: false},
//     status: {type: String},
//     userId: {type: String}, //todo stricter checking,
//     data:{type: Object}
// });
//
// GraphsCollection.attachSchema(GraphsCollection.schema, {transform: true});