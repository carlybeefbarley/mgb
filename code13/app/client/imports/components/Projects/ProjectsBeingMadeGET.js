import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import Spinner from '/client/imports/components/Nav/Spinner'
import QLink from '/client/imports/routes/QLink'

import { Projects } from '/imports/schemas'
import { projectMakeFrontPageListSelector, getProjectAvatarUrl } from '/imports/schemas/projects'

export default ProjectsBeingMadeGET = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    numEntries:       PropTypes.number.isRequired,
    chosenClassName:  PropTypes.string
  },

  getMeteorData: function() {
    const { numEntries } = this.props

    const handleForProjects = Meteor.subscribe('projects.frontPageList', numEntries)
    const projectSelector = projectMakeFrontPageListSelector()
    const projectFindOptions =  { limit: numEntries, sort: { updatedAt: -1 } }
    return {
      projects: Projects.find(projectSelector, projectFindOptions).fetch(),
      loading: !handleForProjects.ready()
    }
  },

  render: function() {
    const { chosenClassName } = this.props
    const { loading, projects } = this.data

    const titleWrapperStyle = {
      width: '100%',
      position: 'relative',
      paddingLeft: '75px',
      left: '-60px',
    }
    const titleStyle = {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }

    if (loading) return <Spinner />

    return (
      <div className={chosenClassName}>
      {
        !projects.length ? "(none)" :
          projects.map( (p,idx) => (
            <QLink key={idx} className="link item" style={{ whiteSpace: 'nowrap' }} to={`/u/${p.ownerName}/project/${p._id}`}>
              <img className="ui small middle aligned image" style={{ maxHeight: 60, maxWidth: 60 }} src={getProjectAvatarUrl(p)} />
              <div className="content middle aligned" style={titleWrapperStyle}>
                <h3 className="ui header" style={titleStyle}>{p.name}</h3>
              </div>
            </QLink>
          ))
      }
      </div>
    )
  }
})
