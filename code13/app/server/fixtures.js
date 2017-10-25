import _ from 'lodash'
import { Accounts } from 'meteor/accounts-base'
import { Users } from '/imports/schemas'
import { roleSuperAdmin } from '/imports/schemas/roles'

export function createUsers() {
  console.log('Creating global admin user from fixtures.js')
  const users = [
    {
      name: 'SuperAdmin',
      email: 'super@admin.com',
      roles: roleSuperAdmin,
      teamId: '!system',
      teamName: '!system',
    },
  ]

  _.each(users, function(user) {
    let id

    id = Accounts.createUser({
      email: user.email,
      username: user.name,
      password: 'apple1', // TODO: make this something a bit safer
      profile: {
        name: user.name,
      },
    })

    Users.update(id, {
      $set: {
        permissions: [
          // See roles.js
          {
            teamId: user.teamId,
            teamName: user.teamName,
            roles: [user.roles],
          },
        ],
      },
    })
    console.log(id + ' Admin user created')
  })

  // TODO: Something like Sysvars.insert( { deploymentName: 'prod00', deploymentVersion: 'TBD'})
}
