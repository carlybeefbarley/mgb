import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import ReactQuill from 'react-quill'
import { Segment, Header, Button, Divider } from 'semantic-ui-react'
import { createContainer } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'

class UserBioCard extends React.Component {
  static propTypes = {
    canEdit: PropTypes.bool,
  }

  state = { editing: false }

  handleChange = bio => {
    const { user } = this.props
    let data = { profile: { bio } }
    Meteor.call('User.updateProfile', user._id, data, error => {
      if (error) console.error('Could not update profile:', error.reason)
    })
  }

  handleToggleEdit = () => {
    this.setState(prevState => {
      return { editing: !prevState.editing }
    })
  }

  handleQuillChange = (content, delta, source, editor) => this.handleChange(content)

  render() {
    const { user, canEdit } = this.props
    const { editing } = this.state
    return (
      <Segment raised color="purple">
        <Header as="h2">
          {canEdit ? 'About You' : `About ${user.username}`}
          <Button
            color="green"
            content={editing ? 'Save' : 'Edit'}
            floated="right"
            onClick={this.handleToggleEdit}
          />
        </Header>
        {/* <TextArea placeholder={user.profile.bio} /> */}

        <Divider hidden />
        <ReactQuill
          theme={null}
          modules={{}}
          formats={[]}
          style={editing ? { border: 'solid 1px grey' } : { pointerEvents: 'none' }}
          defaultValue={user.profile.bio}
          readOnly={!canEdit}
          disabled
          onChange={this.handleQuillChange}
        />
      </Segment>
    )
  }
}

export default createContainer(props => {
  const user = props.user || props.currUser

  return { ...props, user }
}, UserBioCard)
