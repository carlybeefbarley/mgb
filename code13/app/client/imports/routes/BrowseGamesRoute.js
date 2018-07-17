import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import Helmet from 'react-helmet'
import { withTracker } from 'meteor/react-meteor-data'
import { browserHistory } from 'react-router'
import { Segment, Message } from 'semantic-ui-react'
import Spinner from '/client/imports/components/Nav/Spinner'

import { Azzets, Projects } from '/imports/schemas'
import { assetMakeSelector, gameSorters } from '/imports/schemas/assets'
import GameItems from '/client/imports/components/Assets/GameAsset/GameItems'
import AssetListSortBy from '/client/imports/components/Assets/AssetListSortBy'
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'

/**
  * queryNormalized() takes a location query that comes in via the browser url.
  *   Any missing or invalid params are replaced by defaults
  *   The result is a data structure that can be used without need for range/validity checking
  * @param q typically this.props.location.query  -  from react-router
*/

const queryNormalized = q => {
  // Start with defaults
  let newQ = _.clone(queryDefaults)

  // Validate and apply values from location query
  if (gameSorters.hasOwnProperty(q.sort)) newQ.sort = q.sort
  if (q.project) newQ.project = q.project
  // if (q.showStable === '0' || q.showStable === '1')
  //   newQ.showStable = q.showStable
  if (q.searchName) newQ.searchName = q.searchName

  return newQ
}

// Default values for url?query - i.e. the this.props.location.query keys
const queryDefaults = {
  project: ProjectSelector.ANY_PROJECT_PROJNAME,
  searchName: '', // Empty string means match all (more convenient than null for input box)
  sort: 'plays', // Should be one of the keys of gameSorters{}
  showStable: '0', // Should be '0' or '1'  -- as a string
}

class BrowseGamesRoute extends React.PureComponent {
  static propTypes = {
    params: PropTypes.object, // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /games
    user: PropTypes.object, // Maybe absent if route is /games
    currUser: PropTypes.object, // Currently Logged in user. Can be null
    ownsProfile: PropTypes.bool,
    location: PropTypes.object, // We get this from react-router
  }

  static contextTypes = {
    urlLocation: PropTypes.object,
  }

  /**  Returns the given query EXCEPT for keys that match a key/value pair in queryDefaults array
  */

  _stripQueryOfDefaults = queryObj => {
    return _.omitBy(queryObj, (val, key) => queryDefaults.hasOwnProperty(key) && queryDefaults[key] === val)
  }

  /** helper Function for updating just a query string with react router
  */
  _updateLocationQuery = queryModifier => {
    const loc = this.props.location
    const newQ = this._stripQueryOfDefaults(Object.assign({}, loc.query, queryModifier))
    // This is browserHistory.push and NOT utilPushTo() since we are staying on the same page
    browserHistory.push(Object.assign({}, loc, { query: newQ }))
  }

  handleSearchGo = () => {
    // TODO - disallow/escape search string
    const { searchGoButton } = this.refs
    searchGoButton.classList.remove('orange')
    this._updateLocationQuery({ searchName: this.refs.searchNameInput.value })
  }

  /**
   * Make it clear that the search icon needs to be pushed while editing the search box
   * I could do this with React, but didn't want to since search triggers a few changes already
   */
  handleSearchNameBoxChanges = () => {
    // mark if the button needs to be pushed
    const qN = queryNormalized(this.props.location.query)
    const { searchGoButton } = this.refs
    if (this.refs.searchNameInput.value !== qN.searchName) searchGoButton.classList.add('orange')
    else searchGoButton.classList.remove('orange')
  }

  componentDidMount() {
    window.addEventListener('keydown', this.listenForEnter)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.listenForEnter)
  }

  listenForEnter = e => {
    e = e || window.event
    if (e.keyCode === 13) this.handleSearchGo()
  }

  render() {
    const { games, projects, loading, currUser, user, ownsProfile, location } = this.props // list of Game Assets provided via withTracker()
    const name = user ? user.profile.name : ''
    const qN = queryNormalized(location.query)

    return (
      <Segment basic padded>
        <Helmet title="Browse Games" meta={[{ name: 'Browse stable games', content: 'List of Games' }]} />

        <div className="ui large header" style={{ float: 'left' }}>
          {user ? (
            <span>
              <a>{name}</a>'s Games
            </span>
          ) : (
            'All Games'
          )}
        </div>

        <AssetListSortBy
          chosenSortBy={qN.sort}
          handleChangeSortByClick={v => this._updateLocationQuery({ sort: v })}
        />

        <div className="ui action input" style={{ float: 'right' }}>
          <input
            type="text"
            placeholder="Search..."
            defaultValue={qN.searchName}
            onChange={this.handleSearchNameBoxChanges}
            ref="searchNameInput"
            size="16"
          />
          <button className="ui icon button" ref="searchGoButton" onClick={this.handleSearchGo}>
            <i className="search icon" />
          </button>
          &emsp;
        </div>

        {/* Show only locked games.. ?
            <div style={{ float: 'right' }}>
              <AssetShowStableSelector
                  showStableFlag={qN.showStable}
                  handleChangeFlag={v => this._updateLocationQuery( { showStable: v } ) } />
            </div>
            */}

        {user && (
          <div style={{ clear: 'both' }}>
            <ProjectSelector
              canEdit={ownsProfile}
              user={user}
              isUseCaseCreate={false}
              handleChangeSelectedProjectName={v => this._updateLocationQuery({ project: v })}
              availableProjects={projects}
              ProjectListLinkUrl={'/u/' + user.profile.name + '/projects'}
              chosenProjectName={qN.project}
            />
          </div>
        )}

        {!loading &&
        games.length === 0 && (
          <Message
            style={{ marginTop: '8em' }}
            warning
            icon="help circle"
            header="No games match your search"
            content="Widen your search to see more games"
          />
        )}
        {loading ? <Spinner /> : <GameItems currUser={currUser} wrap games={games} />}
      </Segment>
    )
  }
}

/**
  * Always get the Assets stuff.
  * Optionally get the Project info - if this is a user-scoped view
*/

export default withTracker(props => {
  const userId = props.user && props.user._id ? props.user._id : null
  const qN = queryNormalized(props.location.query)

  const handleForGames = Meteor.subscribe(
    'assets.public',
    userId,
    ['game'],
    qN.searchName,
    qN.project,
    false,
    qN.showStable === '1',
    qN.sort,
  )
  const gamesSorter = gameSorters[qN.sort]
  const gamesSelector = assetMakeSelector(
    userId,
    ['game'],
    qN.searchName,
    qN.project,
    false,
    qN.showStable === '1',
  )
  const handleForProjects = userId ? Meteor.subscribe('projects.byUserId', userId) : null
  const selectorForProjects = { $or: [{ ownerId: userId }, { memberIds: { $in: [userId] } }] }
  return {
    ...props,
    games: Azzets.find(gamesSelector, { sort: gamesSorter }).fetch(), // Note that the subscription we used excludes the content2 field which can get quite large
    projects: userId ? Projects.find(selectorForProjects).fetch() : null, // Can be null
    loading: !handleForGames.ready(),
  }
})(BrowseGamesRoute)
