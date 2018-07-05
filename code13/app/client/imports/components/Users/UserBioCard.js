import React from 'react'
import PropTypes from 'prop-types'
import ReactQuill from 'react-quill'
import { Segment, Header } from 'semantic-ui-react'
import { createContainer } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'

const segmentStyle = {
  height: '15vh',
}
class UserBioCard extends React.Component {
  render() {
    const { user } = this.props
    return (
      <Segment raised color="purple">
        <Header as="h2" content="About You" />
        <ReactQuill defaultValue={(user && user.profile.bio) || 'null'} />
      </Segment>
    )
  }
}

export default createContainer(props => {
  return { ...props }
}, UserBioCard)
