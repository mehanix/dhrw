import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import 'meteor/aldeed:collection2/static';

export const FunctionsCollection = new Mongo.Collection('functions');

FunctionsCollection.schema = new SimpleSchema({
    name: {type: String},
    description: {type: String},
    githubLink:  {type: String},
    inputSchema: {type: String},
    outputSchema: {type: String},
    userId: {type: String} //todo stricter checking
  });

FunctionsCollection.attachSchema(FunctionsCollection.schema, {transform: true});
