import React, { PropTypes } from 'react'
import { isUserSuperAdmin } from '/imports/schemas/roles'

const badgeList = {
  mgb1veteran:      [ "Veteran Game Builder.png",   "MGB1 Veteran" ],
  mgbAdmin:         [ "Metaclaw Admin.png",         "MGB Admin" ],
  mgb2AlphaTester:  [ "MGB2 Alpha Tester.png",      "MGB2 Alpha Tester" ],
  hasAvatar:        [ "Has Avatar.png",             "Has an Avatar!" ],
  blank:            [ "Empty Badge slot.png",       "Space for another badge!" ]
}

const mgb2AlphUserCutoffDate = new Date("Dec 01 2016")

export const getImplicitBadgesForUser = function(user) {
  let retval = []

  isUserSuperAdmin(user) && retval.push("mgbAdmin")
  user.profile.mgb1name && user.profile.mgb1name.length > 0 && retval.push("mgb1veteran")
  user.profile.avatar && user.profile.avatar.length > 0 && retval.push("hasAvatar")         // TODO: Fix this - it's wrong since we always do the gravatar hash
  user.createdAt < mgb2AlphUserCutoffDate && retval.push("mgb2AlphaTester")

  return retval
}

export const getAllBadgesForUser = function(user) {
  return [ 
    ...getImplicitBadgesForUser(user), 
    ...(user.profile.badges || [])
  ]
}

const Badge = props => 
{
  const { name, forceSize } = props
  const badge = badgeList[name] || ["Unknown.png", `Badge "${name} not recognised`]
  const imgUrl = "/images/badges/" + badge[0]
  const title = badge[1]
  const size = forceSize ? ({ width: `${forceSize}px`, height: `${forceSize}px`}) : ({})
  return <img src={imgUrl} title={title} {...size} />
}

Badge.propTypes = {
  name:       PropTypes.string.isRequired,
  forceSize:  PropTypes.number              // Width to force badge image to (in pixels)
}

export default Badge