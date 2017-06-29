// This file sets up the Allow/Deny rules as advised at http://guide.meteor.com/security.html#allow-deny
//
// Basically - deny the client, and only use Methods.


import { Users, Azzets, Projects, Flags, Activity, ActivitySnapshots, Chats, Settings, Sysvars, Skills, PurgedAzzets } from '/imports/schemas'

const _doDenies = (collectionObjectsArray) => {
  const deniedNames = []
  _.each(collectionObjectsArray, c => {
    deniedNames.push(c._name)
    c.deny({
      insert() { return true; },
      update() { return true; },
      remove() { return true; }
    })
  })
  console.log(`Applied .deny rules to ${deniedNames.length} Collections: ${deniedNames.join(', ')}`)
}


_doDenies([ Users, Azzets, Projects, Activity, ActivitySnapshots, Chats, Settings, Sysvars, Skills, PurgedAzzets, Flags ])
