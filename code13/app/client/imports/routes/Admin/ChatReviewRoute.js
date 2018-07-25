import React, { Component } from 'react'
import SpecialGlobals from '/imports/SpecialGlobals'
import _ from 'lodash'
import {
  Segment,
  Button,
  Dropdown,
  Header,
  Label,
  Divider,
  Icon,
  Input,
  Image,
  Popup,
  Card,
  List,
  Checkbox,
  Grid,
} from 'semantic-ui-react'
import { Chats, Users, Classrooms } from '/imports/schemas'
import { isUserTeacher, isUserSuperAdmin } from '/imports/schemas/roles'
import { utilPushTo } from '/client/imports/routes/QLink'
import { Tracker } from 'meteor/tracker'

const headerStyle = {
  color: 'lightgrey',
  fontSize: '2.5em',
  textAlign: 'center',
}

const chatChannelOptions = [
  { name: 'G_GENERAL_', value: 'G_GENERAL_', text: 'General Chat' },
  { name: 'G_RANDOM_', value: 'G_RANDOM_', text: 'Random Chat' },
  { name: 'G_MGBHELP_', value: 'G_MGBHELP_', text: 'Help Chat' },
  { name: 'G_MGBBUGS_', value: 'G_MGBBUGS_', text: 'Bugs Chat' },
]

export default class ChatReviewRoute extends Component {
  state = {
    students: [],
    chatFilter: '',
    chatsSelector: { createdAt: { $gt: new Date(Date.now() - 24 * 3600 * 1000) } },
    loadingChats: false,
    allUsers: false,
    dateRangeNow: false,
    selectedUsers: [],
    dropdownUsers: [],
    chats: [],
    filteredChats: [],
  }
  componentDidMount() {
    this.redirectOnPermissions()
    // Calling trackers immediately upon a component mounting results in the handler hanging, dunno why.
    // This small delay prevents that from happening.
    setTimeout(this.setDefaultUsers, 100)
  }

  redirectOnPermissions = () => {
    const { currUser } = this.props
    if (!isUserTeacher(currUser) || !isUserSuperAdmin(currUser)) {
      utilPushTo(null, `/`, null)
    }
  }

  createSelectorForChats = () => {
    const { selectorData, allUsers, dateRangeNow } = this.state
    var selector = {
      toChannelName: { $in: [] },
      byUserName: { $in: [] },
      createdAt: { $gt: '', $lt: new Date() },
    }

    // Set selector toChannelName values
    if (selectorData.selectedChannels && selectorData.selectedChannels.length) {
      selector.toChannelName.$in = selectorData.selectedChannels
    } else {
      // scope chat to find nothing if they dont have a channel selected
      selector.toChannelName.$in = ['_NOTHING_']
    }

    // Set selector byUserName values
    if (selectorData.selectedUsers && selectorData.selectedUsers.length && !allUsers) {
      selector.byUserName.$in = selectorData.selectedUsers
    } else if (!allUsers) {
      // if you aren't searching for all users and you have nobody selected then you get
      // to search for an invalid user name and get no results.
      selector.byUserName.$in = ['###############']
    } else if (allUsers) {
      // go ahead and remove by username from the selector because we dont care which user made the chat
      delete selector.byUserName
    }

    // Set selector date range, handle for scenarios where either date is not set appropriately.
    if (selectorData.startDate) {
      // Date string replaced due to weird timezone discrepancy if using dashes instead of slashes
      selector.createdAt.$gt = new Date(selectorData.startDate.replace('-', '/'))
      if (selectorData.endDate && !dateRangeNow) {
        selector.createdAt.$lt = new Date(selectorData.endDate.replace('-', '/'))
      } else {
        delete selector.createdAt.$lt
      }
    }
    // Just remove the "from" date range from the selector if it is unset.
    if (selector.createdAt.$gt === '') {
      delete selector.createdAt.$gt
    }

    this.setState({ chatsSelector: selector }, () => {
      // Once the appropriate selector is created, go ahead and ask meteor to subscribe to the data via that selector.
      // 'get' functions are debounced to prevent subscription spam.
      this.getChatsDebounced()
      this.getUsersDebounced()
    })
  }

  setData = (e, { value, name }) => {
    this.setState(prevState => {
      return { selectorData: { ...prevState.selectorData, [name]: value } }
    }, this.createSelectorForChats)
  }

