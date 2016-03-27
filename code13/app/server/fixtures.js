/* global Accounts */
import {Users} from '../imports/schemas';

export function createUsers() {
  console.log('Creating global admin user from fixtures.js');
  const users = [{
        name: 'Super Admin User',
        email: 'super@admin.com',
        roles: 'super-admin',
        teamId: '!system',
        teamName: '!system'
      }];

  _.each(users, function (user) {
    let id

    id = Accounts.createUser({
      email: user.email,
      password: "apple1",     // TODO: make this something a bit safer
      profile: {
        name: user.name
      }
    });
    Meteor.users.update(id, {
      $push: {
        permissions: {
          teamId: user.teamId,
          teamName: user.teamName,
          roles: [user.roles]
        }
      }
    });
    console.log(id + ' Admin user created');
  });
}
