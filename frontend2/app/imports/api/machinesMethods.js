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
        },{}, function (err, data, container) {
            if (err) throw err;
        })    .on('container', Meteor.bindEnvironment((container) => {
            console.log("sau asta", container.id)
            MachinesCollection.insert({
                "dockerId": container.id
            })
        }))

            .on('stream', (stream) => {
                stream.on('data', data => console.log("\nmachine ", ":", data.toString()));
            })
            .on('data', (data) => {
                console.log('data', data);
            })
            .on('err', (err) => {
                console.log('err', err);
            }) //TODO. if container dies remove from database. how?
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
        return MachinesCollection.filter({"nodeId":null}).fetch()
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