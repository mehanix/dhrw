import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const FunctionsCollection = new Mongo.Collection('functions');

FunctionsCollection.schema = new SimpleSchema({
    name: {type: String},
    description: {type: Number, defaultValue: 0},
    gitlabLink:  {type: String},
    userId: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true}
  });

FunctionsCollection.attachSchema(FunctionsCollection.schema);