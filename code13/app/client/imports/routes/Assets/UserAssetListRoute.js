import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Segment, Popup, Menu, Message, Header } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { ReactMeteorData } from 'meteor/react-meteor-data'

import { Azzets, Projects } from '/imports/schemas'
import {
  AssetKindKeys,
  safeAssetKindStringSepChar,
  assetMakeSelector,
  assetSorters,
  isAssetKindsStringComplete,
} from '/imports/schemas/assets'
import { joyrideStore } from '/client/imports/stores'
import InputSearchBox from '/client/imports/components/Controls/InputSearchBox'

import AssetList from '/client/imports/components/Assets/AssetList'
import AssetKindsSelector from '/client/imports/components/Assets/AssetKindsSelector'
import AssetShowDeletedSelector from '/client/imports/components/Assets/AssetShowDeletedSelector'
import AssetShowChallengeAssetsSelector from '/client/imports/components/Assets/AssetShowChallengeAssetsSelector'
import AssetShowStableSelector from '/client/imports/components/Assets/AssetShowStableSelector'
import AssetListSortBy from '/client/imports/components/Assets/AssetListSortBy'
import AssetListChooseView from '/client/imports/components/Assets/AssetListChooseView'
import AssetListChooseLimit from '/client/imports/components/Assets/AssetListChooseLimit'
import { assetViewChoices, defaultAssetViewChoice } from '/client/imports/components/Assets/AssetCard'
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'
import { defaultProjectSorter } from '/imports/schemas/projects'
import { WorkStateMultiSelect } from '/client/imports/components/Controls/WorkState'
import Spinner from '/client/imports/components/Nav/Spinner'
import { browserHistory } from 'react-router'
import Helmet from 'react-helmet'
import SpecialGlobals from '/imports/SpecialGlobals'
import AssetCreateLink from '/client/imports/components/Assets/NewAsset/AssetCreateLink'
import Hotjar from '/client/imports/helpers/hotjar.js'

// Default values for url?query - i.e. the this.props.location.query keys
const queryDefaults = {
  project: ProjectSelector.ANY_PROJECT_PROJNAME,
  view: defaultAssetViewChoice, // Large. See assetViewChoices for explanation. Has special localStorage() way to override default
  limit: SpecialGlobals.assets.mainAssetsListDefaultLimit, // Number of items to show. Has special localStorage() way to override default
  searchName: '', // Empty string means match all (more convenient than null for input box)
  sort: 'edited', // Should be one of the keys of assetSorters{}
  showDeleted: '0', // Should be "0" or "1"  -- as a string. 0 means False, 1 means True
  showStable: '0', // Should be "0" or "1"  -- as a string. 0 means False, 1 means True
  showChallengeAssets: '0', // Should be "0" or "1"  -- as a string. 0 means False, 1 means True
  hidews: '0', // hide WorkStates using a bitmask. Bit on = workstate[bitIndex] should be hidden
  kinds: '', // Asset kinds. Empty means 'match all valid, non-disabled assets'
}

const _contentsSegmentStyle = { minHeight: '600px' }
const _filterSegmentStyle = { ..._contentsSegmentStyle, minWidth: '220px', maxWidth: '220px' }

const _lsAssetViewKey = 'asset-view'
const _lsAssetLimitKey = 'asset-limit-num'

const UserAssetListRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object, // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /assets
    user: PropTypes.object, // Maybe absent if route is /assets
    currUser: PropTypes.object, // Currently Logged in user. Can be null
    ownsProfile: PropTypes.bool,
    location: PropTypes.object, // We get this from react-router
  },

  componentDidMount() {
    this.hotjarFlag = true
  },

  /**
   * queryNormalized() takes a location query that comes in via the browser url.
   *   Any missing or invalid params are replaced by defaults
   *   The result is a data structure that can be used without need for range/validity checking
   * @param q typically this.props.location.query  -  from react-router
  */
  queryNormalized(q = {}) {
    // Start with defaults
    let newQ = _.clone(queryDefaults)

    // Next, validate and apply values from url location query to overrride defaults

    // query.sort
    if (assetSorters.hasOwnProperty(q.sort)) newQ.sort = q.sort

    if (assetViewChoices.hasOwnProperty(q.view)) newQ.view = q.view
    else if (localStorage.getItem(_lsAssetViewKey)) newQ.view = localStorage.getItem(_lsAssetViewKey)

    if (_.isString(q.limit)) {
      // It was supplied in URL
      newQ.limit = _.toFinite(q.limit)
    } else if (localStorage.getItem(_lsAssetLimitKey)) {
      // This browser has set a prior default
      newQ.limit = localStorage.getItem(_lsAssetLimitKey)
    }
    newQ.limit = _.clamp(newQ.limit, 10, SpecialGlobals.assets.mainAssetsListSubscriptionMaxLimit)

    // query.project
    if (q.project) newQ.project = q.project

    // query.hidews - This is a hideWorkState bitmask as defined in makeWorkstateNamesArray()
    if (q.hidews) newQ.hidews = q.hidews

    // query.showChallengeAssets
    if (q.showChallengeAssets === '1') newQ.showChallengeAssets = q.showChallengeAssets

    // query.showDeleted
    if (q.showDeleted === '1') newQ.showDeleted = q.showDeleted

    // query.showStable
    if (q.showStable === '1') newQ.showStable = q.showStable

    // query.searchName
    if (q.searchName) newQ.searchName = q.searchName

    // query.kinds
    // This one is more complicated.. It will be dynamically expanded to be a comma-separated list of all valid enabled asset kinds
    if (q.kinds && q.kinds === safeAssetKindStringSepChar) newQ.kinds = ''
    else if (q.kinds && q.kinds.length > 0) {
      // Externally "-" becomes "" internally
      // url supplied a list, so parse for valid ones and put back into string
      const asArray = q.kinds.toLowerCase().split(safeAssetKindStringSepChar)
      const asValidatedArray = _.intersection(asArray, AssetKindKeys)
      newQ.kinds = asValidatedArray.join(safeAssetKindStringSepChar)
    } else {
      //no list of Asset Kinds supplied in url query so expand now to all valid secondary
      newQ.kinds = AssetKindKeys.join(safeAssetKindStringSepChar)
    }

    return newQ
  },

  /**  Returns the given query EXCEPT for keys that match a key/value pair in queryDefaults array
  */
  _stripQueryOfDefaults(queryObj) {
    var strippedQ = _.omitBy(queryObj, function(val, key) {
      let retval = queryDefaults.hasOwnProperty(key) && queryDefaults[key] === val
      return retval
    })
    return strippedQ
  },

  /** helper Function for updating just a query string with react router
  */
  _updateLocationQuery(queryModifier) {
    let loc = this.props.location
    let newQ = Object.assign({}, loc.query, queryModifier)
    newQ = this._stripQueryOfDefaults(newQ)
    // This is browserHistory.push and NOT utilPushTo() since we are staying on the same page
    browserHistory.push(Object.assign({}, loc, { query: newQ }))
  },

  /**
   * Always get the Assets stuff.
   * Optionally get the Project info - if this is a user-scoped view
   */
  getMeteorData() {
    const userId = this.props.user && this.props.user._id ? this.props.user._id : null
    const qN = this.queryNormalized(this.props.location.query)
    let handleForAssets = Meteor.subscribe(
      'assets.public',
      userId,
      qN.kinds.split(safeAssetKindStringSepChar),
      qN.searchName,
      qN.project,
      qN.showDeleted === '1',
      qN.showStable === '1',
      qN.sort,
      qN.limit,
      qN.hidews,
      qN.showChallengeAssets === '1',
    )
    let assetSorter = assetSorters[qN.sort]
    let assetSelector = assetMakeSelector(
      userId,
      qN.kinds.split(safeAssetKindStringSepChar),
      qN.searchName,
      qN.project,
      qN.showDeleted === '1',
      qN.showStable === '1',
      qN.hidews,
      qN.showChallengeAssets === '1',
    )

    let handleForProjects = userId ? Meteor.subscribe('projects.byUserId', userId) : null
    let selectorForProjects = {
      $or: [{ ownerId: userId }, { memberIds: { $in: [userId] } }],
    }
    return {
      assets: Azzets.find(assetSelector, { sort: assetSorter }).fetch(), // Note that the subscription we used excludes the content2 field which can get quite large
      projects: userId ? Projects.find(selectorForProjects, { sort: defaultProjectSorter }).fetch() : null, // Can be null
      loading: !handleForAssets.ready(),
    }
  },

  // This is the callback from AssetsKindSelector
  handleToggleKind(
    k,
    altKey, // k is the string for the AssetKindsKey to toggle existence of in the array
  ) {
    let newKindsString
    // get current qN.kinds string as array
    const kindsStr = this.queryNormalized(this.props.location.query).kinds
    // Beware that "".split("-") is [""] so we have to special case empty string
    const kindsArray = kindsStr === '' ? [] : kindsStr.split(safeAssetKindStringSepChar)
    const isCurrentlOnlyKindBeingToggled = kindsArray.length === 1 && kindsArray[0] === k

    if (k === '__all' || isCurrentlOnlyKindBeingToggled) newKindsString = ''
    else if (!altKey)
      // special case.. show all kinds
      newKindsString = k
    else {
      // Alt key means ONLY this kind - pretty simple - the string is the given kind
      // Alt key, so this is a toggle
      // Just toggle this key, keep the rest.. Also, handle the special case string for none and all

      // Toggle it being there
      const newKindsArray =
        _.indexOf(kindsArray, k) === -1 ? _.union(kindsArray, [k]) : _.without(kindsArray, k)
      if (newKindsArray.length === 0) newKindsString = safeAssetKindStringSepChar
      else if (_.difference(AssetKindKeys, newKindsArray).length === 0)
        // No keys selected - we encode that as "-" in the externalized url query
        newKindsString = '' // All keys selected - we encode that as "" in the externalized url query
      else newKindsString = newKindsArray.join(safeAssetKindStringSepChar)
    }
    // Finally, special case the empty and full situations
    this._updateLocationQuery({ kinds: newKindsString })
  },

  handleSearchGo(newSearchText) {
    this._updateLocationQuery({ searchName: newSearchText })
  },
  handleChangeSortByClick(newSort) {
    this._updateLocationQuery({ sort: newSort })
  },
  handleChangeShowStableFlag(newValue) {
    this._updateLocationQuery({ showStable: newValue })
  },
  handleChangeShowDeletedFlag(newValue) {
    this._updateLocationQuery({ showDeleted: newValue })
  },
  handleChangeWorkstateHideMask(newValue) {
    this._updateLocationQuery({ hidews: String(newValue) })
  },
  handleChangeSelectedProjectName(newValue) {
    this._updateLocationQuery({ project: newValue })
  },
  handleChangeShowChallengeAssetsFlag(newValue) {
    this._updateLocationQuery({ showChallengeAssets: newValue })
  },

  handleChangeViewClick(newView) {
    localStorage.setItem(_lsAssetViewKey, newView)
    this._updateLocationQuery({ view: newView })
  },

  handleChangeLimitClick(newLimitNum) {
    localStorage.setItem(_lsAssetLimitKey, newLimitNum)
    this._updateLocationQuery({ limit: newLimitNum })
  },

  render() {
    const { assets, projects, loading } = this.data // can be null due to empty or still loading, or public-assets
    const { currUser, user, ownsProfile, location } = this.props
    const name = user ? user.profile.name : ''
    const qN = this.queryNormalized(location.query)
    const { view, limit } = qN
    const isAllKinds = isAssetKindsStringComplete(qN.kinds)
    const isOneKind = !_.includes(qN.kinds, safeAssetKindStringSepChar)
    const pageTitle = user ? `${name}'s Assets` : 'All Assets'

    // need to send hotjar when we have assets and only once
    if (this.hotjarFlag && !loading && this.data.assets.length > 0) {
      // console.log('assetList', this.data.assets.length, loading)
      this.hotjarFlag = false
      // setTimeout just to be sure that everything is loaded and rendered
      setTimeout(() => Hotjar('trigger', 'user-asset-list', currUser), 200)
    }

    return (
      <Segment.Group horizontal className="mgb-suir-plainSegment">
        <Helmet title={pageTitle} meta={[{ name: 'Asset List', content: 'Assets' }]} />

        <Segment style={_filterSegmentStyle} className="mgb-suir-plainSegment">
          <Header as="h2" content={pageTitle} />
          {user ? (
            <ProjectSelector
              id="mgbjr-asset-search-projectSelector"
              canEdit={ownsProfile}
              user={user}
              isUseCaseCreate={false}
              handleChangeSelectedProjectName={this.handleChangeSelectedProjectName}
              availableProjects={projects}
              ProjectListLinkUrl={'/u/' + user.profile.name + '/projects'}
              chosenProjectName={qN.project}
            />
          ) : null}

          <div id="mgbjr-asset-search-searchStringInput">
            <InputSearchBox size="small" fluid value={qN.searchName} onFinalChange={this.handleSearchGo} />
          </div>

          <div style={{ marginTop: '0.8em' }}>
            <Popup
              trigger={<small>Show asset kinds:</small>}
              position="right center"
              size="mini"
              content="Alt-click to multi-select"
            />
            {isAllKinds || (
              <small
                id="mgbjr-asset-search-kind-select-allKinds"
                style={{ float: 'right', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => {
                  joyrideStore.completeTag('mgbjr-CT-asset-search-kind-select-allKinds')
                  this.handleToggleKind('__all')
                }}
              >
                (show all)
              </small>
            )}
            <AssetKindsSelector kindsActive={qN.kinds} handleToggleKindCallback={this.handleToggleKind} />
          </div>

          {!(currUser.profile.isTeacher || currUser.profile.isStudent) && (
            <WorkStateMultiSelect
              hideMask={parseInt(qN.hidews)}
              handleChangeMask={this.handleChangeWorkstateHideMask}
              style={{ marginTop: '0.5em', textAlign: 'center' }}
            />
          )}

          <div style={{ marginTop: '1em', textAlign: 'center' }}>
            <Menu secondary compact borderless className="fitted">
              <AssetShowStableSelector
                showStableFlag={qN.showStable}
                handleChangeFlag={this.handleChangeShowStableFlag}
              />
              &ensp;
              <AssetShowDeletedSelector
                showDeletedFlag={qN.showDeleted}
                handleChangeFlag={this.handleChangeShowDeletedFlag}
              />
              &ensp;
              <AssetShowChallengeAssetsSelector
                showChallengeAssetsFlag={qN.showChallengeAssets}
                handleChangeFlag={this.handleChangeShowChallengeAssetsFlag}
              />
            </Menu>
          </div>
        </Segment>

        {/* Content segment on right-hand-side */}
        <Segment style={_contentsSegmentStyle} className="mgb-suir-plainSegment">
          {/* Header controls - Create New, Size-select, order-select */}
          <div style={{ marginBottom: '1em' }}>
            <AssetCreateLink assetKind={isOneKind ? qN.kinds : null} projectName={qN.project} />

            <AssetListSortBy chosenSortBy={qN.sort} handleChangeSortByClick={this.handleChangeSortByClick} />
            <AssetListChooseView
              sty={{ float: 'right', marginRight: '1em' }}
              chosenView={view}
              handleChangeViewClick={this.handleChangeViewClick}
            />
            <AssetListChooseLimit
              sty={{ float: 'right', marginRight: '1em' }}
              chosenLimit={limit}
              handleChangeLimitClick={this.handleChangeLimitClick}
            />
          </div>
          {/* Make it really clear that we are showing Challenge Assets */
          qN.showChallengeAssets === '1' && (
            <Segment>
              Showing Challenge Assets made during <QLink to="/learn/code">tutorials</QLink>&emsp;
              <AssetShowChallengeAssetsSelector
                showChallengeAssetsFlag={qN.showChallengeAssets}
                handleChangeFlag={this.handleChangeShowChallengeAssetsFlag}
              />
            </Segment>
          )}
          {/* The Asset Cards */}
          <div>
            {!loading &&
            qN.kinds === '' && (
              <Message
                warning
                icon="help circle"
                header="Select one or more Asset kinds to be shown here"
                content="This list is empty because you have not selected any of the available Asset kinds to view"
              />
            )}
            {!loading &&
            qN.kinds !== '' &&
            assets.length === 0 && (
              <Message
                warning
                icon="help circle"
                header="No assets match your search"
                content="Widen your search to see more assets, or create a new Asset using the 'Create New Asset' button above"
              />
            )}
            {loading ? (
              <div>
                <Spinner />
              </div>
            ) : (
              <AssetList assets={assets} renderView={view} currUser={currUser} ownersProjects={projects} />
            )}
            {!loading &&
            assets.length >= SpecialGlobals.assets.mainAssetsListSubscriptionMaxLimit && (
              <Segment basic>
                Reached maximum number of assets that can be listed here ({SpecialGlobals.assets.mainAssetsListSubscriptionMaxLimit}).
                Use the search filter options to display specific assets.
              </Segment>
            )}
          </div>
        </Segment>
      </Segment.Group>
    )
  },
})

export default UserAssetListRoute
