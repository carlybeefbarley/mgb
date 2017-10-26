import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { getDisplayName } from '/client/imports/hocs/hocUtils'

// When copying the Store API to the component, these properties are ignored.
const IGNORE_STORE_PROPERTIES = {
  // Ignored JS class properties
  constructor: true,

  // Ignored store base class properties
  __storeListeners: true,
  storeWillReceiveState: true,
  storeWillUpdate: true,
  storeDidUpdate: true,
  setState: true,
  subscribe: true,
  unsubscribe: true,
}

/**
 * Injects store state into your component props and updates on store change.
 *
 * @example
 * import { joyrideStore } from '/client/imports/stores'
 *
 * const JoyrideProgress = ({ joyride }) => (
 *   <div>{joyride.state.stepIndex}/{joyride.state.steps.length}</div>
 * )
 *
 * export default withStores({
 *   joyride: joyrideStore,
 * })(JoyrideProgress)
 *
 * @param {object} stores - Maps store state to props. Keys are prop names and values are stores.
 * @returns {function}
 */
const withStores = stores => WrappedComponent => {
  // One handler for every store
  // Handlers update component state on store change
  const handlers = {}
  const displayName = getDisplayName(WrappedComponent)

  class WithStores extends Component {
    state = {}

    static displayName = displayName

    constructor(...args) {
      super(...args)

      // create an API from the store to map to the wrapped component's prop
      _.forEach(stores, (store, propName) => {
        const storeName = store.constructor.name
        // console.log('CHECK', storeName)

        // set initial state from store.state (synchronous set is safe in the constructor)
        // eslint-disable-next-line react/no-direct-mutation-state
        this.state[propName] = {}

        // copy store methods and properties
        _.forEach(store, (val, key) => {
          // console.log('  -', key)
          if (IGNORE_STORE_PROPERTIES[key]) {
            // console.log('    ... SKIP', key, ' ...ignored')
            return
          }

          // eslint-disable-next-line react/no-direct-mutation-state
          this.state[propName][key] = val
        })

        // console.log('    ... API', this.state[propName])

        // set propTypes for the mapped prop
        _.set(WrappedComponent, `propTypes.${propName}`, PropTypes.shape(store.constructor.storeShape))

        // create a handler for store changes and subscribe to future changes
        handlers[propName] = state => {
          const newState = {
            [propName]: {
              ...this.state[propName],
              state: {
                ...this.state[propName].state,
                ...state,
              },
            },
          }
          console.log(`${displayName} updated: withStores({ ${propName}: ${storeName} })`, {
            oldState: { ...this.state[propName].state },
            newState: { ...newState[propName].state },
          })
          this.setState(newState)
        }
        store.subscribe(handlers[propName])
      })
    }

    componentWillUnmount() {
      _.forEach(stores, (store, propName) => {
        store.unsubscribe(handlers[propName])
        delete handlers[propName]
      })
    }

    render() {
      return <WrappedComponent {...this.state} {...this.props} />
    }
  }

  return WithStores
}

export default withStores
