import { Mongo } from 'meteor/mongo';
import SimpleSchema from "simpl-schema";

export const MachinesCollection = new Mongo.Collection('machines');

// GraphsCollection.schema = new SimpleSchema({
//     name: {type: String, optional: false},
//     status: {type: String},
//     userId: {type: String}, //todo stricter checking,
//     data:{type: Object}
// });

MachinesCollection.schema = new SimpleSchema({
    // dockerId: {type: String},
    graphId:{type: String, optional:true},
    nodeId:{type: String, optional:true},
    functionCode:{type: String, optional:true},
    heartbeat:{type: Number},
    is_busy:{type: Number}
});

MachinesCollection.attachSchema(MachinesCollection.schema, {transform: true});