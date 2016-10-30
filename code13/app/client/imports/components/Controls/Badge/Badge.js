import _ from 'lodash'
import React, { PropTypes } from 'react'
import { isUserSuperAdmin } from '/imports/schemas/roles'

export const badgeList = {
//mgb1veteran:      [ "v2/anvil.png",               'MGB1 Veteran' ],
  mgbAdmin:         [ "v2/beginner/anvil.png",      'MGB Admin' ],
//hasAvatar:        [ "Has Avatar.png",             'Has an Avatar' ],
  mgb2AlphaTester:  [ "v2/beginner/bugfinder.png",  "Found a good MGB2 bug / is Alpha Tester" ],

//hourOfMap:        [ 'v2/beginner/hourofmap.png',  'Hour+ of Mapping' ],
//hourOfCode:       [ 'v2/beginner/hourofcode.png', 'Hour+ of Coding' ],
  hourOfDrawing:    [ 'v2/beginner/hourofdrawing.png', 'Hour+ of Drawing' ],
  hourOfSound:      [ 'v2/beginner/hourofsound.png', 'Hour+ of Sound Making' ],

  tenHours  :       [ 'v2/beginner/tenhours.png',    'Ten Hours+ of Building' ],

  guruCode:         [ 'v2/guru/code.png',           'Official MGB Code Guru'],
  guruArt:          [ 'v2/guru/art.png',            'Official MGB Art Guru'],
  guruMusic:        [ 'v2/guru/music.png',          'Official MGB Music Guru'],

  blank:            [ "Empty Badge slot.png",       "Space for another badge" ]
}

const mgb2AlphUserCutoffDate = new Date("Dec 01 2016")

export const getImplicitBadgesForUser = function(user) {
  let retval = []

// QUICK HACK TO TEST BADGES
  if (_.includes('dgolds,stauzs,guntis'.split(','), user.profile.name))
    retval.push('guruCode')

  if (_.includes('dgolds,stauzs,guntis,Supergirl,Micah'.split(','), user.profile.name))
  {
    retval.push('hourOfDrawing')
    retval.push('tenHours')
  }

  if (_.includes('dgolds,guntis'.split(','), user.profile.name))
    retval.push('guruMusic')

  if (_.includes('Micah'.split(','), user.profile.name))
    retval.push('guruArt')

  isUserSuperAdmin(user) && retval.push('mgbAdmin')
//  user.profile.mgb1name && user.profile.mgb1name.length > 0 && retval.push("mgb1veteran")
//  user.profile.avatar && user.profile.avatar.length > 0 && retval.push("hasAvatar")   // TODO: Fix this - it's wrong since we always do the gravatar hash
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
  return <img style={{ maxWidth: '64px', maxHeight: '64px' }} className='image' src={imgUrl} title={title} {...size} />
}

Badge.propTypes = {
  name:       PropTypes.string.isRequired,
  forceSize:  PropTypes.number              // Width to force badge image to (in pixels)
}

export default Badge