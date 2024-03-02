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

        docker.run('mp-nicoleta-datahive_worker_1', [], null, {
            "HostConfig": {
                "NetworkMode": "mp-nicoleta-datahive_datahive_net"
            }
        },{}, function (err, data, container) {
            if (err) throw err;
        })    .on('container', Meteor.bindEnvironment((container) => {
            // console.log("sau asta", container.id)
            // MachinesCollection.insert({
            //     "dockerId": container.id
            // })
        }))
            //
            // .on('stream', (stream) => {
            //     stream.on('data', data => console.log("\nmachine ", ":", data.toString()));
            // })
            // .on('data', (data) => {
            //     console.log('data', data);
            // })
            // .on('err', (err) => {
            //     console.log('err', err);
            // })
    },

    /**
     * Drop all machines from logs that have not sent a heartbeat after timestamp
     * This is ran periodically
     * @param timestamp only keep machines with heartbeat timestamps at least this date
     * */
    'machines.cleanup'(timestamp) {
        check(timestamp, Number);

        const removed = MachinesCollection.remove({heartbeat: {$lt: timestamp}});

        //TODO: run docker to also stop them
        console.log("[Meteor] removed", removed, "machines after running machines.cleanup")
    },

    /**
     * Upsert operation. Update heartbeat.
     * If machine doesn't exist in DB yet, it will be added.
     * @param machineId id of machine to be updated
     * @param timestamp new timestamp when the machine was last heard from
     */
    'machines.heartbeat'(machineId, timestamp) {
        const result = MachinesCollection.upsert(
            {_id:machineId},
            {$set: {
                heartbeat:timestamp
                }
            })

        if ("insertedId" in result) {
            console.log("[Meteor] New ID ", machineId, " showed up in heartbeats. Adding new machine to Mongo")
        } else {
            console.log("[Meteor] Machine ", machineId," sent heartbeat and is still alive")
        }

    },


    'machines.remove'(machineId) {
        //todo Security?
        check(machineId, String);

        const removed = MachinesCollection.remove(machineId);
        console.log("[Meteor] removed ", removed, "machines after running machines.remove")

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