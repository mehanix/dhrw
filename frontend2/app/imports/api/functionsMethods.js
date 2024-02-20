import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { FunctionsCollection } from '../db/FunctionsCollection';

Meteor.methods({
    'functions.insert'(functionObject) {

        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }

        return FunctionsCollection.insert(functionObject)
    },

    'functions.remove'(functionId) {
        check(functionId, String);

        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }

        FunctionsCollection.remove(functionId);
    },

    // 'tasks.setIsChecked'(taskId, isChecked) {
    //     check(taskId, String);
    //     check(isChecked, Boolean);
    //
    //     if (!this.userId) {
    //         throw new Meteor.Error('Not authorized.');
    //     }
    //
    //     TasksCollection.update(taskId, {
    //         $set: {
    //             isChecked
    //         }
    //     });
    // }
});