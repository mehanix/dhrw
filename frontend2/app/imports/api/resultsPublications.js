import { Meteor } from 'meteor/meteor';
import { ResultsCollection } from '/imports/db/ResultsCollection';


Meteor.publish('results', function publishResults(graphId) {
    return ResultsCollection.find({"graphId":graphId});
});