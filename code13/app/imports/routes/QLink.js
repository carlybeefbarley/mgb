import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import urlMaker from './urlMaker';

// TODO   Implement some  <QLink nav="..."> cases to clean up code

function isLeftClickEvent(event) {
  return event.button === 0
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
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

// This is a Query-aware Link that adds some MGB-related smarts to the standard 
// React Router <Link> as documented at https://github.com/reactjs/react-router/blob/master/docs/API.md#link

// This QLink has the following additional capabilities
// 
// 1. Any app-wide query params that should be preserved (see urlMaker.getCrossAppQueryParams() )

export default QLink = React.createClass({


// propTypes are same as from node_modules/react-router/es6/Link.js
  propTypes: {
//    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    query: PropTypes.object,
    hash: PropTypes.string,
    state: PropTypes.object,
    activeStyle: PropTypes.object,
    activeClassName: PropTypes.string,
    onlyActiveOnIndex: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
    target: PropTypes.string
  },
  
  getDefaultProps: function () {
    return {
      onlyActiveOnIndex: false,
      style: {}
    };
  },
  
    
  contextTypes: {
    urlLocation: React.PropTypes.object,
    router:  React.PropTypes.object
  },
  
  /** This click handler will be called by the <Link> we create. 
   *  This click handler effectively overrides from the handleClick() in node_modules/react-router/es6/Link.js
   *  since that calls us and we then disable it with event.preventDefault()
   */
  handleClick: function (event) {
    const p = this.props

    // TODO: Might need to merge in props.query some time
    const appScopedQuery = urlMaker.getCrossAppQueryParams(this.context.urlLocation.query)
    
    if (p.onClick) 
      p.onClick(event)    // Call the click handler we were given. Note that it has thr option to preventDefault()
      
    if (event.defaultPrevented === true || isModifiedEvent(event) || !isLeftClickEvent(event) || p.target) 
      return;             // Browser needs to handle this. It's new window / new tab etc so beyond our scope. // TODO ideally we could still mokey patch the query? 

// TODO: Decode p.nav to p.to here also.. or use something else
    const location = createLocationDescriptor(p.to, { query: appScopedQuery, hash: p.hash, state: p.state });
    this.context.router.push(location);
    event.preventDefault()    // Stop Link.handleClick from doing anything further
  },

  render: function render() {
    const p = this.props

    if (!p.nav)
      return React.createElement(Link, Object.assign({}, p, { onClick: this.handleClick }))


    // Now try the             <QLink nav="users" className="item"></QLink> variant

    let newTo = "", newText = ""
    switch (p.nav) {
    case "users":
      newTo = urlMaker.pathTo("/users")
      newText = "_Users"
      break
    default:
      console.trace(`Unknown case for QLink nav="${p.nav}"`)      
      break;
    }

    return React.createElement(
                      Link, 
                      Object.assign({}, p, { to: newTo, onClick: this.handleClick }),
                      <span>{newText}</span>)
  }
  
})

