import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Divider, Dropdown, Icon } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { Azzets, Projects } from '/imports/schemas'
import Spinner from '/client/imports/components/Nav/Spinner'
import AssetList from '/client/imports/components/Assets/AssetList'

import AssetKindsSelector from '/client/imports/components/Assets/AssetKindsSelector.js'
import {
  AssetKindKeys,
  assetMakeSelector,
  safeAssetKindStringSepChar,
  isAssetKindsStringComplete,
} from '/imports/schemas/assets'

import AssetListChooseView from '/client/imports/components/Assets/AssetListChooseView'
import { defaultAssetViewChoice } from '/client/imports/components/Assets/AssetCard'

import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'
import InputSearchBox from '/client/imports/components/Controls/InputSearchBox'

// This lets this flexPanel remember its recent state even beyond dismounts
let _persistedState = null

const _showFromAllValue = ':showFromAll:' // since colon is not allowed in Meteor _ids. Null wasnt working well as a value for 'all'

const ShowFromWho = ({ value, currUser, otherUser, onChange }) => {
  const options = _.compact([
    currUser && {
      key: currUser._id,
      text: `Just ${currUser.username}'s Assets`,
      value: currUser._id,
      image: {
        avatar: true,
        src: UX.makeAvatarImgLink(currUser.username),
      },
    },
    // This is mostly working, but needs to handle the transition to a page where the user is no longer part of the page scope
    otherUser &&
    currUser &&
    otherUser._id !== currUser._id && {
      key: otherUser._id,
      text: `Just ${otherUser.username}'s Assets`,
      value: otherUser._id,
      image: {
        avatar: true,
        src: UX.makeAvatarImgLink(otherUser.username),
      },
    },
    {
      text: "All users' assets",
      value: _showFromAllValue,
      icon: { size: 'large', name: 'users' },
    },
  ])
  return (
    <Dropdown
      inline
      value={value}
      trigger={
        <span>
          <Icon color="grey" name="users" /> {_.find(options, { value }).text}
        </span>
      }
      options={options}
      onChange={(event, data) => {
        onChange(data.value)
      }}
    />
  )
}

