import React, { PropTypes } from 'react'
import { createContainer } from 'meteor/react-meteor-data'
import Spinner from '/client/imports/components/Nav/Spinner'
import QLink from '/client/imports/routes/QLink'

import { Projects } from '/imports/schemas'
import { projectMakeFrontPageListSelector } from '/imports/schemas/projects'
import { Header, Icon, List } from 'semantic-ui-react'
import { getProjectAvatarUrl, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import SpecialGlobals from '/imports/SpecialGlobals'

const _titleWrapperStyle = {
  width: '100%',
  position: 'relative',
  paddingLeft: '75px',
  left: '-60px',
}
const _titleStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}

const membersStr = ( memberIds ) => {
  const n = memberIds ? memberIds.length : 0
  return n === 1 ? '1 members' : `${n} members`
}


class ProjectsBeingMadeGetUI extends React.Component {

  static propTypes = {
    numEntries:       PropTypes.number.isRequired,
    chosenClassName:  PropTypes.string
  }

  render() {
    const { chosenClassName, loading, projects } = this.props

    if (loading)
      return <Spinner />

    return (
      <div className={chosenClassName} style={{overflow: 'hidden'}}>
      {
        !projects.length ? "(none)" :
          projects.map( (p,idx) => (
            <List.Item as={QLink} key={idx} style={{ whiteSpace: 'nowrap' }} to={`/u/${p.ownerName}/projects/${p.name}`}>
              <img className="ui small middle aligned image" style={{ height: 60, width: 'auto', maxWidth: 90 }}
                   src={getProjectAvatarUrl(p, makeExpireTimestamp(SpecialGlobals.avatar.validFor))} />
              <div className="content middle aligned" style={_titleWrapperStyle}>
                <Header as='h3' style={_titleStyle}>
                  {p.name}
                </Header>
                <p>
                  { (p.memberIds && p.memberIds.length > 0) && <Icon color='grey' name='user' /> }
                  { (p.memberIds && p.memberIds.length > 0) ? membersStr(p.memberIds) : ' ' }
                </p>
              </div>
            </List.Item>
          ))
      }
      </div>
    )
  }
}


export default ProjectsBeingMadeGET = createContainer(
  ( { numEntries } ) => {
    const handleForProjects = Meteor.subscribe('projects.frontPageList', numEntries)
    const projectSelector = projectMakeFrontPageListSelector()
    const projectFindOptions =  { limit: numEntries, sort: { updatedAt: -1 } }
    return {
      projects: Projects.find(projectSelector, projectFindOptions).fetch(),
      loading: !handleForProjects.ready()
    }
  }, ProjectsBeingMadeGetUI)
