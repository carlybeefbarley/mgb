import React from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Segment, Header, Button, Divider, TextArea } from 'semantic-ui-react'
import { createContainer } from 'meteor/react-meteor-data'

class UserBioCard extends React.Component {
  static propTypes = {
    canEdit: PropTypes.bool,
  }

  state = { editing: false, bio: this.props.user.profile.bio }

  handleChange = bio => {
    const { user } = this.props
    let data = { 'profile.bio': bio }
    Meteor.call('User.updateProfile', user._id, data, error => {
      if (error) console.error('Could not update profile:', error.reason)
    })
  }

  handleChangeLazy = _.debounce(this.handleChange, 750)

  handleToggleEdit = () => {
    this.setState(
      prevState => {
        return { editing: !prevState.editing }
      },
      () => this.handleChange(this.state.bio),
    )
  }

  handleBioChange = (event, data) => {
    const bio = data.value
    this.setState({ bio }, () => this.handleChangeLazy(bio))
  }

  componentWillUnmount() {
    this.handleChange(this.state.bio)
  }

  render() {
    const { user, canEdit } = this.props
    const { editing, bio } = this.state
    return (
      <Segment raised color="yellow">
        <Header as="h2">
          {canEdit ? 'About You' : `About ${user.username}`}
          {canEdit && (
            <Button
              color="yellow"
              content={editing ? 'Save' : 'Edit'}
              floated="right"
              onClick={this.handleToggleEdit}
            />
          )}
        </Header>
        {canEdit &&
        editing && (
          <TextArea
            style={{ width: '100%' }}
            value={bio}
            placeholder={user.profile.bio}
            onChange={this.handleBioChange}
          />
        )}
        {!editing && <Segment content={bio} />}

        <Divider hidden />
      </Segment>
    )
  }
}

export default createContainer(props => {
  const user = props.user || props.currUser

  return { ...props, user }
}, UserBioCard)
