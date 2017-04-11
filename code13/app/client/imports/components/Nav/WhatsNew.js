import React, { PropTypes } from 'react'
import mgbReleaseInfo from '/imports/mgbReleaseInfo'
import QLink from '/client/imports/routes/QLink'

// Would be nice to do something like http://thejoyofux.tumblr.com/post/85707480676/the-wolf-of-trello-presenting-rew-features-in-a

const _latestRelTimestamp = mgbReleaseInfo.releases[0].timestamp

const WhatsNew = ( { currUser, asHidingLink } ) => {
  const laterNewsAvailable = currUser && currUser.profile && currUser.profile.latestNewsTimestampSeen !== _latestRelTimestamp
  const hilite = laterNewsAvailable ? 'orange' : ''
  const iconEl = <i className={hilite + ' info circle icon'} />

  if (asHidingLink)
    return !laterNewsAvailable ? null :
      <QLink
          to='/whatsnew'
          title='Announcements of new features/fixes to MGB'
          className='fitted item'>
        <i className='orange large info circle icon' />
      </QLink>

  return iconEl
}

WhatsNew.propTypes = {
  currUser:       PropTypes.object,                 // Can be null (if user is not logged in)
  asHidingLink:   PropTypes.bool                    // If true then render as null or <Qlink> depending on last seen
}

export default WhatsNew
