import React from 'react'
import { Container, Divider, Grid, Header, Segment, Tab, List, Input, TextArea } from 'semantic-ui-react'
import Footer from '/client/imports/components/Footer/Footer'
import PropTypes from 'prop-types'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import SkillAction from '/client/imports/components/Dashboard/Actions/SkillAction'
import UserColleaguesList from '/client/imports/routes/Users/UserColleaguesList'

//import RecentAssetAction from './Actions/RecentAssetAction'

class AssignmentsList extends React.Component {
  render() {
    return (
      <List>
        <List.Item key="id">
          <List.Icon name="student" />
          <List.Content style={{ width: '100%' }}>
            <List.Content floated="right">
              <small style={{ color: 'lightgray' }}>when</small>
            </List.Content>
            <List.Header>Foo bar</List.Header>
            <List.Description>
              <small>Carly is cool</small>
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item key="id2">
          <List.Icon name="code" />
          <List.Content style={{ width: '100%' }}>
            <List.Content floated="right">
              <small style={{ color: 'lightgray' }}>when</small>
            </List.Content>
            <List.Header>Your Mom</List.Header>
            <List.Description>
              <small>goes to college</small>
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item key="id3">
          <List.Icon name="clock" />
          <List.Content style={{ width: '100%' }}>
            <List.Content floated="right">
              <small style={{ color: 'lightgray' }}>when</small>
            </List.Content>
            <List.Header>Llama Llama</List.Header>
            <List.Description>
              <small>red pajamas</small>
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item key="id4">
          <List.Icon name="keyboard" />
          <List.Content style={{ width: '100%' }}>
            <List.Content floated="right">
              <small style={{ color: 'lightgray' }}>when</small>
            </List.Content>
            <List.Header>Bread Jedi</List.Header>
            <List.Description>
              <small>flexible bean</small>
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item key="id5">
          <List.Icon name="smile" />
          <List.Content style={{ width: '100%' }}>
            <List.Content floated="right">
              <small style={{ color: 'lightgray' }}>when</small>
            </List.Content>
            <List.Header>See ya See ya</List.Header>
            <List.Description>
              <small>wouldn't wanna be ya</small>
            </List.Description>
          </List.Content>
        </List.Item>
        <List.Item key="id6">
          <List.Icon name="female" />
          <List.Content style={{ width: '100%' }}>
            <List.Content floated="right">
              <small style={{ color: 'lightgray' }}>when</small>
            </List.Content>
            <List.Header>Girls Rule</List.Header>
            <List.Description>
              <small>boys drool</small>
            </List.Description>
          </List.Content>
        </List.Item>
      </List>
    )
  }
}

class Dashboard extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
  }
  render() {
    const { currUser } = this.props

    const { avatar } = currUser.profile

    const titleStyle = {
      fontSize: '3em',
      textAlign: 'center',
    }

    const infoStyle = {
      fontSize: '1.5em',
      textAlign: 'center',
    }

    const upcomingStyle = {
      minHeight: '21.5em',
    }

    const aboutMeStyle = {
      minHeight: '15em',
    }

    const inputStyle = {
      minHeight: '10em',
      width: '100%',
      opacity: '0.9',
    }

    return (
      <div>
        <Grid columns={2} padded>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <Header style={titleStyle} as="h1" content={`${currUser.username}`} textAlign="center" />
                <ImageShowOrChange
                  id="mgbjr-profile-avatar"
                  maxHeight="11em"
                  maxWidth="auto"
                  imageSrc={avatar}
                  header="User Avatar"
                  canEdit={true}
                />
                <Container style={infoStyle}>
                  <p>
                    Class Name<br />Teacher Name
                  </p>
                </Container>
              </Segment>
              {/* Not sure if we are tracking skills with AIE
                
                <SkillAction currUser={currUser} />  
                <RecentAssetAction currUser={currUser} />*/}
            </Grid.Column>

            <Grid.Column width={11}>
              <Segment raised color="blue" style={upcomingStyle}>
                <Header as="h2" content="Upcoming Assignments" />
                <AssignmentsList />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        {/* <Divider hidden /> */}

        <Grid padded stackable>
          <Grid.Column tablet={16} computer={16}>
            <Segment raised color="yellow" style={aboutMeStyle}>
              <Header as="h2" content="About me" />
              <TextArea
                placeholder="Tell the class a little about yourself and your goals for making games"
                style={inputStyle}
              />
              <br /> <hr /> <br />
              <UserColleaguesList user={currUser} narrowItem projects={this.props.currUserProjects} />
              <br /> <hr /> <br />
              <UserProfileGamesList user={currUser} currUser={currUser} />
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

class ClassroomDashboard extends React.Component {
  render() {
    const { currUser } = this.props
    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = currUser.profile

    const titleStyle = {
      fontSize: '2em',
      textAlign: 'center',
    }

    const infoStyle = {
      fontSize: '1.3em',
      textAlign: 'center',
    }

    return (
      <div style={containerStyle}>
        <Grid columns={2} padded>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <Header style={titleStyle} as="h1" content={`Classroom Dashboard`} />

                {/* Change avatar for classroom later  */}
                <ImageShowOrChange
                  id="mgbjr-profile-avatar"
                  maxHeight="11em"
                  maxWidth="auto"
                  imageSrc={avatar}
                  header="User Avatar"
                  canEdit={false}
                />
                <List style={infoStyle}>
                  <List.Item>
                    <List.Content>Teacher Name</List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content>
                      <List.Icon name="chat" color="blue" />Class Chat
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column width={11}>
              <Segment raised color="blue">
                <Header as="h3" content="About this Class" />
                <Segment>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
                    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                    est laborum.
                  </p>

                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
                    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                    est laborum.
                  </p>
                </Segment>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Divider hidden />
      </div>
    )
  }
}

export default class DashboardTabs extends React.Component {
  render() {
    const panes = [
      {
        menuItem: 'Student Dashboard',
        render: () => (
          <Tab.Pane>
            <Dashboard {...this.props} />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Classroom 1',
        render: () => (
          <Tab.Pane>
            <ClassroomDashboard {...this.props} />
          </Tab.Pane>
        ),
      },
    ]
    return (
      <Container>
        <Tab panes={panes} />
      </Container>
    )
  }
}
