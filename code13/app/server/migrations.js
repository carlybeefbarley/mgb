/**
 * Understand how schema migrations in Meteor work before editing this file.
 *
 * @see https://guide.meteor.com/collections.html#migrations
 */
import _ from 'lodash'
import { Migrations } from 'meteor/percolate:migrations'

import { Skills } from '/imports/schemas'
import SkillNodes, {
  makeDottedSkillKey,
  makeSlashSeparatedSkillKey,
} from '/imports/Skills/SkillNodes/SkillNodes'

Migrations.add({
  version: 1,
  name: 'Split code/js/basics skills into code/js/(intro|advanced)',
  up() {
    // SkillNodes starting with code/js/basics skills were split into code/js/(intro|advanced)
    // We need to update DB skill keys to match what is now in SkillNodes.
    //
    // 1. Loop all skill objects in the DB
    // 2. For each code/js/basics/* skill in the DB,
    //    find the matching skill in code/js/(intro|advanced) in SkillNodes
    // 3. $set the new "intro|advanced" DB skill path to the same value as the "basic" skill
    // 4. $unset the old "basic" skill path
    const codebaseKeys = _.keys(SkillNodes.$meta.map)

    Skills.find().forEach(dbSkills => {
      const modifier = {}

      _.forEach(dbSkills, (dbValue, dbKey) => {
        // we only need to migrate code/js/basics skills
        if (!_.startsWith(dbKey, 'code/js/basics/')) return

        const dottedDBKey = makeDottedSkillKey(dbKey)

        // find matching "basics" skill key in "intro|advanced"
        const newDottedKey = _.find(codebaseKeys, codebaseKey => {
          const oldCodebaseKey = codebaseKey.replace(/code\.js\.(intro|advanced)\./, 'code.js.basics.')

          return dottedDBKey === oldCodebaseKey
        })

        if (!newDottedKey) return

        _.merge(modifier, {
          $set: { [makeSlashSeparatedSkillKey(newDottedKey)]: dbValue },
          $unset: { [dbKey]: '' },
        })
      })

      if (!_.isEmpty(modifier)) {
        // dry run!
        // console.log(`Skills.update(${dbSkills._id}, ${JSON.stringify(modifier, null, 2)})`)

        // real deal!
        Skills.update(dbSkills._id, modifier)
      }
    })
  },
  down() {
    // Some SkillNodes starting with code/js/(intro|advanced) have been moved into code/js/basics
    // We need to update DB skill keys to match what is now in SkillNodes.
    //
    // 1. Loop all skill objects in the DB
    // 2. For each code/js/(intro|advanced) skill in the DB that does not exist
    //    in SkillNodes, it must have been a code/js/basics/* skill
    // 3. $set the new "basics" DB skill path to the same value as the "intro|advanced" skill
    // 4. $unset the old "intro|advanced" skill path
    Skills.find().forEach(dbSkills => {
      const modifier = {}

      _.forEach(dbSkills, (dbValue, dbKey) => {
        // we only need to migrate code/js/(intro|advanced) skills
        if (!/code\/js\/(intro|advanced)\//.test(dbKey)) return

        const dottedDBKey = makeDottedSkillKey(dbKey)

        // db key still exists in SkillNodes, do not need to migrate it
        if (SkillNodes.$meta.map[dottedDBKey]) return

        const newDottedKey = dottedDBKey.replace(/code\.js\.(intro|advanced)\./, 'code.js.basics.')

        _.merge(modifier, {
          $set: { [makeSlashSeparatedSkillKey(newDottedKey)]: dbValue },
          $unset: { [dbKey]: '' },
        })
      })

      if (!_.isEmpty(modifier)) {
        // dry run!
        console.log(`Skills.update(${dbSkills._id}, ${JSON.stringify(modifier, null, 2)})`)

        // real deal!
        // Skills.update(dbSkills._id, modifier)
      }
    })
  },
})

// Heads up!
//
// DO NOT run migrations on startup yet.
// Development happens against the production database, running migrations locally will hose prod data.
//
// Meteor.startup(() => {
//   Migrations.migrateTo('latest')
// })
