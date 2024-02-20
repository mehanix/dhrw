import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { MachinesCollection } from '../db/MachinesCollection';
import Docker from 'dockerode'

const docker = new Docker();
Meteor.methods({
    'machines.create'() {

        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }

        docker.run('worker', [], process.stdout).then(function(data) {
            var output = data[0];
            var container = data[1];
            console.log(output.StatusCode);
            return container.remove();
        }).then(function(data) {
            console.log('container removed');
        }).catch(function(err) {
            console.log(err);
        });

        return MachinesCollection.insert()
    },

    'functions.remove'(functionId) {
        check(functionId, String);

        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }

        MachinesCollection.remove(functionId);
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