import React, { PropTypes } from 'react';
import reactMixin from 'react-mixin';

import { Link } from 'react-router';
import Spinner from '/client/imports/components/Nav/Spinner';
import AssetList from '/client/imports/components/Assets/AssetList';

import { Azzets } from '/imports/schemas';
import { AssetKindKeys, assetMakeSelector } from '/imports/schemas/assets';

export default fpAssets = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    activity:               PropTypes.array.isRequired,   // An activity Stream passed down from the App and passed on to interested compinents
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px". 
  },


  getInitialState: function () {
    return { 
      searchName: "" 
    }
  },

  /** 
   * Always get the Assets stuff.
   * Optionally get the Project info - if this is a user-scoped view
   */
  getMeteorData: function() {
    const nameSearch = this.state.searchName
    const handleForAssets = Meteor.subscribe("assets.public", 
                                  null, 
                                  AssetKindKeys, 
                                  nameSearch,
                                  null,   // Project 
                                  false,  // Show Only Deleted
                                  false,  // Shw only Stable
                                  undefined,  // Use default sort order
                                  10)     // Limit
    const assetSorter = { updatedAt: -1}
    let assetSelector = assetMakeSelector(null, AssetKindKeys, nameSearch)

    return {
      assets: Azzets.find(assetSelector, {sort: assetSorter}).fetch(), // Note that the subscription we used excludes the content2 field which can get quite large
      loading: !handleForAssets.ready()
    };
  },


  handleSearchGo()
  {
    // TODO - disallow/escape search string
    const $button = $(this.refs.searchGoButton)
    $button.removeClass("orange")

    this.setState( {searchName: this.refs.searchNameInput.value})
  },

  /** 
   * Make it clear that the search icon needs to be pushed while editing the search box
   * I could do this with React, but didn't want to since search triggers a few changes already
   */
  handleSearchNameBoxChanges() {
    const $button = $(this.refs.searchGoButton)
    $button.addClass("orange")
  },

  // small hack - so I don't need to reach mouse
  handleSearchNameBoxKeyUp(e){
    if(e.which == 13){
      $(this.refs.searchGoButton).click();
    }
  },
  
  render: function () {
    if (this.data.loading)
      return <Spinner />
      
    const assets = this.data.assets       // list of assets provided via getMeteorData()
    
    return  <div>
              <div className="ui segment">
                <div className="ui small action input">
                  <input  type="text" 
                          placeholder="Search..." 
                          defaultValue={this.state.searchName} 
                          onChange={this.handleSearchNameBoxChanges}
                          onKeyUp={this.handleSearchNameBoxKeyUp}
                          ref="searchNameInput"
                          size="16"></input>
                  <button className="ui icon button" ref="searchGoButton" onClick={this.handleSearchGo}>
                    <i className="search icon"></i>
                  </button>
                </div>            
              </div>
              <AssetList
                  location="panel"
                  assets={assets} 
                  currUser={this.props.currUser}
                  renderType="short" />
            </div>
    
  }

  
})
