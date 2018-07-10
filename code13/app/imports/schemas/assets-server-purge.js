import { Azzets, PurgedAzzets } from '/imports/schemas'
import { Match, check } from 'meteor/check'
import { checkMgb } from './checkMgb'

//
// MGB ASSETS - SERVER-ONLY CODE  (PURGE-related functionality)
// This file must be imported by main_server.js so that the Meteor method can be registered
//

// Currently, this is VERY conservative.. It moves Assets to a PurgedAzzets table that
// has no other use.    Later, when we are confident the purge is a reasonable system we
// could just skip the move to PurgedAzzets and do a cheaper Azzets.remove() query.. but
// the only real reason to do that would be excessive scale problems.. so best to leave this
// as-is for now.
const SHORTEST_PURGE_AGE_DAYS = 14

// TODO: We can have orphaned chats in Chats.js.. there could be a lazy process to
// get rid of these ONCE no-one has them pinned any more.

Meteor.methods({
  //
  // ASSET PURGE
  //
  // Parameters are in an { opts } object:
  //   opts.purgeIfUntouchedForNumDays      // Required Number
  //   opts.isDryRun                        // Required Boolean
  //   opts.assetOwnerName                  // Optional String. If null, or "" then all users' assets are in scope
  //  e.g. Meteor.call("Azzets.Purge", { purgeIfUntouchedForNumDays: 14, isDryRun: false, assetOwnerName: '' })

  'Azzets.Purge'(opts = {}) {
    checkMgb.checkUserIsSuperAdmin()
    check(opts, Object)
    check(opts.purgeIfUntouchedForNumDays, Match.Integer)
    check(opts.isDryRun, Boolean)
    check(opts.assetOwnerName, Match.Optional(String))

    if (opts.purgeIfUntouchedForNumDays < SHORTEST_PURGE_AGE_DAYS)
      throw new Meteor.Error(401, `Choose a purgeIfUntouchedForNumDays >= ${SHORTEST_PURGE_AGE_DAYS} days`)

    const now = new Date()
    const purgeDate = new Date(now - 1000 * 60 * 60 * 24 * opts.purgeIfUntouchedForNumDays)

    const sel = {
      isDeleted: true,
      updatedAt: { $lt: purgeDate },
    }
    if (opts.assetOwnerName && opts.assetOwnerName !== '') sel.dn_ownerName = opts.assetOwnerName

    const azCursor = Azzets.find(sel)
    const toPurgeCount = azCursor.count()
    let numPurgedCount = 0

    console.log(
      `Azzets.Purge() found ${toPurgeCount} items to be purged that have not been updated for ${opts.purgeIfUntouchedForNumDays} days `,
    )

    if (opts.isDryRun == false) {
      // We are doing it!
      azCursor.forEach(function(doc) {
        console.log(`#${doc._id}: OwnerId=${doc.ownerId}  Ownername='${doc.dn_ownerName}' name='${doc.name}'`)
        doc._purgeJobDate = now

        PurgedAzzets.insert(doc, function(err, res) {
          if (err) console.log(`PurgedAzzets.insert(${doc._id}): Error = `, err)
          else console.log(`PurgedAzzets.insert(${doc._id}): Insert succeeded as `, res)
        })
        if (doc.isDeleted === false)
          throw new Meteor.Error(
            404,
            'Azzets.Purge(): Item no longer seems to be deleted. IT IS NOT PARANOIA WHEN I HAPPENS...',
          )
        Azzets.remove({ _id: doc._id })
        numPurgedCount++
      })
    }
    console.log(`PurgedAzzets DB contains ${PurgedAzzets.find().count()} items`)

    return { toPurgeCount, numPurgedCount, opts, now, purgeDate }
  },
})
