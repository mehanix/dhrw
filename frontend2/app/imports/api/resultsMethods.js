import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ResultsCollection } from '../db/ResultsCollection';

Meteor.methods({
    'results.remove'(resultId) {
        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }

        ResultsCollection.remove(resultId);
    },
});
