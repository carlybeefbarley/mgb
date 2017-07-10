import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Link, browserHistory } from 'react-router'
import urlMaker from './urlMaker'
import { clearPriorPathsForJoyrideCompletionTags } from '/client/imports/routes/App'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import is from 'is_js'

// TODO   Implement some  <QLink nav="..."> cases to clean up code

function isLeftClickEvent(event) {
  return event.button === 0
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.ctrlKey || event.shiftKey)  // alt is handled specially in handleClick()
}

function createLocationDescriptor(to, _ref) {
  var query = _ref.query;
  var hash = _ref.hash;
  var state = _ref.state;

  if (query || hash || state) {
    return { pathname: to, query: query, hash: hash, state: state };
  }

  return to;
}


// BUGBUG/TODO: WARN when there are query params on the to: field
//   e.g. http://v2.mygamebuilder.com/user/iCyqxrbq8K9oLGx7h/project/i6b87vSCfEubkmhFf?_fp=activity&_np=nav then click 'View Project Assets'
// The correct action for the caller is to have a query=object prop instead of using ?



// This is a Query-aware Link that adds some MGB-related smarts to the standard
// React Router <Link> as documented at https://github.com/reactjs/react-router/blob/master/docs/API.md#link

// This QLink has the following additional capabilities
//
// 1. Any app-wide query params that should be preserved (see urlMaker.getCrossAppQueryParams() )

export default QLink = React.createClass({


// propTypes are same as from node_modules/react-router/es6/Link.js
  propTypes: {
//  to:                   PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,   // The click href
//  altTo:                PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,   // The alt-click href

    query:                PropTypes.object,
//  altQuery:             PropTypes.object,       // The alt-click query
    hash:                 PropTypes.string,
    state:                PropTypes.object,
    activeStyle:          PropTypes.object,
    activeClassName:      PropTypes.string,
//  onlyActiveOnIndex:    PropTypes.bool.isRequired,
    onClick:              PropTypes.func,
    target:               PropTypes.string,
    elOverride:           PropTypes.oneOfType([PropTypes.string,PropTypes.object])  // eg "div"
  },

  getDefaultProps: function () {
    return {
//  onlyActiveOnIndex: false,
      style: {}
    };
  },


  contextTypes: {
    urlLocation: React.PropTypes.object,
    router:  React.PropTypes.object,
    tabs: React.PropTypes.object
  },

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
  handleClick: function (event) {
    const p = this.props

    const appScopedQuery = urlMaker.getCrossAppQueryParams(this.context.urlLocation.query)

    if (event.target && event.target.id && event.target.id.startsWith('mgbjr-'))
      joyrideCompleteTag(event.target.id.replace(/^mgbjr-/, 'mgbjr-CT-'))

    if (p.onClick)
      p.onClick(event)    // Call the click handler we were given. Note that it has the option to preventDefault()

    if (
         event.defaultPrevented === true  // p.OnClick() handler preventedDefault processing, that includes us.
      || isModifiedEvent(event)           // Dont handle clicks with Shift, Meta, Ctrl etc  -- leave to Browser
      || (event.altKey && !p.altTo)       // Don't handle Alt key - unless we have been told to have an override
      || !isLeftClickEvent(event)         // Don't handle other mouse buttons
      || p.target)                        // there is a target such as _blank, so just jump to it, no fancy stuff
      return      // Browser needs to handle this. It's beyond our scope. (TODO ideally we could still monkey patch the query?)

    // resolve any modifiers to select altTo/AltQuery etc
    const modifiedTo = ( (event.altKey && p.altTo) ? p.altTo : p.to ) || window.location.pathname
    const modifiedQuery = (event.altKey && p.altTo) ? p.altQuery : p.query
    // Todo AltHash if needed

    // Combine the links' query with special appScoped query params we want to preserve such as _np= (this is all decided in urlMaker.js)
    const combinedQuery = Object.assign({}, appScopedQuery, modifiedQuery)

    // TODO: Decode p.nav to p.to here also.. or use something else
    const location = createLocationDescriptor(modifiedTo, { query: combinedQuery, hash: p.hash, state: p.state })

    // This is in support of the joyride/tutorial infrastructure to edge-detect page changes
    clearPriorPathsForJoyrideCompletionTags()

    if (is.mobile()) {
      if(!this.context.tabs)
        return
      this.context.tabs.setLocation(location, this.props.tab)
    }
    else
      this.context.router.push(location)

    event.preventDefault()    // Stop Link.handleClick from doing anything further
    event.stopPropagation()

  },

  render: function () {
    const p = this.props
    const chosenEl = p.elOverride ? p.elOverride : Link
    const pClean = _.omit(p, ["elOverride", "altTo", "altQuery"])

    if (!p.nav)
      return React.createElement(chosenEl, Object.assign({}, pClean, { onClick: this.handleClick }))

    // Now try the             <QLink nav="users" className="item"></QLink> variant

    let newTo = "", newText = ""
    switch (p.nav) {
    case "users":
      newTo = urlMaker.pathTo("/users")
      newText = "_Users"
      break
    default:
      console.error(`Unknown case for QLink nav="${p.nav}"`)
      break
    }

    return React.createElement(
                      chosenEl,
                      Object.assign({}, pClean, { to: newTo, onClick: this.handleClick }),
                      <span>{newText}</span>)
  }

})

// This is from https://www.sitepoint.com/get-url-parameters-with-javascript/
function _getDefaultUrlQueryParams()
{
  // get query string from url (optional) or window
  var queryString = window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      // paramName = paramName.toLowerCase();
      // paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj
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
export function utilPushTo(existingQuery, newTo, extraQueryParams = {})
{
  const appScopedQuery = urlMaker.getCrossAppQueryParams(existingQuery || _getDefaultUrlQueryParams())
  const location = createLocationDescriptor(newTo, { query: Object.assign( {}, appScopedQuery, extraQueryParams) } )

  // This is in support of the joyride/tutorial infrastructure to edge-detect page changes
  clearPriorPathsForJoyrideCompletionTags()

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
export function utilReplaceTo(existingQuery, newTo, extraQueryParams = {})
{
  const appScopedQuery = urlMaker.getCrossAppQueryParams(existingQuery || _getDefaultUrlQueryParams())
  const location = createLocationDescriptor(newTo, { query: Object.assign( {}, appScopedQuery, extraQueryParams) } )

  // This is in support of the joyride/tutorial infrastructure to edge-detect page changes
  clearPriorPathsForJoyrideCompletionTags()

  browserHistory.replace(location)
}


/**
 * Show a flex Panel (given the chatChanel nav.subnav strings)
 * @param {*} currentUrlLocation from something like window.location
 * @param {*} chatChannelName as defined in chats:makeChannelName()
 */
export function utilShowFlexPanel(currentUrlLocation, newFpNavString)
{
  utilPushTo(currentUrlLocation.query, currentUrlLocation.pathname, { _fp: newFpNavString } )
}

/**
 *
 * @param {*} currentUrlLocation from something like window.location
 * @param {*} chatChannelName as defined in chats:makeChannelName()
 */
export function utilShowChatPanelChannel(currentUrlLocation, chatChannelName)
{
  utilShowFlexPanel(currentUrlLocation, 'chat.'+chatChannelName )
}
