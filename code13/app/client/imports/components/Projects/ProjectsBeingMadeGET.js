import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import Spinner from '/client/imports/components/Nav/Spinner'
import QLink from '/client/imports/routes/QLink'

import { Projects } from '/imports/schemas'
import { projectMakeFrontPageListSelector } from '/imports/schemas/projects'
import { Header, Icon, List } from 'semantic-ui-react'
import { getProjectAvatarUrl, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import SpecialGlobals from '/imports/SpecialGlobals.js'

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
            <List.Item as={QLink} key={idx} style={{ whiteSpace: 'nowrap' }} to={`/u/${p.ownerName}/projects/${p.name}`}>
              <img className="ui small middle aligned image" style={{ maxHeight: 60, maxWidth: 60 }}
                   src={getProjectAvatarUrl(p, makeExpireTimestamp(SpecialGlobals.avatar.validFor))} />
              <div className="content middle aligned" style={titleWrapperStyle}>
                <Header as='h3' style={titleStyle}>
                  {p.name}
                </Header>
                <p>
                  <Icon color='grey' name='user' />
                  { (p.memberIds && p.memberIds.length) ? `${1+p.memberIds.length} members` : '1 member'}
                </p>
              </div>
            </List.Item>
          ))
      }
      </div>
    )
  }
})
