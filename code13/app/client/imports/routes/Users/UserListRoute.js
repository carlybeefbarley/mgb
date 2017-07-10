import _ from 'lodash'
import React, { PropTypes } from 'react'
import InputSearchBox from '/client/imports/components/Controls/InputSearchBox'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { Button, Divider } from 'semantic-ui-react'
import { userSorters } from '/imports/schemas/users'

import Spinner from '/client/imports/components/Nav/Spinner'
import UserList from '/client/imports/components/Users/UserList'

export default (UserListRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    renderVertical: PropTypes.bool.isRequired, // Optional. Default is false. See below.
    initialLimit: PropTypes.number.isRequired, // Optional. Default is 21. See below.
    excludeUserIdsArray: PropTypes.array, // Optional. If provided, exclude these id's. Useful for situations like add friend/member (to exclude existing ones)
    handleClickUser: PropTypes.func, // Optional. If provided, call this with the userId instead of going to the user Profile Page
    isTopLevelRoute: PropTypes.bool, // Useful so routes can be re-used for embedding.  If false, they can turn off toolbars/headings etc as appropriate
  },

  getDefaultProps: function() {
    return {
      renderVertical: false,
      initialLimit: 50,
    }
  },

  getInitialState: function() {
    return {
      userLimit: this.props.initialLimit,
      searchName: '',
      userSort: 'badges', // Must be one of the keys of userSorters. TODO: Implement select UI for this
    }
  },

  getMeteorData() {
    const { searchName, userLimit, userSort } = this.state
    let handle = Meteor.subscribe('users.byName', searchName, userLimit, userSort)
    let selector = {}
    if (searchName && searchName.length > 0) {
      // Using regex in Mongo since $text is a word stemmer. See https://docs.mongodb.com/v3.0/reference/operator/query/regex/#op._S_regex
      selector['profile.name'] = { $regex: new RegExp('^.*' + searchName, 'i') }
    }

    let findOpts = { sort: userSorters[userSort] }
    if (userLimit) findOpts['limit'] = userLimit // Paginated users. Kinda cheezy but ok for now since we have search

    return {
      users: Meteor.users.find(selector, findOpts).fetch(),
      loading: !handle.ready(),
    }
  },

  handleSearchGo: function(newSearchText) {
    // TODO: Changing the Users collection is causing the page to be redrawn. Find a way to avoid that. A cheesy way is to exclude the current user's record, but there may be something smarter to do
    this.setState({ searchName: newSearchText })
  },

  // TODO: Pagination is simplistic. Needs work to append users instead of refreshing whole list

  render() {
    const { excludeUserIdsArray, renderVertical, handleClickUser, isTopLevelRoute } = this.props
    let filteredUsers = excludeUserIdsArray
      ? _.filter(this.data.users, u => {
          return !_.includes(excludeUserIdsArray, u._id)
        })
      : this.data.users

    const containerClassName = renderVertical ? '' : 'ui segments'
    const searchSegmentStyle = renderVertical ? {} : { minWidth: '220px', maxWidth: '220px' } // TODO(@dgolds): Move magic number to special globals or pass down?
    const narrowItem = !!renderVertical
    const segClass = renderVertical ? '' : 'ui basic segment'
    const killBordersStyle = { borderStyle: 'none', boxShadow: 'none' }
    const Body = (
      <div className={containerClassName} style={killBordersStyle}>
        <div className={segClass} style={searchSegmentStyle} id="mgbjr-user-search-searchStringInput">
          <InputSearchBox
            size="small"
            fluid
            value={this.state.searchName}
            onFinalChange={this.handleSearchGo}
          />
        </div>

        <div className={segClass}>
          {this.data.loading
            ? <Spinner />
            : <div>
                <UserList users={filteredUsers} handleClickUser={handleClickUser} narrowItem={narrowItem} />
                <Divider hidden />
                {filteredUsers.length === this.state.userLimit &&
                  <Button onClick={this.handleLoadMore}>
                    Showing first {filteredUsers.length} matching users. Click to load more...
                  </Button>}
              </div>}
        </div>
      </div>
    )

    return Body
  },

  handleLoadMore() {
    this.setState({ userLimit: this.state.userLimit + 20 })
  },
}))
