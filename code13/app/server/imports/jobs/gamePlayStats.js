import { Meteor } from 'meteor/meteor'
import { Azzets } from '/imports/schemas'
import { logActivity } from '/imports/schemas/activity'

Meteor.methods({
  'job.gamePlayStats.playGame'(assetId) {
    let username = this.userId ? Meteor.user().profile.name : '<guest>'
    console.log(
      '[PlayGame]  Request To Increment PlayCount for ',
      assetId,
      username,
      this.connection.clientAddress,
    )

    const game = Azzets.findOne(assetId)

    if (!game) throw new Meteor.Error(404, 'Asset not found')

    if (game.kind !== 'game') throw new Meteor.Error(404, 'Asset is not a game object')

    const newPlayCount = (game.metadata.playCount || 0) + 1
    const recordsUpdated = Azzets.update(assetId, { $set: { 'metadata.playCount': newPlayCount } })

    console.log(
      `  [PlayGame]  (${recordsUpdated})  #${assetId}  Owner=${game.dn_ownerName}  NewPlayCount=${newPlayCount}`,
    )

    logActivity('game.play.start', 'Play game', null, game)

    return newPlayCount
  },
})
