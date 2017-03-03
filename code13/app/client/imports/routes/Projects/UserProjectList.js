import _ from 'lodash'
import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import reactMixin from 'react-mixin'
import Spinner from '/client/imports/components/Nav/Spinner'

import { Projects } from '/imports/schemas'
import { projectMakeSelector, projectSorters } from '/imports/schemas/projects'

import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import CreateProjectLinkButton from '/client/imports/components/Projects/NewProject/CreateProjectLinkButton'
import { Segment, Header, Divider } from 'semantic-ui-react'

// Default values for url?query - i.e. the this.props.location.query keys
const queryDefaults = {
  searchName: "",               // Empty string means match all (more convenient than null for input box)
  sort: "edited",               // Should be one of the keys of projectSorters{}
  showForkable: "0"             // showForkable only
}

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

    // query.showForkable
    if (q.showForkable === "1")
      newQ.showForkable = q.showForkable

    // query.searchName
    if (q.searchName)
      newQ.searchName = q.searchName

    return newQ
  },

  getMeteorData: function() {
    const userId = this.props.user._id

    const qN = this.queryNormalized(this.props.location.query)
    const showOnlyForkable = (qN.showForkable === '1')
    const handleForProjects = Meteor.subscribe("projects.byUserId", userId, showOnlyForkable)
    const projectSelector = projectMakeSelector(userId, showOnlyForkable)

    return {
      projects: Projects.find(projectSelector).fetch(),
      loading: !handleForProjects.ready()
    }
  },

  /** Return true if logged on user._id is currUser._id and the projects have been loaded */
  canEdit: function() {
    return !this.data.loading &&
           this.props.currUser && 
           this.props.user._id === this.props.currUser._id &&
           this.data.projects
  },
  
  render: function() {
    if (this.data.loading) return <Spinner />

    const projects = this.data.projects
    const { user, currUser } = this.props
    const ownerName = user.profile.name

    return (
      <Segment basic>

        <Helmet
          title={`${ownerName} Project List`}
          meta={[ {"name": "Projects list", "content": "Projects"} ]}
        />        

        <Header as='h2'>Projects owned by {ownerName}</Header>
        <CreateProjectLinkButton currUser={currUser} />
        <p />
        { this.renderProjectsAsCards(projects, true) }
        <br />
        <Divider />
        <Header as='h2'>Projects {ownerName} is a member of</Header>
        { this.renderProjectsAsCards(projects, false) }

      </Segment>
    )
  },
  
  renderProjectsAsCards(projects, ownedFlag)
  {
    const Empty = <p>No projects for this user</p>
    var count = 0
    if (!projects || projects.length === 0)
      return Empty
      
    const retval = (
      <div className="ui link cards">
        { projects.map( project => {
          const isOwner = (project.ownerId === this.props.user._id)
          if (isOwner === ownedFlag) 
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