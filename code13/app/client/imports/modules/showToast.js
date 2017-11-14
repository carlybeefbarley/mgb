import React from 'react'
import { NotificationManager } from 'react-notifications'
import { Button } from 'semantic-ui-react'

import QLink from '/client/imports/routes/QLink'

// low-level toast function used to implement showToast and its methods
const toast = (type = 'success', msg, opts = {}) => {
  const { title, timeout = 5000, callback, priority } = opts

  if (typeof opts === 'string') {
    console.error(`showToast no longer accepts a string type, call showToast.${type}() instead.`)
  }
  if (!msg && !title) {
    console.error('showToast called with no `title` and no `msg`:', { msg, title, timeout })
  }

  NotificationManager[type](msg, title, timeout, callback, priority)
}

/**
 * Convenience shortcut for showToast.success().
 *
 * @param {any} msg - The msg to show the user.
 * @param {object} [opts]
 * @param {object} [opts.title] - A title for the msg.
 * @param {object} [opts.timeout] - How many ms to stay on the screen.
 */
const showToast = (msg, opts) => showToast.success(msg, opts)

/**
 * Show a success toast to the user.
 *
 * @param {any} msg - The msg to show the user.
 * @param {object} [opts]
 * @param {object} [opts.title] - A title for the msg.
 * @param {object} [opts.timeout] - How many ms to stay on the screen.
 */
showToast.success = (msg, opts) => toast('success', msg, opts)

/**
 * Show a info toast to the user.
 *
 * @param {any} msg - The msg to show the user.
 * @param {object} [opts]
 * @param {object} [opts.title] - A title for the msg.
 * @param {object} [opts.timeout] - How many ms to stay on the screen.
 */
showToast.info = (msg, opts) => toast('info', msg, opts)

/**
 * Show a warning toast to the user.
 *
 * @param {any} msg - The msg to show the user.
 * @param {object} [opts]
 * @param {object} [opts.title] - A title for the msg.
 * @param {object} [opts.timeout] - How many ms to stay on the screen.
 */
showToast.warning = (msg, opts) => toast('warning', msg, opts)

/**
 * Show a error toast to the user.
 *
 * @param {any} msg - The msg to show the user.
 * @param {object} [opts]
 * @param {object} [opts.title] - A title for the msg.
 * @param {object} [opts.timeout] - How many ms to stay on the screen.
 */
showToast.error = (msg, opts) => {
  toast(
    'error',
    (msg || Meteor.user()) && (
      <div>
        {msg && <p>{msg}</p>}
        {Meteor.user() && (
          <p>
            <Button
              as={QLink}
              query={{ _fp: 'chat.G_MGBHELP_' }}
              basic
              inverted
              compact
              size="tiny"
              content="#mgb-help"
            />
            <Button
              as={QLink}
              query={{ _fp: 'chat.G_MGBBUGS_' }}
              basic
              inverted
              compact
              size="tiny"
              content="#mgb-bugs"
            />
          </p>
        )}
      </div>
    ),
    { timeout: 10000, ...opts },
  )
}

export default showToast
