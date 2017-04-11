import _ from 'lodash'
import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import reactMixin from 'react-mixin'
import { browserHistory } from 'react-router'
import { utilPushTo } from './QLink'
import { Segment, Message } from 'semantic-ui-react'
import Spinner from '/client/imports/components/Nav/Spinner'

import { Azzets, Projects } from '/imports/schemas'
import { assetMakeSelector, gameSorters } from '/imports/schemas/assets'
import GameItems from '/client/imports/components/Assets/GameAsset/GameItems'
import AssetShowStableSelector from '/client/imports/components/Assets/AssetShowStableSelector'
import AssetListSortBy from '/client/imports/components/Assets/AssetListSortBy'
import ProjectSelector from '/client/imports/components/Assets/ProjectSelector'

// Default values for url?query - i.e. the this.props.location.query keys
const queryDefaults = { 
  project:    ProjectSelector.ANY_PROJECT_PROJNAME,
  searchName: '',               // Empty string means match all (more convenient than null for input box)
  sort: 'plays',                // Should be one of the keys of gameSorters{}
  showStable: '0'               // Should be '0' or '1'  -- as a string
}

export default BrowseGamesRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,       // .id (LEGACY /user/:id routes), or .username (current /u/:username routes) Maybe absent if route is /games
    user: PropTypes.object,         // Maybe absent if route is /games
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
    let newQ = _.clone(queryDefaults)
    
    // Validate and apply values from location query
    if (gameSorters.hasOwnProperty(q.sort))
      newQ.sort = q.sort
    if (q.project)
      newQ.project = q.project
    if (q.showStable === '0' || q.showStable === '1')
      newQ.showStable = q.showStable
    if (q.searchName)
      newQ.searchName = q.searchName
      
    return newQ
  },

  /**  Returns the given query EXCEPT for keys that match a key/value pair in queryDefaults array 
  */ 
  _stripQueryOfDefaults: function(queryObj) {
    return _.omitBy(queryObj, (val, key) => (queryDefaults.hasOwnProperty(key) && queryDefaults[key] === val))
  },
  
  /** helper Function for updating just a query string with react router
  */
  _updateLocationQuery(queryModifier) {
    const loc = this.props.location
    const newQ = this._stripQueryOfDefaults( Object.assign( {}, loc.query, queryModifier) )
    // This is browserHistory.push and NOT utilPushTo() since we are staying on the same page
    browserHistory.push( Object.assign( {}, loc, { query: newQ } ) )
  },
  
  /** 
   * Always get the Assets stuff.
   * Optionally get the Project info - if this is a user-scoped view
   */
  getMeteorData: function() {
    const userId = (this.props.user && this.props.user._id) ? this.props.user._id : null
    const qN = this.queryNormalized(this.props.location.query)
    
    const handleForGames = Meteor.subscribe( "assets.public", userId, ['game'], qN.searchName, qN.project, false, qN.showStable === "1", qN.sort )
    const gamesSorter = gameSorters[qN.sort]
    const gamesSelector = assetMakeSelector(userId, ['game'], qN.searchName, qN.project, false, qN.showStable === "1")
    const handleForProjects = userId ? Meteor.subscribe("projects.byUserId", userId) : null 
    const selectorForProjects = { '$or': [ { ownerId: userId }, { memberIds: { $in: [userId] } } ] }
    return {
      games: Azzets.find(gamesSelector, { sort: gamesSorter }).fetch(),      // Note that the subscription we used excludes the content2 field which can get quite large
      projects: userId ? Projects.find(selectorForProjects).fetch() : null, // Can be null
      loading: !handleForGames.ready()
    }
  },
  
  handleSearchGo()
  {
    // TODO - disallow/escape search string
    const $button = $(this.refs.searchGoButton)
    $button.removeClass('orange')
    this._updateLocationQuery( { searchName: this.refs.searchNameInput.value } )
  },
  
  /** 
   * Make it clear that the search icon needs to be pushed while editing the search box
   * I could do this with React, but didn't want to since search triggers a few changes already
   */
  handleSearchNameBoxChanges() {
    // mark if the button needs to be pushed
    const qN = this.queryNormalized(this.props.location.query)
    const $button = $(this.refs.searchGoButton)
    if (this.refs.searchNameInput.value !== qN.searchName)
      $button.addClass('orange')
    else
      $button.removeClass('orange')
  },

  componentDidMount() {
    window.addEventListener('keydown', this.listenForEnter)
  },
  
  componentWillUnmount() {
    window.removeEventListener('keydown', this.listenForEnter)
  },
  
  listenForEnter(e) {
    e = e || window.event
    if (e.keyCode === 13)
      this.handleSearchGo()
  },

  render() {
    const { games, projects, loading } = this.data         // list of Game Assets provided via getMeteorData()
    const { user, ownsProfile, location } = this.props
    const name = user ? user.profile.name : ''
    const qN = this.queryNormalized(location.query)

    return (
      <Segment basic padded>
        <Helmet
          title='Browse Games'
          meta={[ { name: 'Browse stable games', content: 'List of Games'} ]}  />

          <div className="ui large header" style={{ float: 'left' }}>
            { user ? <span><a>{name}</a>'s Games</span> : 'Public Games' }
          </div>

          <AssetListSortBy 
              chosenSortBy={qN.sort} 
              handleChangeSortByClick={v => this._updateLocationQuery( { sort: v } ) } />

          <div className='ui action input' style={{ float: 'right' }}>
            <input
                type='text'
                placeholder='Search...' 
                defaultValue={qN.searchName} 
                onChange={this.handleSearchNameBoxChanges}
                ref='searchNameInput'
                size='16'></input>
            <button className='ui icon button' ref='searchGoButton' onClick={this.handleSearchGo}>
              <i className="search icon" />
            </button>
            &emsp;
          </div>

          <div style={{ float: 'right' }}>
            <AssetShowStableSelector 
                showStableFlag={qN.showStable} 
                handleChangeFlag={v => this._updateLocationQuery( { showStable: v } ) } />
          </div>

        { user && 
          <div style={{clear: 'both'}}>
            <ProjectSelector 
                canEdit={ownsProfile}
                user={user}
                isUseCaseCreate={false}
                handleChangeSelectedProjectName={v => this._updateLocationQuery( { project: v } ) }
                availableProjects={projects}
                ProjectListLinkUrl={"/u/" + user.profile.name + "/projects"}
                chosenProjectName={qN.project} />
          </div>
        }

        { !loading && games.length === 0 && <Message style={{marginTop: '8em'}} warning icon='help circle' header='No games match your search' content='Widen your search to see more games' /> }
        { loading ? <Spinner /> : <GameItems wrap={true} games={games} /> }

      </Segment>
    )
  }
})