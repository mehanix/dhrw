import { Meteor } from 'meteor/meteor';
import { GraphsCollection } from '/imports/db/GraphsCollection';

Meteor.publish('graphs', function publishFunctions() {
    return GraphsCollection.find({});//userId: this.userId
});

// Meteor.publish('graphById', function publishFunctions() {
//     const result = GraphsCollection.find({})
//     return result
// });