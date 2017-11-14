import React from 'react'

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

    showToast(
      <ul>
        <li>{result.filter(Boolean).map(getFriendlyName)}</li>
      </ul>,
      { title: `You got ${result.length > 1 ? 'some badges' : 'a badge'}!` },
    )
  })
}

export default refreshBadgeStatus
