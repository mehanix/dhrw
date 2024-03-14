import { Meteor } from 'meteor/meteor';
import { ProcessedWorkCollection } from '/imports/db/ProcessedWorkCollection';

Meteor.publish('processed_work', function publishFunctions() {
    return ProcessedWorkCollection.find({});//userId: this.userId
});
