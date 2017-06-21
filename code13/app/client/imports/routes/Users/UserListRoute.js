import _ from 'lodash'
import React, { PropTypes} from 'react'
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { Button, Divider, Container, Segment } from 'semantic-ui-react'
import { Users } from '/imports/schemas'
import { userSorters } from '/imports/schemas/users'

import Spinner from '/client/imports/components/Nav/Spinner'
import UserList from '/client/imports/components/Users/UserList'

export default UserListRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes : {
    renderVertical:     PropTypes.bool.isRequired,    // Optional. Default is false. See below.
    initialLimit:       PropTypes.number.isRequired,  // Optional. Default is 21. See below.
    excludeUserIdsArray: PropTypes.array,             // Optional. If provided, exclude these id's. Useful for situations like add friend/member (to exclude existing ones)
    handleClickUser:    PropTypes.func,               // Optional. If provided, call this with the userId instead of going to the user Profile Page
    isTopLevelRoute:    PropTypes.bool                // Useful so routes can be re-used for embedding.  If false, they can turn off toolbars/headings etc as appropriate
  },

  getDefaultProps: function() {
    return {
      renderVertical: false,
      initialLimit: 50
    }
  },

  getInitialState: function() {
    return {
      userLimit: this.props.initialLimit,
      searchName: "",
      userSort: "badges"                 // Must be one of the keys of userSorters. TODO: Implement select UI for this
    }
  },

  getMeteorData() {
    const { searchName, userLimit, userSort } = this.state
    let handle = Meteor.subscribe("users.byName", searchName, userLimit, userSort)
    let selector = {}
    if (searchName && searchName.length > 0)
    {
      // Using regex in Mongo since $text is a word stemmer. See https://docs.mongodb.com/v3.0/reference/operator/query/regex/#op._S_regex
      selector["profile.name"]= {$regex: new RegExp("^.*" + searchName, 'i')}
    }

    let findOpts = { sort: userSorters[userSort] }
    if (userLimit)
      findOpts["limit"] = userLimit    // Paginated users. Kinda cheezy but ok for now since we have search

    return {
      users: Meteor.users.find(selector, findOpts).fetch(),
      loading: !handle.ready()
    };
  },

  componentDidMount() {
    window.addEventListener('keydown', this.listenForEnter)
  },

  componentWillUnmount() {
    window.removeEventListener('keydown', this.listenForEnter)
  },

  listenForEnter: function(e) {
    e = e || window.event
    if (e.keyCode === 13)
      this.handleSearchGo()
  },

  handleSearchGo: function()
  {
    // TODO: Changing the Users collection is causing the page to be redrawn. Find a way to avoid that. A cheesy way is to exclude the current user's record, but there may be something smarter to do
    const $button = $(this.refs.searchGoButton)
    $button.removeClass("orange")
    this.setState( {searchName: this.refs.searchNameInput.value } )
  },

  /**
   * Make it clear that the search icon needs to be pushed while editing the search box
   * I could do this with React, but didn't want to since search triggers a few changes already
   */
  handleSearchNameBoxChanges() {
    // mark if the button needs to be pushed
    const $button = $(this.refs.searchGoButton)
    if  (this.refs.searchNameInput.value !== this.state.searchName)
      $button.addClass("orange")
    else
      $button.removeClass("orange")
  },

  // TODO: Pagination is simplistic. Needs work to append users instead of refreshing whole list

  render() {
    const { excludeUserIdsArray, renderVertical, handleClickUser, isTopLevelRoute } = this.props
    let filteredUsers = excludeUserIdsArray
                          ? _.filter(this.data.users, u => { return !_.includes(excludeUserIdsArray, u._id) })
                          : this.data.users

    const containerClassName = renderVertical ? "" : "ui segments"
    const searchSegmentStyle = renderVertical ? {} : {  minWidth:"220px", maxWidth:"220px" }   // TODO(@dgolds): Move magic number to special globals or pass down?
    const narrowItem = !!renderVertical
    const segClass = renderVertical ? "" : "ui basic segment"
    const killBordersStyle = { borderStyle: "none", boxShadow: "none" }
    const Body = (
      <div className={containerClassName} style={killBordersStyle}>
        <div className={segClass} style={searchSegmentStyle}>
          <div className="ui fluid action input">
            <input  type="text"
                    placeholder="Search users..."
                    defaultValue={this.state.searchName}
                    onChange={this.handleSearchNameBoxChanges}
                    ref="searchNameInput"
                    size="16"></input>
            <button className="ui icon button" ref="searchGoButton" onClick={this.handleSearchGo}>
              <i className="search icon"></i>
            </button>
          </div>
          <br></br>
        </div>

        <div className={segClass} >
          { this.data.loading ? <Spinner /> :
            <div>
              <UserList users={filteredUsers} handleClickUser={handleClickUser} narrowItem={narrowItem}/>
              <Divider hidden/>
              { filteredUsers.length === this.state.userLimit &&
              <Button onClick={this.handleLoadMore}>
                Showing first {filteredUsers.length} matching users.  Click to load more...
              </Button>
              }
            </div>
          }
        </div>
      </div>
    )

    return Body
  },

  handleLoadMore() {
    this.setState({userLimit: this.state.userLimit + 20})
  }
})
