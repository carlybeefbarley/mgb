import React, { Component, PropTypes } from 'react';
import reactMixin from 'react-mixin';

import { Azzets, Projects } from '/imports/schemas';
import { AssetKinds, AssetKindKeys, safeAssetKindStringSepChar, assetMakeSelector, assetSorters } from '/imports/schemas/assets';
import { logActivity } from '/imports/schemas/activity';

import AssetList from '/client/imports/components/Assets/AssetList';
import CreateAssetLinkButton from '/client/imports/components/Assets/NewAsset/CreateAssetLinkButton';
import AssetKindsSelector from '/client/imports/components/Assets/AssetKindsSelector.js';
import AssetShowDeletedSelector from '/client/imports/components/Assets/AssetShowDeletedSelector.js';
import AssetShowStableSelector from '/client/imports/components/Assets/AssetShowStableSelector.js';
import AssetListSortBy from '/client/imports/components/Assets/AssetListSortBy';
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector';

import { utilPushTo } from '../QLink';
import Spinner from '/client/imports/components/Nav/Spinner';
import { browserHistory } from 'react-router';
import Helmet from 'react-helmet';
import UserItem from '/client/imports/components/Users/UserItem.js';


// Default values for url?query - i.e. the this.props.location.query keys
const queryDefaults = { 
  project: null,        // Null string means match all
  searchName: "",       // Empty string means match all (more convenient than null for input box)
  sort: "edited",       // Should be one of the keys of assetSorters{}
  showDeleted: "0",     // Should be "0" or "1"  -- as a string
  showStable: "0",      // Should be "0" or "1"  -- as a string
  kinds: ""             // Asset kinds. Empty means 'match all valid, non-disabled assets'
}


