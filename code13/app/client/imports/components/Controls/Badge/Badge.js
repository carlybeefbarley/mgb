import React, { PropTypes } from 'react';
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
  user.profile.avatar && user.profile.avatar.length > 0 && retval.push("hasAvatar")
  user.createdAt < mgb2AlphUserCutoffDate && retval.push("mgb2AlphaTester")

  return retval
}

export const getAllBadgesForUser = function(user) {
  return [ 
    ...getImplicitBadgesForUser(user), 
    ...(user.profile.badges || [])
  ]
}


export default Badge = React.createClass({
  propTypes : {
    name: PropTypes.string.isRequired
  },  

  render: function()
  {
    const badge = badgeList[this.props.name] || ["Unknown.png", `Badge "${this.props.name} not recognised`]
    const imgUrl = "/images/badges/" + badge[0]
    const title = badge[1]
    return <img src={imgUrl} title={title}/>
  }
})