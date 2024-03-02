import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import '/imports/api/functionsMethods';
import '/imports/api/functionsPublications';
import '/imports/api/graphsMethods';
import '/imports/api/graphsPublications';
import '/imports/api/machinesMethods';
import '/imports/api/machinesPublications';
const amqplib = require('amqplib');
const queue = 'server_responses';

const SEED_USERNAME = 'datahive';
const SEED_PASSWORD = 'example';
const HEARTBEAT_TIMEOUT_MS = 30000

Meteor.startup(() => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }
  const user = Accounts.findUserByUsername(SEED_USERNAME);

  Meteor.setInterval(() => {
    const date = Date.now() - HEARTBEAT_TIMEOUT_MS
    console.log("[Meteor] cleaning up unresponsive/nonexistent machine IDs from DB... with timestamp less than", date)
    Meteor.call("machines.cleanup", date)
  }, HEARTBEAT_TIMEOUT_MS)


});



(async () => {
  const conn = await amqplib.connect('amqp://localhost');

  const ch1 = await conn.createChannel();
  await ch1.assertQueue(queue);

  // Listener
  ch1.consume(queue, Meteor.bindEnvironment((msg) => {
    if (msg !== null) {
      console.log("[Meteor] Received message:", msg.content.toString(), msg.fields.routingKey);
      const message_object = JSON.parse(msg.content)
      switch (msg.fields.routingKey) {
          case "worker_reply.up":
            Meteor.call("machines.heartbeat", message_object._id, message_object.heartbeat)
            break
          case "worker_reply.down":
            Meteor.call("machines.remove", message_object._id)

            break
          default:
            console.log("ERROR, unknown routing key ", msg.fields.routingKey)
        }
        ch1.ack(msg);
    } else {
      console.log('Consumer cancelled by server');
    }
  }));

  // Sender
  // const ch2 = await conn.createChannel();
  //
  // setInterval(() => {
  //   ch2.sendToQueue(queue, Buffer.from('something to do'));
  // }, 1000);
})();

// amqplib.connect('amqp://guest:guest@localhost/', (err, conn) => {
//   if (err) throw err;
//
//   // Listener
//   conn.createChannel((err, ch2) => {
//     if (err) throw err;
//
//     ch2.assertQueue(queue);
//
//     ch2.consume(queue, Meteor.bindEnvironment((msg) => {
//       if (msg !== null) {
//         console.log("Received message:", msg.content.toString(), msg.fields.routingKey);
//
//         switch (msg.fields.routingKey) {
//           case "worker_reply.up":
//             Meteor.call("machines.heartbeat", msg.content)
//             break
//           case "worker_reply.down":
//             Meteor.call("machines.remove", msg.content._id)
//             break
//           default:
//             console.log("ERROR, unknown routing key ", msg.fields.routingKey)
//         }
//         ch2.ack(msg);
//       } else {
//         console.log('Consumer cancelled by server');
//       }
//     }));
//   });
//
// });