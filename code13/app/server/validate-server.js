import _ from 'lodash'
import swearjar from '/server/imports/swearjar/swearjar'

Meteor.methods({
  'Azzets.Name.isProfane'(text) {
    if (swearjar.profane(text))
      throw new Meteor.Error(
        401,
        `Asset name contains offensive/disrespectful words. Please avoid such words/topics here so that everyone is able to participate comfortably: '${text}'`,
      )
  },
})

Meteor.methods({
  'Azzets.Description.isProfane'(text) {
    if (swearjar.profane(text))
      throw new Meteor.Error(
        401,
        `Asset description contains offensive/disrespectful words. Please avoid such words/topics here so that everyone is able to participate comfortably: '${text}'`,
      )
  },
})
