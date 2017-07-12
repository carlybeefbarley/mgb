import _ from 'lodash'

import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import Helmet from 'react-helmet'
import { browserHistory } from 'react-router'
import { Segment, Message } from 'semantic-ui-react'

import { ReactMeteorData } from 'meteor/react-meteor-data'

import { Azzets, Projects } from '/imports/schemas'
import { assetMakeSelector, gameSorters } from '/imports/schemas/assets'
import GameItems from '/client/imports/components/Assets/GameAsset/GameItems'
import AssetListSortBy from '/client/imports/components/Assets/AssetListSortBy'
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'
import Spinner from '/client/imports/components/Nav/Spinner'

import LoadMore from '/client/imports/mixins/LoadMore'



// Default values for url?query - i.e. the this.props.location.query keys
const queryDefaults = {
  project: ProjectSelector.ANY_PROJECT_PROJNAME,
  searchName: '', // Empty string means match all (more convenient than null for input box)
  sort: 'plays', // Should be one of the keys of gameSorters{}
  showStable: '0', // Should be '0' or '1'  -- as a string
  limit: 10, // max item count to load initially and after steps
}

class BrowseGamesRoute extends LoadMore {

  static propTypes = {
    params: PropTypes.object, // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /games
    user: PropTypes.object, // Maybe absent if route is /games
    currUser: PropTypes.object, // Currently Logged in user. Can be null
    ownsProfile: PropTypes.bool,
    location: PropTypes.object     , // We get this from react-router
  limit: PropTypes.number,        // Items to load

  }

  staticcontextTypes= {
    urlLocation: React.PropTypes.object,
  }

  /**
   * queryNormalized() takes a location query that comes in via the browser url.
   *   Any missing or invalid params are replaced by defaults
   *   The result is a data structure that can be used without need for range/validity checking
   * @param q typically this.props.location.query  -  from react-router
  */
  queryNormalized (q) {
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

  /**  Returns the given query EXCEPT for keys that match a key/value pair in queryDefaults array
  */

  _stripQueryOfDefaults (queryObj) {
    return _.omitBy(queryObj, (val, key) => queryDefaults.hasOwnProperty(key) && queryDefaults[key] === val)
  }
  /** helper Function for updating just a query string with react router
  */
  _updateLocationQuery(queryModifier) {
    const loc = this.props.location
    const newQ = this._stripQueryOfDefaults(Object.assign({}, loc.query, queryModifier))
    // This is browserHistory.push and NOT utilPushTo() since we are staying on the same page
    browserHistory.push( Object.assign( {}, loc, { query: newQ } ) )

  // reset all previously loaded data
    this.loadMoreReset()
  }

  getLimit(){
    return this.props.limit || queryDefaults.limit
  }

  // something like: app/server/imports/restApi/restApi_assets.js:24
  getQueryParams(userId = (this.props.user && this.props.user._id) ? this.props.user._id : null){
    const qN = this.queryNormalized(this.props.location.query)
    qN.userId = userId
    qN.kind = ['game']
    qN.showDeleted = false
    qN.showStable = false
    qN.limit = this.getLimit()
    return qN
  }
  /**
   * Always get the Assets stuff.
   * Optionally get the Project info - if this is a user-scoped view
   */
  getMeteorData () {
    const userId = (this.props.user && this.props.user._id) ? this.props.user._id : null
    const qN = this.getQueryParams(userId)

    const handleForGames = Meteor.subscribe( "assets.public", qN.userId, qN.kind, qN.searchName, qN.project, qN.showDeleted, qN.showStable, qN.sort, qN.limit )
    const gamesSorter = gameSorters[qN.sort]
    const gamesSelector = assetMakeSelector(qN.userId, qN.kind, qN.searchName, qN.project, qN.showDeleted, qN.showStable)

    // handleForProjects is not used, but subscription is
    const handleForProjects = qN.userId ? Meteor.subscribe("projects.byUserId", qN.userId) : null
    const selectorForProjects = { '$or': [ { ownerId: qN.userId }, { memberIds: { $in: [qN.userId] } } ] }


    this.src = `/api/assets`
    return {
      games: Azzets.find(gamesSelector, { sort: Object.assign(gamesSorter, {name: 1}) }).fetch(), // Note that the subscription we used excludes the content2 field which can get quite large
      projects: userId ? Projects.find(selectorForProjects).fetch() : null, // Can be null
      loading: !handleForGames.ready(),
    }
  }

  handleSearchGo = () => {
    // TODO - disallow/escape search string
    const $button = $(this.refs.searchGoButton)
    $button.removeClass('orange')
    this._updateLocationQuery({ searchName: this.refs.searchNameInput.value })
  }

  /**
   * Make it clear that the search icon needs to be pushed while editing the search box
   * I could do this with React, but didn't want to since search triggers a few changes already
   */
  handleSearchNameBoxChanges = e => {
    // mark if the button needs to be pushed
    const qN = this.queryNormalized(this.props.location.query)
    const $button = $(this.refs.searchGoButton)
    if (this.refs.searchNameInput.value !== qN.searchName) $button.addClass('orange')
    else $button.removeClass('orange')
  }

  componentDidMount() {
    window.addEventListener('keydown', this.listenForEnter)
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.listenForEnter)
  }

