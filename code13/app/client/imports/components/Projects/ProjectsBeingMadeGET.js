import { withTracker } from 'meteor/react-meteor-data'
import PropTypes from 'prop-types'
import React from 'react'
import { Header, Icon, List } from 'semantic-ui-react'

import Spinner from '/client/imports/components/Nav/Spinner'
import QLink from '/client/imports/routes/QLink'
import { Projects } from '/imports/schemas'
import { projectMakeFrontPageListSelector } from '/imports/schemas/projects'
import { getProjectAvatarUrl, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import SpecialGlobals from '/imports/SpecialGlobals'
import FittedImage from '../Controls/FittedImage'

const imageSize = 60 // px

const titleWrapperStyle = {
  width: '100%',
  position: 'relative',
  paddingLeft: `calc(${imageSize}px + 1em)`,
  left: `-${imageSize}px`,
}
const titleStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const listItemStyle = { display: 'flex' }

const membersStr = memberIds => {
  const n = memberIds ? memberIds.length : 0
  return n === 1 ? '1 members' : `${n} members`
}

class ProjectsBeingMadeGetUI extends React.Component {
  static propTypes = {
    numEntries: PropTypes.number.isRequired,
    chosenClassName: PropTypes.string,
  }

  render() {
    const { loading, projects, numEntries, ...listProps } = this.props
    if (loading) return <Spinner />

    const items = !projects.length
      ? ['(none)']
      : projects.map((p, idx) => (
          <List.Item as={QLink} key={idx} style={listItemStyle} to={`/u/${p.ownerName}/projects/${p.name}`}>
            <FittedImage
              src={getProjectAvatarUrl(p, makeExpireTimestamp(SpecialGlobals.avatar.validFor))}
              width={imageSize}
              height={imageSize}
              style={{ flex: '0 0 auto' }}
            />
            <div className="content middle aligned" style={titleWrapperStyle}>
              <Header as="h3" style={titleStyle}>
                {p.name}
              </Header>
              <p>
                {p.memberIds && p.memberIds.length > 0 && <Icon color="grey" name="user" />}
                {p.memberIds && p.memberIds.length > 0 ? membersStr(p.memberIds) : ' '}
              </p>
            </div>
          </List.Item>
        ))

    return (
      <List {...listProps} selection>
        {items}
      </List>
    )
  }
}

const ProjectsBeingMadeGET = withTracker(({ numEntries }) => {
  const handleForProjects = Meteor.subscribe('projects.frontPageList', numEntries)
  const projectSelector = projectMakeFrontPageListSelector()
  const projectFindOptions = { limit: numEntries, sort: { updatedAt: -1 } }
  return {
    projects: Projects.find(projectSelector, projectFindOptions).fetch(),
    loading: !handleForProjects.ready(),
  }
})(ProjectsBeingMadeGetUI)

export default ProjectsBeingMadeGET