  setValue = (e, { name, value, checked }) => {
    if (checked === true || checked === false) {
      this.setState(prevState => {
        return { ...prevState, [name]: checked }
      }, this.createSelectorForChats)
    } else {
      this.setState(prevState => {
        return { [name]: value }
      }, this.createSelectorForChats)
    }
  }

  getChats = () => {
    const { chatsSelector } = this.state

    // Subscribe to the chats selected and automatically update state when we get (new) data
    Tracker.autorun(() => {
      this.chatsHandler = Meteor.subscribe('chats.bySelector', chatsSelector, { limit: 50 })

      if (this.chatsHandler.ready()) {
        const chats = Chats.find(chatsSelector).fetch()
        this.setState({ chats, loadingChats: false }, this.filterChats)
      } else if (!this.chatsHandler.ready()) {
        // let the UI know we're loading the chat messages
        this.setState({ loadingChats: true })
      }
    })
  }

  getUsers = () => {
    const { dropdownUsers } = this.state
    // sort the select users into a simple array of names.
    const selectedUsers = _.map(dropdownUsers, user => {
      return user.value
    })

    // Subscribe to the users selected and automatically update state when we get (new) data

    Tracker.autorun(() => {
      this.usersHandler = Meteor.subscribe('users.byName', selectedUsers, 50)
      if (this.usersHandler.ready()) {
        // Tracker automatically sends out new state when this subscription is ready or changes.
        this.setState({ users: Users.find({ username: { $in: selectedUsers } }).fetch() })
      }
    })
  }

  setDefaultUsers = () => {
    const { currUser } = this.props
    const userId = currUser._id
    // Tracker does magical things automatically, I really dislike that but it works.
    // Here it is automatically hooking into the Meteor.subscribe calls to provide reactive data.
    Tracker.autorun(() => {
      // Subscribe to this users classrooms
      this.classroomsHandler = Meteor.subscribe('classrooms.byTeacherId', userId)

      if (this.classroomsHandler.ready()) {
        const classrooms = Classrooms.find({
          $or: [{ ownerId: userId }, { teacherIds: userId }],
        }).fetch()

        // Transform this users classrooms into a single array of the _id all of the students, in every classroom, with no duplicates.
        const studentUserIds = _.uniq(
          _.flattenDeep(
            _.map(classrooms, classroom => {
              return classroom.studentIds
            }),
          ),
        )
        // Subscribe to those users we just created an array of.
        this.studentUsersHandler = Meteor.subscribe('users.getByIdList', studentUserIds)

        if (this.studentUsersHandler.ready()) {
          // Find all of the users that match the previously created list of Ids
          const students = Users.find({ _id: { $in: studentUserIds } }).fetch()
          // Map these user objects into a dropdown-friendly version
          const dropdownStudents = _.map(students, student => {
            return { text: student.username, key: student.username, value: student.username }
          })
          // Inject this dropdown-friendly array of objects into our list of dropdown users.
          // for easy access to students in your classrooms.
          this.setState({ dropdownUsers: dropdownStudents })
        }
      }
    })
  }

  getUsersDebounced = _.debounce(this.getUsers, 500)

  getChatsDebounced = _.debounce(this.getChats, 500)

  getFriendlyChatName(name) {
    return _.find(chatChannelOptions, item => {
      if (item.value === name) {
        return item
      }
    }).text
  }

  handleDropdownAddUser = (e, { value }) => {
    const newUser = { text: value, key: value, value }
    this.setState(prevState => {
      return { dropdownUsers: [...prevState.dropdownUsers, newUser] }
    })
  }

  handleMute = (target, muted) => {
    const { currUser } = this.props
    Meteor.call('User.muteChat', currUser, target, !muted)
  }

  getUserAvatarUrl = userId => {
    const { users } = this.state
    const user = _.find(users, user => {
      if (user._id === userId) return true
    })
    // return the user's avatar or just the default one if something goes wrong.
    return _.get(user, 'profile.avatar', SpecialGlobals.defaultUserProfileImage)
  }

  isUserMuted = userId => {
    const { users } = this.state
    const user = _.find(users, user => {
      if (user._id === userId) return true
    })

    if (_.get(user, 'profile.muted', false)) {
      return true
    } else {
      return false
    }
  }

  toggleDeleteChat = chat => {
    if (chat.isDeleted) {
      Meteor.call('Chat.restore', chat._id)
    } else {
      Meteor.call('Chat.delete', chat._id)
    }
  }

