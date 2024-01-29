import { Meteor } from 'meteor/meteor';
import { FunctionsCollection } from '/imports/db/FunctionsCollection';

Meteor.publish('functions', function publishFunctions() {
    return FunctionsCollection.find({ userId: this.userId });
});