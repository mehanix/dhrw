import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import '/imports/api/functionsMethods';
import '/imports/api/functionsPublications';
import '/imports/api/graphsMethods';
import '/imports/api/graphsPublications';
import '/imports/api/machinesMethods';
import '/imports/api/machinesPublications';
import '/imports/api/processedWorkMethods';
import '/imports/api/processedWorkPublications';

const amqplib = require('amqplib');
const queue = 'server_responses';


const SEED_USERNAME = 'datahive';
const SEED_PASSWORD = 'example';
const HEARTBEAT_TIMEOUT_MS = 30000

const conn = await amqplib.connect('amqp://guest:guest@rabbitmq/');
const ch1 = await conn.createChannel();
await ch1.assertQueue(queue);
let workers_channel = await conn.createChannel();
await workers_channel.assertExchange('workers', 'topic');
import { Gitlab } from 'gitlab';

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
    console.log("[Meteor] cleaning up obsolete machine IDs from DB with timestamp less than", date)
    Meteor.call("machines.cleanup", date)
  }, HEARTBEAT_TIMEOUT_MS)


});

(async () => {

  // Listener
  ch1.consume(queue, Meteor.bindEnvironment((msg) => {
    if (msg !== null) {
      const message_object = JSON.parse(msg.content)
      switch (msg.fields.routingKey) {
          case "worker_reply.up":
            Meteor.call("machines.heartbeat", message_object)
            break
          case "worker_reply.down":
            console.log("[Meteor] Received message:", msg.content.toString(), msg.fields.routingKey);
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

  // setInterval(() => {
  // }, 1000);
})();

export const publishh = async (routingKey, message) => {
    await workers_channel.publish("workers", routingKey, Buffer.from(message));
}

export const GitlabApi = new Gitlab({
  host: 'https://gitlab.informatik.uni-wuerzburg.de/',
  token: Meteor.settings.GITLAB_ACCESS_TOKEN
});
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