  renderChats = () => {
    const { filteredChats } = this.state

    if (filteredChats.length) {
      return (
        <Segment raised>
          <List relaxed divided>
            {_.map(filteredChats, chat => (
              <List.Item key={chat._id}>
                <Image avatar src={this.getUserAvatarUrl(chat.byUserId)} />
                <List.Content>
                  <List.Header>{`${chat.byUserName} - in ${this.getFriendlyChatName(
                    chat.toChannelName,
                  )}`}</List.Header>
                  <List.Description content={new Date(chat.createdAt).toLocaleString()} />
                  <br />
                  {chat.message}
                  {chat.isDeleted ? <span style={{ color: 'red' }}>(Deleted)</span> : ''}
                </List.Content>
                <Button.Group size="mini" floated="right" compact>
                  <Button
                    content={this.isUserMuted(chat.byUserId) ? 'Muted' : 'Unmuted'}
                    color={this.isUserMuted(chat.byUserId) ? 'red' : 'green'}
                    icon={this.isUserMuted(chat.byUserId) ? 'volume off' : 'volume up'}
                    // floated="right"
                    onClick={() => {
                      this.handleMute(chat.byUserId, this.isUserMuted(chat.byUserId))
                    }}
                  />
                  {/* No Banhammer for now */}
                  {/* <Button size="mini" content="BAN" color="red" icon="ban" floated="right" /> */}
                  <Button
                    icon={chat.isDeleted ? 'check' : 'delete'}
                    content={chat.isDeleted ? 'Restore' : 'Delete'}
                    onClick={() => this.toggleDeleteChat(chat)}
                  />
                </Button.Group>
              </List.Item>
            ))}
          </List>
        </Segment>
      )
    }
    return (
      <Segment
        content={<span style={{ color: 'lightgrey' }}>{this.state.loadingChats}No Results to Show</span>}
      />
    )
  }

  handleFilterChats = (e, { value }) => {
    this.setState({ chatFilter: value }, this.filterChats)
  }

  filterChats = () => {
    const { chatFilter, chats } = this.state
    var filteredChats = chats

    if (chatFilter.length > 0) {
      this.setState(() => {
        filteredChats = _.filter(chats, chat => {
          return chat.message.toLowerCase().includes(chatFilter.toLowerCase())
        })
        return { filteredChats }
      })
      return
    } else {
      this.setState({ filteredChats })
    }
  }

  render() {
    return (
      <Grid columns={1} padded>
        <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={10}>
            <Header as="h1" content="Chat Review" style={headerStyle} />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={4} />
          <Grid.Column width={6} />
          <Grid.Column width={3} />
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={10}>
            <Segment raised color="yellow">
              <Header>
                <Header.Content>Chat Filter Settings</Header.Content>
              </Header>
              <Label ribbon color="green" content="Select Chat Channels" />
              <Divider hidden />
              <Dropdown
                placeholder="Chat Channels"
                fluid
                search
                multiple
                selection
                name="selectedChannels"
                options={chatChannelOptions}
                onChange={this.setData}
              />
              <Divider hidden />
              <Label ribbon color="yellow" content="Select Users" />
              <Divider hidden />
              <Dropdown
                placeholder="Filtered Users"
                fluid
                search
                multiple
                selection
                allowAdditions
                onAddItem={this.handleDropdownAddUser}
                disabled={this.state.allUsers}
                name="selectedUsers"
                options={this.state.dropdownUsers}
                onChange={this.setData}
              />
              <Divider hidden />
              <Checkbox toggle label="Any User" name="allUsers" onChange={this.setValue} />
              <Divider hidden />
              <Label ribbon color="red">
                Select Date Range
              </Label>
              <Divider hidden />
              <Input icon="calendar" type="date" name="startDate" label="from" onChange={this.setData} />
              <Icon name="angle right" />
              <Input
                icon="calendar"
                type="date"
                name="endDate"
                label="to"
                disabled={this.state.dateRangeNow}
                onChange={this.setData}
              />
              <Checkbox
                toggle
                name="dateRangeNow"
                label="Until Now"
                onChange={this.setValue}
                style={{ paddingLeft: '1rem' }}
              />
            </Segment>
          </Grid.Column>
          <Grid.Column width={3} />
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={3} />
          <Grid.Column width={10}>
            <Segment raised color="purple">
              <Header>Chats</Header> <Divider hidden />
              <Input
                loading={this.state.loadingChats}
                type="text"
                placeholder="Search"
                icon="search"
                onChange={this.handleFilterChats}
              />
              {this.renderChats()}
            </Segment>
          </Grid.Column>
          <Grid.Column width={3} />
        </Grid.Row>
      </Grid>
    )
  }
}
