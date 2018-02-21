import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Card, Segment, Header, Divider, Menu } from 'semantic-ui-react'
import { createContainer } from 'meteor/react-meteor-data'
import Helmet from 'react-helmet'
import { browserHistory } from 'react-router'
import Spinner from '/client/imports/components/Nav/Spinner'

import { Projects } from '/imports/schemas'
import { defaultProjectSorterName, projectMakeSelector, projectSorters } from '/imports/schemas/projects'
import InputSearchBox from '/client/imports/components/Controls/InputSearchBox'
import ProjectsShowForkableSelector from './ProjectsShowForkableSelector'
import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import CreateProjectLinkButton from '/client/imports/components/Projects/NewProject/CreateProjectLinkButton'

// Default values for url?query - i.e. the this.props.location.query keys
const queryDefaults = {
  searchName: '', // Empty string means match all (more convenient than null for input box)
  sort: defaultProjectSorterName, // Should be one of the keys of projectSorters{}
  hidews: '0', // hide WorkStates using a bitmask. Bit on = workstate[bitIndex] should be hidden
  showForkable: '0', // showForkable only
}

const _contentsSegmentStyle = { minHeight: '600px' }
const _filterSegmentStyle = { ..._contentsSegmentStyle, minWidth: '220px', maxWidth: '220px' }

/**  Returns the given query EXCEPT for keys that match a key/value pair in queryDefaults array
*/
const _stripQueryOfDefaults = queryObj => {
  var strippedQ = _.omitBy(queryObj, function(val, key) {
    let retval = queryDefaults.hasOwnProperty(key) && queryDefaults[key] === val
    return retval
  })
  return strippedQ
}

/**
 * queryNormalized() takes a location query that comes in via the browser url.
 *   Any missing or invalid params are replaced by defaults
 *   The result is a data structure that can be used without need for range/validity checking
 * @param q typically this.props.location.query  -  from react-router
*/
const _queryNormalized = (q = {}) => {
  // Start with defaults
  let newQ = _.clone(queryDefaults)
  // Validate and apply values from location query

  // query.sort
  if (projectSorters.hasOwnProperty(q.sort)) newQ.sort = q.sort

  // query.hidews - This is a hideWorkState bitmask as defined in makeWorkstateNamesArray()
  if (q.hidews) newQ.hidews = q.hidews

  // query.showForkable
  if (q.showForkable === '1') newQ.showForkable = q.showForkable

  // query.searchName
  if (q.searchName) newQ.searchName = q.searchName

  return newQ
}

const Empty = <p>No matching projects</p>

const ProjectsAsCards = ({ projects, ownedFlag, user }) => {
  if (!projects || projects.length === 0) return Empty

  var count = 0

  const retval = (
    <Card.Group>
      {projects.map(project => {
        const isOwner = user && project.ownerId === user._id
        if (isOwner === ownedFlag || !user) {
          count++
          return <ProjectCard project={project} canEdit={false} canLinkToSrc={false} key={project._id} />
        }
      })}
    </Card.Group>
  )

  return count > 0 ? retval : Empty
}

class UserProjectListUI extends React.PureComponent {
  static propTypes = {
    params: PropTypes.object, // params.id is the USER id  OR  params.username is the username
    user: PropTypes.object, // This is the related user record. We list the projects for this user
    currUser: PropTypes.object, // Currently Logged in user. Can be null
    location: PropTypes.object,
    loading: PropTypes.bool,
    projects: PropTypes.array,
  }

  /** helper Function for updating just a query string with react router
  */
  _updateLocationQuery = queryModifier => {
    let loc = this.props.location
    let newQ = Object.assign({}, loc.query, queryModifier)
    newQ = _stripQueryOfDefaults(newQ)
    // This is browserHistory.push and NOT utilPushTo() since we are staying on the same page
    browserHistory.push(Object.assign({}, loc, { query: newQ }))
  }

  handleSearchGo = newSearchText => this._updateLocationQuery({ searchName: newSearchText })

  handleChangeShowForkableFlag = newValue => this._updateLocationQuery({ showForkable: newValue })

  render() {
    const { user, currUser, location, loading, projects } = this.props
    const ownerName = user ? user.profile.name : 'all users'
    const qN = _queryNormalized(location.query)
    const pageTitle = user ? `${ownerName}'s Projects` : 'All Projects'

    return (
      <Segment.Group horizontal className="mgb-suir-plainSegment">
        <Helmet title={`${ownerName} Project List`} meta={[{ name: 'Projects list', content: 'Projects' }]} />
        <Segment style={_filterSegmentStyle}>
          <Header as="h2" content={pageTitle} />

          <div id="mgbjr-project-search-searchStringInput">
            <InputSearchBox size="small" fluid value={qN.searchName} onFinalChange={this.handleSearchGo} />
          </div>

          <div style={{ marginTop: '1em', textAlign: 'center' }}>
            <Menu secondary compact borderless className="fitted">
              <ProjectsShowForkableSelector
                showForkable={qN.showForkable}
                handleChangeFlag={this.handleChangeShowForkableFlag}
              />
            </Menu>
          </div>
        </Segment>

        <Segment style={_contentsSegmentStyle} className="mgb-suir-plainSegment">
          {user ? (
            <div>
              <Header as="h2">Projects owned by {ownerName}</Header>
              <CreateProjectLinkButton currUser={currUser} />
              <p />
              {loading ? <Spinner /> : <ProjectsAsCards projects={projects} ownedFlag user={user} />}
              <br />
              <Divider />
              <Header as="h2">Projects {ownerName} is a member of</Header>
              {loading ? <Spinner /> : <ProjectsAsCards projects={projects} ownedFlag={false} user={user} />}
            </div>
          ) : (
            <div>
              <CreateProjectLinkButton currUser={currUser} />
              <p />
              {loading ? <Spinner /> : <ProjectsAsCards projects={projects} ownedFlag={false} user={null} />}
              <br />
            </div>
          )}
        </Segment>
      </Segment.Group>
    )
  }
}

// TODO: Fix problem when an invalid user is in the path. Maybe fix that at the app.js level?

const UserProjectList = createContainer(({ user, location }) => {
  const userId = user ? user._id : null
  const qN = _queryNormalized(location.query)
  let findOpts = {
    sort: projectSorters[qN.sort],
  }
  const showOnlyForkable = qN.showForkable === '1'
  const handleForProjects = Meteor.subscribe(
    'projects.search',
    userId,
    qN.searchName,
    showOnlyForkable,
    qN.hidews,
  )
  const projectSelector = projectMakeSelector(userId, qN.searchName, showOnlyForkable, qN.hidews)

  return {
    projects: Projects.find(projectSelector, findOpts).fetch(),
    loading: !handleForProjects.ready(),
  }
}, UserProjectListUI)

export default UserProjectList
