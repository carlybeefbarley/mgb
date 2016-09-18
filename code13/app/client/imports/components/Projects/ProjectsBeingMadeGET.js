import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import Spinner from '/client/imports/components/Nav/Spinner'
import QLink from '/client/imports/routes/QLink'

import { Projects } from '/imports/schemas'
import { projectMakeFrontPageListSelector, getProjectAvatarUrl } from '/imports/schemas/projects'

export default ProjectsBeingMadeGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    numEntries: PropTypes.number.isRequired,
    chosenClassName: PropTypes.string
  },

  getMeteorData: function() {
    const { numEntries } = this.props

    const handleForProjects = Meteor.subscribe('projects.frontPageList', numEntries)
    const projectSelector = projectMakeFrontPageListSelector()
    return {
      projects: Projects.find(projectSelector).fetch(),
      loading: !handleForProjects.ready()
    }
  },

  render: function() {
    const { chosenClassName } = this.props
    const { loading, projects } = this.data

    if (loading) return <Spinner />

    return (
      <div className={chosenClassName}>
      {
        !projects.length ? "(none)" : 
          projects.map( (p,idx) => (
            <QLink key={idx} className="link item" to={`/u/${p.ownerName}/project/${p._id}`}>
              <img className="ui small middle aligned image" style={{ width: 100 }} src={getProjectAvatarUrl(p)} />
              <div className="content middle aligned" style={{ marginLeft: '1em' }}>
                <h3>{p.name}</h3>
                <p><i className="play icon" />00,000 Plays</p>
              </div>
            </QLink>
          ))
      }
      </div>
    )
  }
})