  listenForEnter = (e) => {
    e = e || window.event
    if (e.keyCode === 13) this.handleSearchGo()
  }

  isLoading(){
    return (super.isLoading() && this.data.games.length !== 0) || this.data.loading
  }

  render() {
    const { games, projects } = this.data // list of Game Assets provided via getMeteorData()
    const loading = this.isLoading()
    const { currUser, user, ownsProfile, location } = this.props
    const name = user ? user.profile.name : ''
    const qN = this.queryNormalized(location.query)

    return (
      <Segment basic padded style={{height: "100%", overflow: "auto"}} onScroll={this.onScroll}>
        <Helmet title="Browse Games" meta={[{ name: 'Browse stable games', content: 'List of Games' }]} />

          <div className="ui large header" style={{ float: 'left' }}>
            { user ? <span><a>{name}</a>'s Games</span> : 'Public Games' }
          </div>

          <AssetListSortBy
              chosenSortBy={qN.sort}
              handleChangeSortByClick={v => this._updateLocationQuery( { sort: v } ) } />

          <div className='ui action input' style={{display: 'block', clear: 'both'}}>
            {user && <QLink to="/games" tab={-1} style={{float: "left", padding: "0.4em 0"}}>All games</QLink>}
            <div style={{float: "right"}}>
            <input
                type='text'
                placeholder='Search...'
                defaultValue={qN.searchName}
                onChange={this.handleSearchNameBoxChanges}
                ref='searchNameInput'
                size='16' />
            <button className='ui icon button' ref='searchGoButton' onClick={this.handleSearchGo}>
              <i className="search icon" />
            </button>
            &emsp;
            </div>
          </div>

          {
            /* Show only locked games.. ?
            <div style={{ float: 'right' }}>
              <AssetShowStableSelector
                  showStableFlag={qN.showStable}
                  handleChangeFlag={v => this._updateLocationQuery( { showStable: v } ) } />
            </div>
            */}

        {user &&
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
          </div>}

        { !loading && games.length === 0 &&
          <Message
              style={{marginTop: '8em'}}
              warning
              icon="help circle"
              header="No games match your search"
              content="Widen your search to see more games"
          />}
        { games.length !== 0 &&
            <GameItems currUser={currUser} wrap games={games.concat(this._loadMoreState.data)} />
        }

        { (loading || this.data.loading) &&
          <Spinner /> }


        {super.render()}
      </Segment>
    )
  }
}

reactMixin(BrowseGamesRoute.prototype, ReactMeteorData)

export default BrowseGamesRoute
