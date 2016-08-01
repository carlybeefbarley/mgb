import _ from 'lodash'
import React, {Component, PropTypes} from 'react'
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'

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
    hideTitle:          PropTypes.bool                // Optional. Default is false
  },


  getDefaultProps: function() {
    return {
      renderVertical: false,
      initialLimit: 21
    }
  },


  getInitialState: function() {
    return {
      userLimit: this.props.initialLimit,
      searchName: "",
      userSort: "createdNewest"                 // Must be one of the keys of userSorters. TODO: Implement select UI for this
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
    if (this.data.loading) 
      return <div><Spinner /></div>
    
    let xArray = this.props.excludeUserIdsArray
    let filteredUsers = xArray 
                          ? _.filter(this.data.users, u => { return !_.includes(this.props.excludeUserIdsArray, u._id) })
                          : this.data.users
 
    const containerClassName = this.props.renderVertical ? "ui segments" : "ui horizontal segments"
    const searchSegmentStyle = this.props.renderVertical ? {} : {  minWidth:"220px", maxWidth:"220px" }   // TODO(@dgolds): Move magic number to special globals or pass down?
    const narrowItem = !! this.props.renderVertical

    const killBordersStyle = { borderStyle: "none", boxShadow: "none", maxWidth: "700px" }                // TODO(@dgolds): Move magic number to special globals or pass down?
    return (
      <div className={containerClassName} style={killBordersStyle}>
        <div className="ui segment" style={searchSegmentStyle}>
          <div className="ui row">
            { this.props.hideTitle ? null : <div className="ui large header">Search Users</div> }
            <div className="ui action input">
              <input  type="text" 
                      placeholder="Search..." 
                      defaultValue={this.state.searchName} 
                      onChange={this.handleSearchNameBoxChanges}
                      ref="searchNameInput" 
                      size="16"></input>
              <button className="ui icon button" ref="searchGoButton" onClick={this.handleSearchGo}>
                <i className="search icon"></i>
              </button>
            </div>       
          </div>
        </div>

        <div className="ui basic segment">
          <UserList users={filteredUsers} handleClickUser={this.props.handleClickUser} narrowItem={narrowItem}/>
          <button onClick={this.handleLoadMore} className="ui button">Load more</button>
        </div>      
      </div>
    )
  },

  handleLoadMore() {
    this.setState({userLimit: this.state.userLimit + 20})
  }
})
