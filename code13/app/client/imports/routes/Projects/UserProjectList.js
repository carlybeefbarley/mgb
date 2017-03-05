import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Segment, Header, Divider, Menu } from 'semantic-ui-react'
import Helmet from 'react-helmet'
import reactMixin from 'react-mixin'
import { browserHistory } from 'react-router'
import Spinner from '/client/imports/components/Nav/Spinner'

import { Projects } from '/imports/schemas'
import { projectMakeSelector, projectSorters } from '/imports/schemas/projects'
import InputSearchBox from '/client/imports/components/Controls/InputSearchBox'
import { WorkStateMultiSelect } from '/client/imports/components/Controls/WorkState'
import ProjectsShowForkableSelector from './ProjectsShowForkableSelector'
import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import CreateProjectLinkButton from '/client/imports/components/Projects/NewProject/CreateProjectLinkButton'

// Default values for url?query - i.e. the this.props.location.query keys
const queryDefaults = {
  searchName: "",               // Empty string means match all (more convenient than null for input box)
  sort: "edited",               // Should be one of the keys of projectSorters{}
  hidews: '0',                  // hide WorkStates using a bitmask. Bit on = workstate[bitIndex] should be hidden
  showForkable: "0"             // showForkable only
}

const _contentsSegmentStyle = { minHeight: '600px' }
const _filterSegmentStyle = { ..._contentsSegmentStyle, minWidth: '220px', maxWidth: '220px' }

export default UserProjectList = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params: PropTypes.object,             // params.id is the USER id  OR  params.username is the username
    user: PropTypes.object,               // This is the related user record. We list the projects for this user
    currUser: PropTypes.object            // Currently Logged in user. Can be null
  },
  
  /**
   * queryNormalized() takes a location query that comes in via the browser url.
   *   Any missing or invalid params are replaced by defaults
   *   The result is a data structure that can be used without need for range/validity checking
   * @param q typically this.props.location.query  -  from react-router
  */
  queryNormalized: function(q = {}) {
    // Start with defaults
    let newQ = _.clone(queryDefaults)
    // Validate and apply values from location query

    // query.sort
    if (projectSorters.hasOwnProperty(q.sort))
      newQ.sort = q.sort

    // query.hidews - This is a hideWorkState bitmask as defined in makeWorkstateNamesArray()
    if (q.hidews)
      newQ.hidews = q.hidews

    // query.showForkable
    if (q.showForkable === "1")
      newQ.showForkable = q.showForkable

    // query.searchName
    if (q.searchName)
      newQ.searchName = q.searchName

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
    let newQ = Object.assign( {}, loc.query, queryModifier )
    newQ = this._stripQueryOfDefaults(newQ)
    // This is browserHistory.push and NOT utilPushTo() since we are staying on the same page
    browserHistory.push( Object.assign( {}, loc,  { query: newQ } ) )
  },

  getMeteorData: function() {
    const userId = this.props.user ? this.props.user._id : null
    const qN = this.queryNormalized(this.props.location.query)
    const showOnlyForkable = (qN.showForkable === '1')
    const handleForProjects = Meteor.subscribe("projects.search", userId, qN.searchName, showOnlyForkable, qN.hidews)
    const projectSelector = projectMakeSelector(userId, qN.searchName, showOnlyForkable, qN.hidews)

    return {
      projects: Projects.find(projectSelector).fetch(),
      loading: !handleForProjects.ready()
    }
  },

  handleSearchGo(newSearchText) { this._updateLocationQuery( { searchName: newSearchText } ) },
  handleChangeShowForkableFlag(newValue) { this._updateLocationQuery( { showForkable: newValue } ) },
  handleChangeWorkstateHideMask(newValue) { this._updateLocationQuery( { hidews: String(newValue) } ) },
  
  render: function() {
    const { user, currUser, location } = this.props
    const { loading, projects } = this.data   // May still be loading...
    const ownerName = user  ? user.profile.name : 'all users'
    const qN = this.queryNormalized(location.query)
    const pageTitle = user ? `${ownerName}'s Projects` : "Public Projects"

    return (
      <Segment.Group horizontal className='mgb-suir-plainSegment'>

        <Helmet
          title={`${ownerName} Project List`}
          meta={[ {"name": "Projects list", "content": "Projects"} ]}
        />
        <Segment style={_filterSegmentStyle}>
          <Header as='h2' content={pageTitle} />

          <div id='mgbjr-project-search-searchStringInput'>
            <InputSearchBox
              size='small'
              fluid
              value={qN.searchName}
              onFinalChange={this.handleSearchGo} />
          </div>
          <WorkStateMultiSelect
              hideMask={parseInt(qN.hidews)}
              handleChangeMask={this.handleChangeWorkstateHideMask}
              style={ { marginTop: '0.5em', textAlign: 'center' } }/>

          <div style={ { marginTop: '1em', textAlign: 'center' } }>
              <Menu secondary compact borderless className='fitted'>
                <ProjectsShowForkableSelector showForkable={qN.showForkable} handleChangeFlag={this.handleChangeShowForkableFlag} />
              </Menu>
            </div>
        </Segment>

        <Segment style={ _contentsSegmentStyle } className='mgb-suir-plainSegment'>

        { user ? 
          <div>
            <Header as='h2'>Projects owned by {ownerName}</Header>
            <CreateProjectLinkButton currUser={currUser} />
            <p />
            { this.renderProjectsAsCards(loading, projects, true) }
            <br />
            <Divider />
            <Header as='h2'>Projects {ownerName} is a member of</Header>
            { this.renderProjectsAsCards(loading, projects, false) }
          </div>
          :
          <div>
            <CreateProjectLinkButton currUser={currUser} />
            <p />
            { this.renderProjectsAsCards(loading, projects, false) }
            <br />
          </div>
        }
        </Segment>
      </Segment.Group>
    )
  },
  
  renderProjectsAsCards(isLoading, projects, ownedFlag)
  {
    if (isLoading)
      return <Spinner/>

    const Empty = <p>No matching projects</p>
    var count = 0
    if (!projects || projects.length === 0)
      return Empty
      
    const retval = (
      <div className="ui link cards">
        { projects.map( project => {
          const isOwner = (this.props.user && project.ownerId === this.props.user._id)
          if (isOwner === ownedFlag || !this.props.user) 
          {
            count++
            return (
              <ProjectCard 
                  project={project} 
                  canEdit={false}
                  canLinkToSrc={false}
                  owner={ownedFlag ? this.props.user : project.ownerName}
                  key={project._id} />
            )
          }
        } ) }
      </div>
    )

    return count > 0 ? retval : Empty
  }
})