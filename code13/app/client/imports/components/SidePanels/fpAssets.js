import _ from 'lodash'
import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import { Link } from 'react-router'
import { Azzets, Projects } from '/imports/schemas'
import Spinner from '/client/imports/components/Nav/Spinner'
import AssetList from '/client/imports/components/Assets/AssetList'

import AssetKindsSelector from '/client/imports/components/Assets/AssetKindsSelector.js'
import { AssetKindKeys, assetMakeSelector, safeAssetKindStringSepChar, isAssetKindsStringComplete } from '/imports/schemas/assets'

import AssetListChooseView from '/client/imports/components/Assets/AssetListChooseView'
import { assetViewChoices, defaultAssetViewChoice } from '/client/imports/components/Assets/AssetCard'

import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'

export default fpAssets = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser:         PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:             PropTypes.object,             // User object for context we are navigating to in main page. Can be null/undefined. Can be same as currUser, or different user
    currUserProjects: PropTypes.array,              // Projects list for currently logged in user
    activity:         PropTypes.array.isRequired,   // An activity Stream passed down from the App and passed on to interested compinents
    panelWidth:       PropTypes.string.isRequired   // Typically something like "200px". 
  },

  getInitialState: () => ( { 
    searchName:   '', 
    view:         defaultAssetViewChoice, // Large. See assetViewChoices for explanation.  
    kindsActive:  AssetKindKeys.join(safeAssetKindStringSepChar),
    project:      null    // This will be a project OBJECT,not just a string. See projects.js 
  } ),

  /** 
   * Always get the Assets stuff.
   * Optionally get the Project info - if this is a user-scoped view
   */
  getMeteorData: function() {
    // Much of this is copied from UserAssetList - repeats.. needs cleanup

    const { user, currUser, currUserProjects } = this.props
    const { searchName, kindsActive, project } = this.state
    const currUserId = currUser ? currUser._id : null
    const userId = (user && user._id) ? user._id : null
    const isPageShowingCurrUser = (currUserId === userId) && userId !== null
    const kindsArray = kindsActive === "" ? null : kindsActive.split(safeAssetKindStringSepChar)

    const qOwnerId = project ? project.ownerId : null
    const qProjectName = project ? project.name : null

    const handleForAssets = Meteor.subscribe(
      "assets.public", 
      qOwnerId,           // userId (null = all)
      kindsArray,
      searchName,
      qProjectName,         // Project Name
      false,                // Show Only Deleted
      false,                // Show only Stable
      undefined,            // Use default sort order
      20                    // Limit
    )
    const assetSorter = { updatedAt: -1 }
    let assetSelector = assetMakeSelector(
      qOwnerId, 
      kindsArray, 
      searchName,
      qProjectName
    )  // TODO: Bit of a gap here... username.projectname

    // Load projects if it's not the current user
    const handleForProjects = (userId && !isPageShowingCurrUser) ? Meteor.subscribe("projects.byUserId", userId) : null 
    const selectorForProjects = {
      "$or": [
        { ownerId: userId },
        { memberIds: { $in: [userId]} }
      ]
    }

    return {
      assets: Azzets.find(assetSelector, {sort: assetSorter}).fetch(),          // Note that the subscription we used excludes the content2 field which can get quite large
      userProjects: userId ? Projects.find(selectorForProjects).fetch() : currUserProjects, // Can be null
      loading: !handleForAssets.ready() || ( handleForProjects !== null && !handleForProjects.ready())
    }
  },

  handleSearchGo()
  {
    // TODO - disallow/escape search string
    const $button = $(this.refs.searchGoButton)
    $button.removeClass("orange")
    this.setState( { searchName: this.refs.searchNameInput.value } )
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
  handleSearchNameBoxKeyUp(e) {
    if (e.which === 13) $(this.refs.searchGoButton).click()
  },

  handleChangeSelectedProjectName(pName, projObj, compoundProjName){
    this.setState( { project: projObj } )
  },

  // This is the callback from AssetsKindSelector
  handleToggleKind(k, altKey) // k is the string for the AssetKindsKey to toggle existence of in the array
  {
    let newKindsString
    if (k === "__all")
      newKindsString = AssetKindKeys.join(safeAssetKindStringSepChar)
    else if (!altKey)
      newKindsString = k          // Alt key means ONLY this kind - pretty simple - the string is the given kind
    else
    {
      // Alt key, so this is a toggle
      // Just toggle this key, keep the rest.. Also, handle the special case string for none and all
      const kindsStr = this.state.kindsActive
      const kindsArray = (kindsStr === "" ) ? [] : kindsStr.split(safeAssetKindStringSepChar)
      // Toggle it being there
      const newKindsArray =  _.indexOf(kindsArray,k) === -1 ? _.union(kindsArray,[k]) : _.without(kindsArray,k)
      newKindsString = newKindsArray.join(safeAssetKindStringSepChar)
    }
    // Finally, special case the empty and full situations
    this.setState( { kindsActive: newKindsString })
  },

  render: function () {
    const { assets, userProjects, loading } = this.data       // list of assets provided via getMeteorData()
    const { user, currUser } = this.props
    const { view, kindsActive, searchName, project } = this.state
    const isAllKinds = isAssetKindsStringComplete(kindsActive)
    const effectiveUser = user || currUser
    
    return (
      <div>
        <div id="mgbjr-flexPanel-assets-search">
          { ((effectiveUser && userProjects) ? 
              <ProjectSelector
                  key="fpProjectSelector" // don't conflict with asset project selector
                  canEdit={false}
                  user={effectiveUser}
                  handleChangeSelectedProjectName={this.handleChangeSelectedProjectName}
                  availableProjects={userProjects}
                  ProjectListLinkUrl={"/u/" + effectiveUser.profile.name + "/projects"}
                  showProjectsUserIsMemberOf={true}
                  chosenProjectName={project && project.name} />
              : null )
          }   

          <div className="ui small fluid action input">
            <input  type="text"
                    id="mgb_search_asset"
                    placeholder="Search..." 
                    defaultValue={searchName} 
                    onChange={this.handleSearchNameBoxChanges}
                    onKeyUp={this.handleSearchNameBoxKeyUp}
                    ref="searchNameInput"
                    size="16"></input>
            <button className="ui icon button" ref="searchGoButton" onClick={this.handleSearchGo}>
              <i className="search icon"></i>
            </button>
          </div>

          <div className="ui row" style={{marginTop: '6px'}}>
            <small>
              <span 
                 data-position='bottom left'
                  data-tooltip='Alt-click to multi-select'>
                Show asset kinds:
              </span>
              { isAllKinds || <span style={{float: 'right'}} onClick={() => this.handleToggleKind('__all')}>(show all)</span> }
            </small>
            <AssetKindsSelector 
                showCompact={true} 
                kindsActive={kindsActive} 
                handleToggleKindCallback={this.handleToggleKind} />
            <AssetListChooseView 
                sty={{marginTop: '8px', marginLeft: '0.5em'}}
                chosenView={view} 
                handleChangeViewClick={(newView) => this.setState( { view: newView} ) } />                
          </div>

        </div>
        <br></br>
        { loading ? <Spinner /> : 
            <AssetList
              allowDrag={true}
              fluid={true}
              renderView={view}
              assets={assets} 
              currUser={currUser} />
        }
      </div>
    )
  }
})
