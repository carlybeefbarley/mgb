import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Link, browserHistory } from 'react-router-dom'
import urlMaker from './urlMaker'
import { joyrideStore } from '/client/imports/stores'

const isLeftClickEvent = e => e.button === 0
const hasModiferKeys = e => !!(e.metaKey || e.ctrlKey || e.shiftKey)

const createLocationDescriptor = (to, { query, hash, state }) => {
  if (query || hash || state) {
    return { pathname: to, query, hash, state }
  }

  return to
}

// BUGBUG/TODO: WARN when there are query params on the to: field
//   e.g. http://v2.mygamebuilder.com/user/iCyqxrbq8K9oLGx7h/project/i6b87vSCfEubkmhFf?_fp=activity&_np=nav then click 'View Project Assets'
// The correct action for the caller is to have a query=object prop instead of using ?

// This is a Query-aware Link that adds some MGB-related smarts to the standard
// React Router <Link> as documented at https://github.com/reactjs/react-router/blob/master/docs/API.md#link

// This QLink has the following additional capabilities
//
// 1. Any app-wide query params that should be preserved (see urlMaker.getCrossAppQueryParams() )

class QLink extends React.Component {
  static contextTypes = {
    urlLocation: PropTypes.object,
    router: PropTypes.object,
  }

  static propTypes = {
    /** The alt-click href */
    altTo: PropTypes.string,

    /** The alt-click query */
    altQuery: PropTypes.object,

    /** eg "div", MyComponent */
    elOverride: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    // `nav` logic was not used in the codebase
    // adding an error log for analytics tracking just in case a usage was missed
    nav(props, propName, componentName) {
      if (props[propName] !== undefined) {
        return new Error(`\`nav\` is not implemented, see ${componentName}`)
      }
    },

    // <Link /> props
    ...Link.propTypes,
  }

  static defaultProps = {
    onlyActiveOnIndex: true,
    activeClassName: 'active',
    elOverride: Link,
  }

  /** This click handler will be called by the <Link> we create.
   *  This click handler effectively overrides from the handleClick() in node_modules/react-router/es6/Link.js
   *  since that calls us and we then disable it with event.preventDefault()
   *
   *  Any explicit original key/value pairs in props.query will override the app-scoped params so this can be
   *  used to change NavPanels and FlexPanels for example
   *
   * In orded to simplify tutorial development, we also file mgbjr-CT-
   * joyrideCompletionTags if the item had an id=mgbjr-.*
   */
  handleClick = event => {
    const { altTo, altQuery, hash, onClick, state, query, target, to = window.location.pathname } = this.props

    const appScopedQuery = urlMaker.getCrossAppQueryParams(this.context.urlLocation.query)

    if (event.target && event.target.id && event.target.id.startsWith('mgbjr-')) {
      joyrideStore.completeTag(event.target.id.replace(/^mgbjr-/, 'mgbjr-CT-'))
    }

    // Call the click handler we were given. Note that it has the option to preventDefault()
    if (onClick) onClick(event)

    const shouldIgnore =
      event.defaultPrevented === true || // `onClick` handler preventedDefault processing, that includes us.
      hasModiferKeys(event) || // Dont handle clicks with Shift, Meta, Ctrl etc  -- leave to Browser
      (event.altKey && !altTo && !altQuery) || // Don't handle Alt key - unless we have been told to have an override
      !isLeftClickEvent(event) || // Don't handle other mouse buttons
      target !== undefined // there is a target such as _blank, so just jump to it, no fancy stuff

    // Browser needs to handle this. It's beyond our scope.
    // TODO ideally we could still monkey patch the query?
    if (shouldIgnore) return

    // resolve any modifiers to select altTo/AltQuery etc
    const modifiedTo = event.altKey && altTo ? altTo : to
    const modifiedQuery = event.altKey && altQuery ? altQuery : query

    // Combine the links' query with special appScoped query params we want to preserve such as _np= (this is all decided in urlMaker.js)
    const combinedQuery = { ...appScopedQuery, ...modifiedQuery }

    const location = createLocationDescriptor(modifiedTo, { query: combinedQuery, hash, state })

    this.context.router.push(location)
    event.preventDefault() // Stop Link.handleClick from doing anything further
    event.stopPropagation()
  }

  render() {
    const { elOverride, ...rest } = this.props
    delete rest.altTo
    delete rest.altQuery

    if (elOverride !== Link) {
      _.forEach(Link.propTypes, (val, key) => {
        delete rest[key]
      })
    }

    return React.createElement(elOverride, { ...rest, onClick: this.handleClick })
  }
}

