import { Mongo } from 'meteor/mongo';
import SimpleSchema from "simpl-schema";

export const MachinesCollection = new Mongo.Collection('machines');

MachinesCollection.schema = new SimpleSchema({
    dockerId:{type: String}
});