const fpAssets = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    user: PropTypes.object, // User object for context we are navigating to in main page. Can be null/undefined. Can be same as currUser, or different user
    currUserProjects: PropTypes.array, // Projects list for currently logged in user
    panelWidth: PropTypes.string.isRequired, // Typically something like "200px".
  },

  getInitialState: () => ({
    searchName: '',
    showFromUserId: _showFromAllValue,
    view: defaultAssetViewChoice, // Large. See assetViewChoices for explanation.
    kindsActive: AssetKindKeys.join(safeAssetKindStringSepChar),

    project: null, // This will be a project OBJECT,not just a string. See projects.js
    projectName: ProjectSelector.ANY_PROJECT_PROJNAME, // projectName has some special values to disambiguate the cases of 'all' and 'none'
  }),

  componentWillMount() {
    if (_persistedState) {
      this.setState(_persistedState)
      // There's a corner case where the secondary user's stuff was being shown, but now isn't in the url
      if (
        !(
          _persistedState.showFromUserId === _showFromAllValue ||
          (this.props.currUser && this.props.currUser._id === _persistedState.showFromUserId)
        )
      ) {
        // ok. so not just the simple show-all or show-me cases... think more...
        if (!this.props.user || this.props.user._id !== _persistedState.showFromUserId) {
          this.setState({ showFromUserId: _showFromAllValue }) // debatable if the deafult would be me or all, but all is simpler
        }
      }
    }
  },

  componentWillReceiveProps(nextProps) {
    if (
      this.props.user && // there was a /u/user/ on the url
      this.state.showFromUserId === this.props.user._id && // it was the one we were showing
      this.props.user !== this.props.currUser
    ) {
      // and it isn't the current user
      if (!nextProps.user)
        this.setState({ showFromUserId: nextProps.currUser ? nextProps.currUser._id : _showFromAllValue })
      else this.setState({ showFromUserId: nextProps.user._id })
    }
  },

  componentWillUnmount() {
    _persistedState = _.clone(this.state) // TODO: check if we must be careful with state.project
  },

  /**
   * Always get the Assets stuff.
   * Optionally get the Project info - if this is a user-scoped view
   */
  getMeteorData() {
    // Much of this is copied from UserAssetListRoute - repeats.. needs cleanup

    const { user, currUser, currUserProjects } = this.props
    const { searchName, kindsActive, project, showFromUserId, projectName } = this.state
    const currUserId = currUser ? currUser._id : null
    const userId = user && user._id ? user._id : null
    const isPageShowingCurrUser = currUserId === userId && userId !== null
    const kindsArray = kindsActive === '' ? null : kindsActive.split(safeAssetKindStringSepChar)

    const qOwnerId = project ? project.ownerId : showFromUserId === _showFromAllValue ? null : showFromUserId
    const qProjectName = project ? project.name : projectName
    const handleForAssets = Meteor.subscribe(
      'assets.public',
      qOwnerId, // userId (null = all)
      kindsArray,
      searchName,
      qProjectName, // Project Name.
      false, // Show Only Deleted
      false, // Show only Stable
      undefined, // Use default sort order
      20, // Limit
    )
    const assetSorter = { updatedAt: -1 }
    let assetSelector = assetMakeSelector(qOwnerId, kindsArray, searchName, qProjectName) // TODO: Bit of a gap here... username.projectname

    // Load projects if it's not the current user
    const handleForProjects =
      userId && !isPageShowingCurrUser ? Meteor.subscribe('projects.byUserId', userId) : null
    const selectorForProjects = {
      $or: [{ ownerId: userId }, { memberIds: { $in: [userId] } }],
    }

    return {
      assets: Azzets.find(assetSelector, { sort: assetSorter }).fetch(), // Note that the subscription we used excludes the content2 field which can get quite large
      userProjects: userId ? Projects.find(selectorForProjects).fetch() : currUserProjects, // Can be null
      loading: !handleForAssets.ready() || (handleForProjects !== null && !handleForProjects.ready()),
    }
  },

  handleSearchGo(newSearchText) {
    this.setState({ searchName: newSearchText })
  },

  handleChangeSelectedProjectName(pName, projObj) {
    this.setState({ projectName: pName, project: projObj })
  },

  // This is the callback from AssetsKindSelector
  handleToggleKind(k, altKey) {
    // k is the string for the AssetKindsKey to toggle existence of in the array
    let newKindsString
    const kindsStr = this.state.kindsActive
    const kindsArray = kindsStr === '' ? [] : kindsStr.split(safeAssetKindStringSepChar)
    const isCurrentlOnlyKindBeingToggled = kindsArray.length === 1 && kindsArray[0] === k

    if (k === '__all' || isCurrentlOnlyKindBeingToggled)
      newKindsString = AssetKindKeys.join(safeAssetKindStringSepChar)
    else if (!altKey) newKindsString = k
    else {
      // Alt key means ONLY this kind - pretty simple - the string is the given kind
      // Alt key, so this is a toggle
      // Just toggle this key, keep the rest.. Also, handle the special case string for none and all
      // Toggle it being there
      const newKindsArray =
        _.indexOf(kindsArray, k) === -1 ? _.union(kindsArray, [k]) : _.without(kindsArray, k)
      newKindsString = newKindsArray.join(safeAssetKindStringSepChar)
    }
    // Finally, special case the empty and full situations
    this.setState({ kindsActive: newKindsString })
  },

  render() {
    const { assets, userProjects, loading } = this.data // list of assets provided via getMeteorData()
    const { user, currUser } = this.props
    const { view, kindsActive, searchName, project, projectName, showFromUserId } = this.state
    const effectiveUser = user || currUser

    const style = {
      position: 'absolute',
      overflowY: 'auto',
      overflowX: 'hidden',
      margin: '0',
      // keep padding on all sides to prevent shadow clipping on asset card hover
      padding: '0 8px',
      top: '11em',
      bottom: '0.5em',
      left: '0',
      right: '0',
      transition: 'transform 200ms, opacity 200ms',
    }
    return (
      <div>
        <div id="mgbjr-flexPanel-assets-search">
          <div>
            <InputSearchBox
              size="small"
              fluid
              value={searchName}
              id="mgbjr_fp_search_asset"
              onFinalChange={this.handleSearchGo}
            />
            <AssetKindsSelector
              showCompact
              kindsActive={kindsActive}
              handleToggleKindCallback={this.handleToggleKind}
            />
            <AssetListChooseView
              sty={{ float: 'right' }}
              chosenView={view}
              handleChangeViewClick={newView => this.setState({ view: newView })}
            />
            <ShowFromWho
              sty={{ float: 'left' }}
              value={showFromUserId}
              currUser={currUser}
              otherUser={user === currUser ? null : user}
              onChange={selectedUserId => {
                this.setState({ showFromUserId: selectedUserId })
              }}
            />
            <div style={{ clear: 'both' }} />
          </div>
          {effectiveUser && userProjects ? (
            <ProjectSelector
              key="fpProjectSelector" // don't conflict with asset project selector
              canEdit={false}
              user={effectiveUser}
              isUseCaseCreate={false}
              handleChangeSelectedProjectName={this.handleChangeSelectedProjectName}
              availableProjects={userProjects}
              ProjectListLinkUrl={'/u/' + effectiveUser.profile.name + '/projects'}
              showProjectsUserIsMemberOf
              chosenProjectObj={project}
              chosenProjectName={projectName}
            />
          ) : null}
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div style={style}>
            <AssetList fluid renderView={view} assets={assets} currUser={currUser} />
          </div>
        )}
      </div>
    )
  },
})

export default fpAssets
