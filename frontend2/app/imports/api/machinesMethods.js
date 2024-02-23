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

        docker.run('mp-nicoleta-datahive_worker_1', [], process.stdout, {
            "HostConfig": {
                "NetworkMode": "mp-nicoleta-datahive_datahive_net"
            }

        }).then(function(data) {
            var output = data[0];
            var container = data[1];
            console.log(output);
            // return container.remove();
        })

        // return MachinesCollection.insert()
    },

    'machines.remove'(machineId) {
        check(machineId, String);

        if (!this.userId) {
            throw new Meteor.Error('Not authorized.');
        }

        MachinesCollection.remove(machineId);
    },

    'machines.bind'(nodeData) {

    },

    'machines.getAvailable'() {
        return MachinesCollection.filter({"attachedTo":null}).fetch()
    }

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