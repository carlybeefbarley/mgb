import React from 'react'
import { Icon, List } from 'semantic-ui-react'

import { showToast } from '/client/imports/modules'
import { getFriendlyName } from '/imports/schemas/badges'

const refreshBadgeStatus = () => {
  Meteor.call('User.refreshBadgeStatus', (err, result) => {
    if (err) {
      console.error('User.refreshBadgeStatus error', err)
      showToast.error("The server can't update your badges right now. We've been notified.")
      return
    }

    if (!result || result.length === 0) return console.log(`No new badges to award`)

    const friendlyNames = result.map(getFriendlyName).filter(Boolean)

    let msg
    let title

    if (friendlyNames.length === 1) {
      title = (
        <span>
          You got the <Icon name="trophy" />
          {friendlyNames[0]} badge!
        </span>
      )
    } else {
      title = `You got ${friendlyNames.length} badges!`
      msg = (
        <List inverted>
          {friendlyNames.map(name => <List.Item key={name} icon="trophy" header={name} />)}
        </List>
      )
    }

    showToast(msg, { title, timeout: 10000 })
  })
}

export default refreshBadgeStatus
