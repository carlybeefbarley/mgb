import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Dropdown, Popup } from 'semantic-ui-react'
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
import InputSearchBox from '/client/imports/components/Controls/InputSearchBox'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'

// This lets this flexPanel remember it's state!
let _persistedState = null

const _makeAvatarSrc = userId => makeCDNLink(`/api/user/${userId}/avatar/60`, makeExpireTimestamp(60))
const _showFromAllValue = ':showFromAll:' // since colon is not allowed in Meteor _ids. Null wasnt working well as a value for 'all'
const ShowFromWho = ( { value, currUser, otherUser, style, onChange }) => {
  const options = _.compact([
    currUser  && { key: currUser._id, text: currUser.username,  value: currUser._id,  image: { avatar: true, src: _makeAvatarSrc(currUser._id) } },
    // This is mostly working, but needs to handle the transition to a page where the user is no longer part of the page scope
    (otherUser && otherUser._id !== currUser._id) && { key: otherUser._id, text: otherUser.username, value: otherUser._id, image: { avatar: true, src: _makeAvatarSrc(otherUser._id) } },
    { text: 'All users', value: _showFromAllValue, icon: { size: 'large', name: 'users' } }
  ])
  return (
    <small>
      <Dropdown
          inline
          value={value}
          style={{ color: 'grey', fontSize: '0.xem', ...style }} className='small'
          options={options}
          onChange={ (event, data) => { onChange(data.value) } }
      />
    </small>
  )
}

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
    searchName:       '', 
    showFromUserId:   _showFromAllValue,
    view:             defaultAssetViewChoice, // Large. See assetViewChoices for explanation.  
    kindsActive:      AssetKindKeys.join(safeAssetKindStringSepChar),
    project:          null    // This will be a project OBJECT,not just a string. See projects.js 
  } ),

  componentWillMount() {
    if (_persistedState)
    {
      this.setState( _persistedState )
      // There's a corner case where the secondary user's stuff was being shown, but now isn't in the url
      if ( ! ( _persistedState.showFromUserId === _showFromAllValue || (this.props.currUser && this.props.currUser._id === _persistedState.showFromUserId)) )
      {
        // ok. so not just the simple show-all or show-me cases... think more...
        if ( (!this.props.user || this.props.user._id !== _persistedState.showFromUserId) ) 
        {
          this.setState( { showFromUserId: _showFromAllValue } ) // debatable if the deafult would be me or all, but all is simpler
        }
      }
    }
  },

  componentWillReceiveProps( nextProps ) {
    if (
      this.props.user &&                                      // there was a /u/user/ on the url
      this.state.showFromUserId === this.props.user._id &&    // it was the one we were showing
      this.props.user !== this.props.currUser)                // and it isn't the current user        
    {
      if (!nextProps.user)
        this.setState( { showFromUserId: nextProps.currUser ? nextProps.currUser._id : _showFromAllValue } )
      else 
        this.setState( { showFromUserId: nextProps.user._id } )
    }
  },

  componentWillUnmount() {
    _persistedState = _.clone(this.state) // TODO: check if we must be careful with state.project
  },

  /** 
   * Always get the Assets stuff.
   * Optionally get the Project info - if this is a user-scoped view
   */
  getMeteorData: function() {
    // Much of this is copied from UserAssetList - repeats.. needs cleanup

    const { user, currUser, currUserProjects } = this.props
    const { searchName, kindsActive, project, showFromUserId } = this.state
    const currUserId = currUser ? currUser._id : null
    const userId = (user && user._id) ? user._id : null
    const isPageShowingCurrUser = (currUserId === userId) && userId !== null
    const kindsArray = kindsActive === "" ? null : kindsActive.split(safeAssetKindStringSepChar)

    const qOwnerId = project ? project.ownerId : (showFromUserId === _showFromAllValue ? null : showFromUserId)
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

  handleSearchGo(newSearchText)
  {
    this.setState( { searchName: newSearchText } )
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
    const { view, kindsActive, searchName, project, showFromUserId } = this.state
    const isAllKinds = isAssetKindsStringComplete(kindsActive)
    const effectiveUser = user || currUser
    
    return (
      <div>
        <div id="mgbjr-flexPanel-assets-search">
          <div>
            <ShowFromWho 
                value={showFromUserId}
                currUser={currUser} 
                otherUser={user === currUser ? null : user} 
                style={{float: 'left' }}
                onChange={(selectedUserId) => { this.setState( { showFromUserId: selectedUserId} ) } }/>
            <AssetListChooseView 
                sty={{float: 'right'}}
                chosenView={view} 
                handleChangeViewClick={ newView => this.setState( { view: newView } ) } />                
            <div style={{clear: 'both'}}/>
          </div>
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

          <InputSearchBox 
              size='small' 
              fluid 
              value={searchName} 
              onFinalChange={this.handleSearchGo} />

          <div style={{marginTop: '6px'}}>
            <Popup 
                trigger={(<small>Show asset kinds:</small>)}
                positioning='right center'
                size='mini'
                content='Alt-click to multi-select'/>
            <small>
              { isAllKinds || <span style={{float: 'right'}} onClick={() => this.handleToggleKind('__all')}>(show all)</span> }
            </small>
            <AssetKindsSelector 
                showCompact={true} 
                kindsActive={kindsActive} 
                handleToggleKindCallback={this.handleToggleKind} />
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
