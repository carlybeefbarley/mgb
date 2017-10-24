import _ from 'lodash'
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

import { adjectives, animals } from './username-words'
import validate from '/imports/schemas/validate'

/**
 * Generates a user name irrespective of validation and uniqueness.
 *
 * @param {object} [opts]
 * @param {object} [opts.addDigits] - Whether or not to append digits to the end of the username.
 * @returns {string}
 */
const makeUsername = (opts = {}) => {
  let username = _.camelCase([_.sample(adjectives), _.sample(animals)])

  return opts.addDigits ? username + _.random(0, 99, false) : username
}

/**
 * Generates usernames until a valid name is found.
 *
 * @param {object} [opts]
 * @param {object} [opts.addDigits] - Whether or not to append digits to the end of the username.
 * @returns {string}
 */
const makeValidUsername = opts => {
  let username = makeUsername(opts)

  while (validate.usernameWithReason(username)) {
    username = makeUsername(opts)
  }

  return username
}

/**
 * Generates valid usernames until a unique name is found.
 *
 * @returns {string}
 */
const makeUniqueUsername = () => {
  let username = makeValidUsername()
  let attempts = 1

  // ensure this name is not taken
  // append a number if we keep finding duplicates
  while (Accounts.findUserByUsername(username)) {
    username = makeValidUsername({ addDigits: ++attempts > 5 })
  }

  return username
}

/**
 * Client methods.
 */
Meteor.methods({
  'User.generateGuestUser'() {
    const username = makeUniqueUsername()
    return {
      username,
      email: username + '@example.com',
      profile: { name: username, isGuest: true },
      password: Random.secret(),
    }
  },
})
