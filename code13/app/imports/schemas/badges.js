import _ from 'lodash'
import { isUserSuperAdmin } from '/imports/schemas/roles'

// Helper functions for Badges. These mostly require a user object from users.js
//  getAllBadgesForUser(user) gets list of user's badges (returns array of keys into badgeList)

const _mgb2AlphaUserCutoffDate = new Date("Dec 31 2016")

export const badgeList = {
//mgb1veteran:      [ "v2/anvil.png",               'MGB1 Veteran' ],
  mgbAdmin:         [ "v2/beginner/anvil.png",      'MGB Admin' ],
  hasAvatar:        [ "Has Avatar.png",             'Has an Avatar' ],
  mgb2AlphaTester:  [ "v2/beginner/bugfinder.png",  "Found a good MGB bug / is Alpha Tester" ],

//hourOfMap:        [ 'v2/beginner/hourofmap.png',  'Hour+ of Mapping' ],
//hourOfCode:       [ 'v2/beginner/hourofcode.png', 'Hour+ of Coding' ],
  hourOfDrawing:    [ 'v2/beginner/hourofdrawing.png', 'Hour+ of Drawing' ],
  hourOfSound:      [ 'v2/beginner/hourofsound.png', 'Hour+ of Sound Making' ],

  tenHours:         [ 'v2/beginner/tenhours.png',    'Ten Hours+ of Building' ],

  guruCode:         [ 'v2/guru/code.png',           'Official MGB Code Guru'],
  guruArt:          [ 'v2/guru/art.png',            'Official MGB Art Guru'],
  guruMusic:        [ 'v2/guru/music.png',          'Official MGB Music Guru'],

  // This is a special case just to make it easier to generate some UI consistently
  _blankBadge:      [ "Empty Badge slot.png",       "Space for another badge" ]
}

const _validUserBadgeNames = _.without(_.keys(badgeList), '_blankBadge')

const _getImplicitBadgesForUser = user => {
  let retval = []

// QUICK HACKS TO TEST INITIAL BADGES
  if (_.includes('dgolds,stauzs,guntis'.split(','), user.profile.name))
    retval.push('guruCode')

  if (_.includes('dgolds,stauzs,guntis,Supergirl,Micah'.split(','), user.profile.name))
  {
    retval.push('hourOfDrawing')
    retval.push('tenHours')
  }

  if (_.includes('dgolds,guntis'.split(','), user.profile.name))
    retval.push('guruMusic')

  if (_.includes('Micah,Supergirl'.split(','), user.profile.name))
    retval.push('guruArt')

  isUserSuperAdmin(user) && retval.push('mgbAdmin')
//  user.profile.mgb1name && user.profile.mgb1name.length > 0 && retval.push("mgb1veteran")
  user.createdAt < _mgb2AlphaUserCutoffDate && retval.push("mgb2AlphaTester")

  return retval
}


const _validateBadgeKeyArray = badges => _.every(badges, b => _.includes(_validUserBadgeNames, b))

export const getAllBadgesForUser = user => {
  const userBadges = [ 
    ..._getImplicitBadgesForUser(user), 
    ...(user.badges || [])
  ]

  if (!_validateBadgeKeyArray(userBadges))
    console.error(`Unexpected badgeKey in list: ${userBadges.join(',')}`)

  return userBadges
}


/**
 * hasBadge()
 * 
 * @export
 * @param {any} user
 * @param {string} badgeString
 * @returns {boolean} 
 */
export const hasBadge = (user, badgeString) => (user ? _.includes(user.badges, badgeString) : false)