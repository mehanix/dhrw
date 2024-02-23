import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import '/imports/api/functionsMethods';
import '/imports/api/functionsPublications';
import '/imports/api/graphsMethods';
import '/imports/api/graphsPublications';
import '/imports/api/machinesMethods';
// import '/imports/api/machinesPublications';

const SEED_USERNAME = 'datahive';
const SEED_PASSWORD = 'example';
Meteor.startup(() => {
  if (!Accounts.findUserByUsername(SEED_USERNAME)) {
    Accounts.createUser({
      username: SEED_USERNAME,
      password: SEED_PASSWORD,
    });
  }
  const user = Accounts.findUserByUsername(SEED_USERNAME);
});