import { Meteor } from 'meteor/meteor';
import { MachinesCollection } from '/imports/db/MachinesCollection';

Meteor.publish('machines', function publishFunctions() {
    // GraphsCollection.rawCollection().drop();
    return MachinesCollection.find({});//userId: this.userId
});

// Meteor.publish('graphById', function publishFunctions() {
//     const result = GraphsCollection.find({})
//     return result
// });