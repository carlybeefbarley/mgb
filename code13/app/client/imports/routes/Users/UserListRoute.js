import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import InputSearchBox from '/client/imports/components/Controls/InputSearchBox'
import { browserHistory } from 'react-router'
import { withTracker } from 'meteor/react-meteor-data'
import { Button, Divider } from 'semantic-ui-react'
import { Users } from '/imports/schemas'
import { userSorters } from '/imports/schemas/users'

import Spinner from '/client/imports/components/Nav/Spinner'
import UserList from '/client/imports/components/Users/UserList'

// Default values for url?query - i.e. the this.props.location.query keys
const queryDefaults = {
  searchUserName: '', // Empty string means match all (more convenient than null for input box)
  sort: 'badges', // Must be one of the keys of userSorters. TODO: Implement select UI for this
  userLimit: 30,
}

/**  Returns the given query EXCEPT for keys that match a key/value pair in queryDefaults array
*/
const _stripQueryOfDefaults = queryObj => {
  var strippedQ = _.omitBy(queryObj, function(val, key) {
    return queryDefaults.hasOwnProperty(key) && queryDefaults[key] === val
  })
  return strippedQ
}

/**
 * queryNormalized() takes a location query that comes in via the browser url.
 *   Any missing or invalid params are replaced by defaults
 *   The result is a data structure that can be used without need for range/validity checking
 * @param q typically this.props.location.query  -  from react-router
*/
const _queryNormalized = (q = {}) => {
  // Start with defaults
  let newQ = _.clone(queryDefaults)
  // Validate and apply values from location query

  // query.sort
  if (userSorters.hasOwnProperty(q.sort)) newQ.sort = q.sort

  // query.limit
  if (q.limit) newQ.userLimit = _.toFinite(q.limit)

  // query.searchUserName
  if (q.searchUserName) newQ.searchUserName = q.searchUserName

  return newQ
}

class UserListRouteUI extends React.Component {
  static propTypes = {
    renderVertical: PropTypes.bool.isRequired, // Optional. Default is false. See below.
    excludeUserIdsArray: PropTypes.array, // Optional. If provided, exclude these id's. Useful for situations like add friend/member (to exclude existing ones)
    handleClickUser: PropTypes.func, // Optional. If provided, call this with the userId instead of going to the user Profile Page
    isTopLevelRoute: PropTypes.bool, // Useful so routes can be re-used for embedding.  If false, they can turn off toolbars/headings etc as appropriate
  }

  static defaultProps = {
    renderVertical: false,
  }

  /** helper Function for updating just a query string with react router
  */
  _updateLocationQuery = queryModifier => {
    let loc = this.props.location
    let newQ = Object.assign({}, loc.query, queryModifier)
    newQ = _stripQueryOfDefaults(newQ)
    // This is browserHistory.push and NOT utilPushTo() since we are staying on the same page
    browserHistory.push(Object.assign({}, loc, { query: newQ }))
  }

  handleSearchGo = newSearchText => this._updateLocationQuery({ searchUserName: newSearchText })

  handleLoadMore = () => {
    const qN = _queryNormalized(location.query)
    this._updateLocationQuery({ limit: qN.userLimit + 20 })
  }

  // TODO: Pagination is simplistic. Needs work to append users instead of refreshing whole list

  render() {
    const { excludeUserIdsArray, renderVertical, handleClickUser, isTopLevelRoute } = this.props
    const qN = _queryNormalized(location.query)

    let filteredUsers = excludeUserIdsArray
      ? _.filter(this.props.users, u => {
          return !_.includes(excludeUserIdsArray, u._id)
        })
      : this.props.users

    const containerClasses = !renderVertical ? 'ui basic segment' : ''
    const searchInputStyle = renderVertical ? {} : { minWidth: '220px', maxWidth: '220px' } // TODO(@dgolds): Move magic number to special globals or pass down?
    const narrowItem = !!renderVertical
    return (
      <div className={containerClasses}>
        <InputSearchBox
          id="mgbjr-user-search-searchStringInput"
          style={searchInputStyle}
          size="small"
          fluid
          value={qN.searchUserName}
          onFinalChange={this.handleSearchGo}
        />

        <Divider hidden />

        {this.props.loading ? (
          <Spinner />
        ) : (
          <div>
            <UserList users={filteredUsers} handleClickUser={handleClickUser} narrowItem={narrowItem} />
            <Divider hidden />
            {filteredUsers.length === qN.userLimit && (
              <Button onClick={this.handleLoadMore}>
                Showing first {filteredUsers.length} matching users. Click to load more...
              </Button>
            )}
          </div>
        )}
      </div>
    )
  }
}

const UserListRoute = withTracker(({ user, location, initialLimit }) => {
  const qN = _queryNormalized(location.query)
  const findOpts = {
    sort: userSorters[qN.sort],
  }
  if (qN.userLimit) findOpts['limit'] = qN.userLimit // Paginated users. Kinda cheezy but ok for now since we have search
  let handle = Meteor.subscribe('users.byName', qN.searchUserName, qN.userLimit, qN.sort)
  let selector = {}
  if (qN.searchUserName && qN.searchUserName.length > 0) {
    // Using regex in Mongo since $text is a word stemmer. See https://docs.mongodb.com/v3.0/reference/operator/query/regex/#op._S_regex
    selector['profile.name'] = { $regex: new RegExp('^.*' + qN.searchUserName, 'i') }
  }

  return {
    users: Users.find(selector, findOpts).fetch(),
    loading: !handle.ready(),
  }
})(UserListRouteUI)

export default UserListRoute