export default UserAssetListRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,       // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /assets
    user: PropTypes.object,         // Maybe absent if route is /assets
    currUser: PropTypes.object,     // Currently Logged in user. Can be null
    ownsProfile: PropTypes.bool,
    location: PropTypes.object      // We get this from react-router
  },
  
    
  contextTypes: {
    urlLocation: React.PropTypes.object
  },
  
  
  /** 
   * queryNormalized() takes a location query that comes in via the browser url.
   *   Any missing or invalid params are replaced by defaults 
   *   The result is a data structure that can be used without need for range/validity checking
   * @param q typically this.props.location.query  -  from react-router
  */
  queryNormalized: function(q) {
    // Start with defaults
    let newQ = {...queryDefaults}
    
    // Validate and apply values from location query
    
    // query.sort
    if (assetSorters.hasOwnProperty(q.sort))
      newQ.sort = q.sort
    
    // query.project
    if (q.project)
      newQ.project = q.project
      
    // query.showDeleted
    if (q.showDeleted === "1")
      newQ.showDeleted = q.showDeleted

    // query.showStable
    if (q.showStable === "1")
      newQ.showStable = q.showStable
      
    // query.searchName
    if (q.searchName)
      newQ.searchName = q.searchName
      
    // query.kinds 
    // This one is more complicated.. It will be dynamically expanded to be a comma-separated list of all valid enabled asset kinds
    if (q.kinds && q.kinds === safeAssetKindStringSepChar)
    {
      newQ.kinds = ""     // Externally "-" becomes "" internally
    }
    else if (q.kinds && q.kinds.length > 0)
    {
      // url supplied a list, so parse for valid ones and put back into string
      const asArray = q.kinds.toLowerCase().split(safeAssetKindStringSepChar)
      const asValidatedArray = _.intersection(asArray, AssetKindKeys)
      newQ.kinds = asValidatedArray.join(safeAssetKindStringSepChar)
    }
    else
    {
      //no list of Asset Kinds supplied in url query so expand now to all valid secondary
      newQ.kinds = AssetKindKeys.join(safeAssetKindStringSepChar)
    }
      
    return newQ
  },


  /**  Returns the given query EXCEPT for keys that match a key/value pair in queryDefaults array 
  */ 
  _stripQueryOfDefaults: function(queryObj) {
    var strippedQ = _.omitBy(queryObj, function (val, key) { 
      let retval = queryDefaults.hasOwnProperty(key) && queryDefaults[key] === val 
      return retval
    })
    return strippedQ
  },
  
  /** helper Function for updating just a query string with react router
  */
  _updateLocationQuery(queryModifier) {
    let loc = this.props.location
    let newQ = {...loc.query, ...queryModifier }
    newQ = this._stripQueryOfDefaults(newQ)
    // This is browserHistory.push and NOT utilPushTo() since we are staying on the same page
    browserHistory.push( {  ...loc,  query: newQ })
  },
  
  /** 
   * Always get the Assets stuff.
   * Optionally get the Project info - if this is a user-scoped view
   */
  getMeteorData: function() {
    const userId = (this.props.user && this.props.user._id) ? this.props.user._id : null
    const qN = this.queryNormalized(this.props.location.query)
    let handleForAssets = Meteor.subscribe("assets.public", 
                                  userId, 
                                  qN.kinds.split(safeAssetKindStringSepChar), 
                                  qN.searchName, 
                                  qN.project, 
                                  qN.showDeleted === "1", 
                                  qN.showStable === "1",
                                  qN.sort)
    let assetSorter = assetSorters[qN.sort]
    let assetSelector = assetMakeSelector(
                                  userId, 
                                  qN.kinds.split(safeAssetKindStringSepChar), 
                                  qN.searchName, 
                                  qN.project, 
                                  qN.showDeleted === "1", 
                                  qN.showStable === "1")
                          
    
    let handleForProjects = userId ? Meteor.subscribe("projects.byUserId", userId) : null 
    let selectorForProjects = {
      "$or": [
        { ownerId: userId },
        { memberIds: { $in: [userId]} }
      ]
    }  
    return {
      assets: Azzets.find(assetSelector, {sort: assetSorter}).fetch(), // Note that the subscription we used excludes the content2 field which can get quite large
      projects: userId ? Projects.find(selectorForProjects).fetch() : null,   // Can be null
      loading: !handleForAssets.ready()
    };
  },


  /** This is the callback from AssetsKindSelector
   * 
   */
  handleToggleKind(k, altKey) // k is the string for the AssetKindsKey to toggle existence of in the array
  {    
    
    // get current qN.kinds
    const qN = this.queryNormalized(this.props.location.query)
    let newKindsString
    if (k === "__all")
    {
      // special case.. show all kinds
      newKindsString = ""
    }
    else if (!altKey)
    { 
      // Alt key means ONLY this kind - pretty simple - the string is the given kind
      newKindsString = k
    }
    else
    {
      // Alt key, so this is a toggle
      // Just toggle this key, keep the rest.. Also, handle the special case string for none and all

      // get current qN.kinds string as array
      const kindsStr = this.queryNormalized(this.props.location.query).kinds
      // Beware that "".split("-") is [""] so we have to special case empty string
      const kindsArray = (kindsStr === "" ) ? [] : kindsStr.split(safeAssetKindStringSepChar)
      // Toggle it being there
      const newKindsArray =  _.indexOf(kindsArray,k)===-1 ? 
                          _.union(kindsArray,[k]) : 
                          _.without(kindsArray,k)
      if (newKindsArray.length === 0)
        newKindsString = safeAssetKindStringSepChar   // No keys selected - we encode that as "-" in the externalized url query
      else if (_.difference(AssetKindKeys, newKindsArray).length === 0)
        newKindsString = ""                           // All keys selected - we encode that as "" in the externalized url query
      else
        newKindsString = newKindsArray.join(safeAssetKindStringSepChar)             
    }
    // Finally, special case the empty and full situations
    this._updateLocationQuery( { "kinds": newKindsString })
  },

  
  handleChangeShowDeletedFlag(newValue)
  {
    this._updateLocationQuery( {showDeleted: newValue})
  },

  handleChangeShowStableFlag(newValue)
  {
    this._updateLocationQuery( {showStable: newValue})
  },

  handleChangeSelectedProjectName(newValue)
  {
    this._updateLocationQuery( {project: newValue})
  },

  handleChangeSortByClick(newSort)
  {
    this._updateLocationQuery( {sort: newSort})
  },

  handleSearchGo()
  {
    // TODO - disallow/escape search string
    const $button = $(this.refs.searchGoButton)
    $button.removeClass("orange")

    this._updateLocationQuery( {searchName: this.refs.searchNameInput.value})
  },
  
  /** 
   * Make it clear that the search icon needs to be pushed while editing the search box
   * I could do this with React, but didn't want to since search triggers a few changes already
   */
  handleSearchNameBoxChanges() {
    // mark if the button needs to be pushed
    const qN = this.queryNormalized(this.props.location.query)
    const $button = $(this.refs.searchGoButton)
    if  (this.refs.searchNameInput.value !== qN.searchName)
      $button.addClass("orange")
    else
      $button.removeClass("orange")
  },

  componentDidMount() {
    window.addEventListener('keydown', this.listenForEnter)
    
    if (this.props.user)
    {
      // Enable a user info popup
      $('.hazUserPopup')
      .popup({
        inline   : true,
        position : 'bottom left',
        on       :  "click"
      })
    }
  },
  
  componentWillUnmount() {
    window.removeEventListener('keydown', this.listenForEnter)
    $('.hazUserPopup').popup('destroy')
  },
  
  listenForEnter: function(e) {
    e = e || window.event;
    if (e.keyCode === 13) {
      this.handleSearchGo();
    }
  },

  render() {
    let assets = this.data.assets       // list of assets provided via getMeteorData()
    let projects = this.data.projects   // can be null due to empty or still loading, or public-assets

    const {user, ownsProfile, location} = this.props
    const qN = this.queryNormalized(location.query)

    // For some reason this isn't working as 'hidden divider' TODO - find out why
    const hiddenDivider =  <div className="ui divider" style={{borderStyle: "none"}}></div>

    if (user) {
      var { _id, createdAt } = user;
      var { name, avatar, bio, title, focusMsg, focusStart } = user.profile;     
    }
    
    return (
      <div className="ui horizontal segments" style={{border: 0}}>

        <Helmet
          title="Assets"
          meta={[
              {"name": "description", "content": "Assets"}
          ]}
        />
        
        <div className="ui segment" style={{ minHeight: "600px", minWidth:"220px", maxWidth:"220px" }}>

          <div className="ui row">
            <div className="ui hazUserPopup large header">{ user ? (<span><a>{name}</a>'s Assets</span>) : ("Public assets") }</div>     
            <div className="ui popup" style={{minWidth: "260px"}}>
              {user ? <UserItem
                        name={name}
                        avatar={avatar ? avatar : null}
                        profileTitle={title}
                        profileBio={bio}
                        profileFocusMsg={focusMsg}
                        profileFocusStart={focusStart}                        
                        createdAt={createdAt}
                        _id={_id} />
                      : null
            } 
            </div>
          </div>  
                    
          <div className="ui row">
            { user ? <ProjectSelector 
                      canEdit={this.props.ownsProfile}
                      user={user}
                      handleChangeSelectedProjectName={this.handleChangeSelectedProjectName}
                      availableProjects={projects}
                      ProjectListLinkUrl={"/u/" + user.profile.name + "/projects"}
                      chosenProjectName={qN.project} />
            : null }
          </div>
             
          { hiddenDivider }
          
          <div className="ui row">
            <div className="ui action input">
              <input  type="text" 
                      placeholder="Search..." 
                      defaultValue={qN.searchName} 
                      onChange={this.handleSearchNameBoxChanges}
                      ref="searchNameInput" 
                      size="16"></input>
              <button className="ui icon button" ref="searchGoButton" onClick={this.handleSearchGo}>
                <i className="search icon"></i>
              </button>
            </div>            
          </div>

          { hiddenDivider }

          <div className="ui row">
            Show asset kinds:
            <AssetKindsSelector kindsActive={qN.kinds} handleToggleKindCallback={this.handleToggleKind} />
          </div>
          
          { hiddenDivider }

          <div className="ui row">
            <div className="ui secondary compact borderless fitted menu">            
              <AssetShowStableSelector showStableFlag={qN.showStable} handleChangeFlag={this.handleChangeShowStableFlag} />
              <AssetShowDeletedSelector showDeletedFlag={qN.showDeleted} handleChangeFlag={this.handleChangeShowDeletedFlag} />
            </div>
          </div>
        </div>        

        <div className="ui segment" style={{ minHeight: "600px"}}>        
          <div className="ui row">
            <div className="four wide right floated column">
              <div className="ui row">
                <CreateAssetLinkButton />
                <AssetListSortBy chosenSortBy={qN.sort} handleChangeSortByClick={this.handleChangeSortByClick}/>
              </div>
            </div>
          </div>
          
          { hiddenDivider }

          <div className="ui row">          
            { !this.data.loading && qN.kinds==="" ? <div className="ui message"><div className="header">Select one or more Asset kinds to be shown here</div><p>This list is empty because you have not selected any of the available Asset kinds to view</p></div> : null}
            { !this.data.loading && qN.kinds!==""  && assets.length === 0 ? <div className="ui message"><div className="header">No assets match your search</div><p>Widen your search to see more assets, or create a new Asset using the 'Create New Asset' button above</p></div> : null}
            { this.data.loading ?
                <div><Spinner /></div>
              :
                <AssetList 
                  assets={assets} 
                  currUser={this.props.currUser} 
                  ownersProjects={projects}  />
            }
          </div>
        </div>
        
      </div>

    );
  }
  
})