export default QLink

// This is from https://www.sitepoint.com/get-url-parameters-with-javascript/
function _getDefaultUrlQueryParams() {
  // get query string from url (optional) or window
  var queryString = window.location.search.slice(1)

  // we'll store the parameters here
  var obj = {}

  // no query, we're done
  if (!queryString) return obj

  // stuff after # is not part of query string, so get rid of it
  queryString = queryString.split('#')[0]

  // split our query string into its component parts
  var arr = queryString.split('&')

  for (let i = 0; i < arr.length; i++) {
    // separate the keys and the values
    var a = arr[i].split('=')

    // in case params look like: list[]=thing1&list[]=thing2
    var paramNum = undefined
    var paramName = a[0].replace(/\[\d*\]/, function(v) {
      paramNum = v.slice(1, -1)
      return ''
    })

    // set parameter value (use 'true' if empty)
    var paramValue = typeof a[1] === 'undefined' ? true : a[1]

    // (optional) keep case consistent
    // paramName = paramName.toLowerCase();
    // paramValue = paramValue.toLowerCase();

    // if parameter name already exists
    if (obj[paramName]) {
      // convert value to array (if still string)
      if (typeof obj[paramName] === 'string') {
        obj[paramName] = [obj[paramName]]
      }
      // if no array index number specified...
      if (typeof paramNum === 'undefined') {
        // put the value on the end of the array
        obj[paramName].push(paramValue)
      } else {
        // if array index number specified...
        // put the value at that index number
        obj[paramName][paramNum] = paramValue
      }
    } else {
      // if param name doesn't exist yet, set it
      obj[paramName] = paramValue
    }
  }

  return obj
}

/**
 * Opens asset by given id
 * @param assetId
 */
export const openAssetById = assetId => {
  utilPushTo(null, '/assetEdit/' + assetId)
}

/**
 * This is a replacement for browserHistory.push(). Use this when you want to add an
 * additional step into the browser history
 *
 * @export
 * @param {Object} existingQuery from something like context.urlLocation.query
 * (or window.location.search parsed into an object as above in _getDefaultUrlQueryParams()
 * It is parameterized here instead of just using window.location.query in order to
 * support a future tab concept *within* an MGB page. Uses of null (which becomes window.location.search)
 * by the caller are tech debt against that future goal
 * @param {string} newTo newUrl to go to
 * @param {Object} [extraQueryParams={}] extra query params to apply
 */
export function utilPushTo(existingQuery, newTo, extraQueryParams = {}) {
  const appScopedQuery = urlMaker.getCrossAppQueryParams(existingQuery || _getDefaultUrlQueryParams())
  const location = createLocationDescriptor(newTo, {
    query: { ...appScopedQuery, ...extraQueryParams },
  })

  browserHistory.push(location)
}

/**
 * This is a replacement for browserHistory.replace(). Use this when you DO NOT
 * want to add an additional step into the browser history - for example from a redirect
 * See #225 for examples of cases that need to use this.
 *
 * @param {Object} existingQuery from something like window.location.query.
 * It is parameterized here instead of just using window.location.query in order to
 * support a tab concept *within* an MGB page. Uses of window.location.query by the
 * caller are tech debt against that future goal
 * @param {string} newTo newUrl to go to
 * @param {Object} [extraQueryParams={}] extra query params to apply
 */
export function utilReplaceTo(existingQuery, newTo, extraQueryParams = {}) {
  const appScopedQuery = urlMaker.getCrossAppQueryParams(existingQuery || _getDefaultUrlQueryParams())
  const location = createLocationDescriptor(newTo, {
    query: { ...appScopedQuery, ...extraQueryParams },
  })

  browserHistory.replace(location)
}

/**
 * Show a flex Panel (given the chatChanel nav.subnav strings)
 * @param {*} currentUrlLocation from something like window.location
 * @param {*} chatChannelName as defined in chats:makeChannelName()
 */
export function utilShowFlexPanel(currentUrlLocation, newFpNavString) {
  utilPushTo(currentUrlLocation.query, currentUrlLocation.pathname, { _fp: newFpNavString })
}

/**
 *
 * @param {*} currentUrlLocation from something like window.location
 * @param {*} chatChannelName as defined in chats:makeChannelName()
 */
export function utilShowChatPanelChannel(currentUrlLocation, chatChannelName) {
  utilShowFlexPanel(currentUrlLocation, 'chat.' + chatChannelName)
}
