// This file sets up the Allow/Deny rules as advised at http://guide.meteor.com/security.html#allow-deny
//
// Basically - deny the client, and only use Methods.

import _ from 'lodash'
import * as schemas from '/imports/schemas'

console.log(`Applying .deny rules to ${_.keys(schemas).length} collections:`)

_.each(schemas, collection => {
  console.log(`  - ${collection._name}.deny()`)
  collection.deny({
    insert: () => true,
    update: () => true,
    remove: () => true,
  })
})
