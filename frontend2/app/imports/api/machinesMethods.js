import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { MachinesCollection } from '../db/MachinesCollection';
import Docker from 'dockerode'
import {publish, publishh} from "../../server/main";

const docker = new Docker();
Meteor.methods({

    /**
     * Spawns a new machine.
     * */
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
            console.log("[docker] created:", container.id)
        }))
        .on('stream', (stream) => {
            stream.on('data', data => console.log("\n", data.toString()));
        })
        .on('data', (data) => {
            console.log('data', data);
        })
        .on('err', (err) => {
            console.log('err', err);
        })
    },

    /**
     * Drop all machines from logs that have not sent a heartbeat after timestamp
     * This is run periodically to ensure dead machines disappear from the DB
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
     * @param machine info about the machine, incl. timestamp and availability status
     */
    'machines.heartbeat'(machine) {
        const result = MachinesCollection.upsert(
            {_id:machine._id},
            {$set: {
                heartbeat:machine.heartbeat,
                is_busy: machine.is_busy ? 1 : 0 // what is going on here..... bug in either mongo or meteor
                }
        })

        if ("insertedId" in result) {
            // console.log("[Meteor] New machine ", machine._id, " showed up in heartbeats. Adding to Mongo")
        } else {
            // console.log("[Meteor] Machine ", machine._id," sent heartbeat. Is busy:", machine.is_busy)
        }

    },

    /**
     * Remove machine from DB. This is usually sent when the machine signals it closes gracefully.
     * @param machineId
     */
    'machines.remove'(machineId) {
        check(machineId, String);

        const removed = MachinesCollection.remove(machineId);
        console.log("[Meteor] removed", machineId, "from DB")

    },

    /**
     * Send a node to the workers queue to be picked up by one of the workers.
     * The worker that picks it up will send a bindResponse via server_responses.bindResponse
     * which will update the record in the DB.
     * */
    'machines.bindRequest'([graphId, nodeData]) {
        console.log("request to bind", graphId, nodeData)
        // publishh("task.up", {})
    },

    'machines.getAvailableCount'() {
        const result = MachinesCollection.find({"is_busy":0}).count()
        console.log(result, "machines available")
        return result
    },

    /**
     * Scale number of available machines by at least @param minToAdd machines.
     * */
    'machines.scaleup'(minToAdd) {

        // adding a buffer, rounding up to nearest tenth.
        // if not needed/not used, will be cleaned up.
        // is this a good idea?

        const willAdd = (minToAdd / 10 + 1) * 10
        console.log("[Meteor] adding ", willAdd, "machines")
        for (let i=0; i<willAdd; i++) {
            Meteor.call("machines.create")
        }

    },

    /**
     * Preserve resources by shutting down unused machines if they are too many.
     * For now, just keep (machines_in_use) + buffer machines live.
     * Runs periodically.
     * TODO.
     * */
    'machines.scaledown'() {

    }
});