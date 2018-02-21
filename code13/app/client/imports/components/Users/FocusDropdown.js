import _ from 'lodash'
import React, { Component } from 'react'
import { Form } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import { showToast } from '/client/imports/modules'

const focusTopics = [
  { key: 'action/adventure games', text: 'Action/Adventure Games', value: 'action/adventure games' },
  { key: 'arcade games', text: 'Arcade Games', value: 'arcade games' },
  { key: 'code', text: 'Code', value: 'code' },
  { key: 'code games', text: 'Code Games', value: 'code games' },
  { key: 'fighting games', text: 'Fighting Games', value: 'fighting games' },
  { key: 'game collaboration', text: 'Game Collaboration', value: 'game collaboration' },
  { key: 'graphics', text: 'Graphics', value: 'graphics' },
  { key: 'javascript', text: 'Javascript', value: 'javascript' },
  { key: 'networking', text: 'Networking', value: 'networking' },
  { key: 'non-code games', text: 'Non-Code Games', value: 'non-code games' },
  { key: 'music', text: 'Music', value: 'music' },
  { key: 'platform games', text: 'Platform Games', value: 'platform games' },
  { key: 'puzzle', text: 'Puzzle Games', value: 'Puzzle Games' },
  { key: 'racing games', text: 'Racing Games', value: 'racing games' },
  { key: 'rhythm games', text: 'Rhythm Games', value: 'rhythm games' },
  { key: 'role playing games', text: 'Role Playing Games', value: 'role playing games' },
  { key: 'shooter games', text: 'Shooter Games', value: 'shooter games' },
  { key: 'sound', text: 'Sound', value: 'sound' },
  { key: 'simulation games', text: 'Simulation Games', value: 'simulation games' },
  { key: 'stealth games', text: 'Stealth Games', value: 'stealth games' },
  { key: 'survival games', text: 'Survival Games', value: 'survival games' },
]

export default class FocusDropdown extends Component {
  // propTypes declares the data type that we will expect from our props.  In this case, our prop focusMsg
  // will be a string, which presents a small challenge because FocusTopics is an array...have to split
  // and rejoin it
  // isRequired will sned a warning to the console if prop isn't sent
  static propTypes = {
    user: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      profile: PropTypes.shape({
        focusMsg: PropTypes.string,
      }).isRequired,
    }).isRequired,
  }

  // constructor sets initial state to focusMsg or blank...and splits focusMsg array
  constructor(props) {
    super(props)
    const focusMsg = this.props.user.profile.focusMsg
    this.state = { value: this.parseFocus(focusMsg) }
  }

  parseFocus = focusMsg => {
    const focusMsgArr = _.isArray(focusMsg) ? focusMsg : _.split(focusMsg, ',')

    return _.map(focusTopics, 'value').filter(topic => _.includes(focusMsgArr, topic))
  }

  componentWillReceiveProps(nextProps) {
    const focusMsg = nextProps.user.profile.focusMsg
    this.setState({ value: this.parseFocus(focusMsg) })
  }

  // event handler function updating Meteor of a change when editing ones own profile, which will join into string.
  //  If trying to edit another profile there will be a toast saying you can't edit others profile
  handleChange = (e, { value }) => {
    const prevValue = this.state.value
    this.setState({ value: this.parseFocus(value) })

    Meteor.call('User.updateProfile', this.props.user._id, { 'profile.focusMsg': value.join() }, error => {
      if (!error) return
      showToast.error(error.reason)
      this.setState({ value: prevValue })
    })
  }

  render() {
    const { value } = this.state

    return (
      <Form.Select
        search
        multiple
        fluid
        options={focusTopics}
        placeholder="What are you working on at MGB"
        onChange={this.handleChange}
        value={value}
      />
    )
  }
}
