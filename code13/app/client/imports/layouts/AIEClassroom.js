import React from 'react'
import {
  Container,
  Divider,
  Button,
  Image,
  Grid,
  Header,
  Segment,
  Tab,
  List,
  Input,
  TextArea,
} from 'semantic-ui-react'
import Footer from '/client/imports/components/Footer/Footer'
import PropTypes from 'prop-types'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import SkillAction from '/client/imports/components/Dashboard/Actions/SkillAction'
import UserColleaguesList from '/client/imports/routes/Users/UserColleaguesList'
import HeroLayout from '/client/imports/layouts/HeroLayout'
import QLink from '/client/imports/routes/QLink'
import UX from '/client/imports/UX'

//import HomeHeroBanner from '/client/imports/components/Home/HomeHeroBanner'

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

class UpcomingClassAssignmentsList extends React.Component {
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

class PastClassAssignmentsList extends React.Component {
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
              <Grid.Row>
                <Header as="h2" content="About me" />
                <TextArea
                  placeholder="Tell the class a little about yourself and your goals for making games"
                  style={inputStyle}
                />
              </Grid.Row>
              <hr />
              <Grid.Row>
                <UserColleaguesList user={currUser} narrowItem projects={this.props.currUserProjects} />
              </Grid.Row>
              <hr />
              <Grid.Row>
                <UserProfileGamesList user={currUser} currUser={currUser} />
              </Grid.Row>
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    )
  }
}

class TeacherProfile extends React.Component {
  render() {
    const { currUser } = this.props
    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = currUser.profile

    const TeacherNameStyle = {
      fontSize: '2.6em',
      textAlign: 'center',
    }

    const SchoolNameStyle = {
      fontSize: '1.6em',
      textAlign: 'center',
    }

    const ChatFontStyle = {
      textAlign: 'center',
      fontSize: '1.6em',
    }

    const ParagraphStyle = {
      fontSize: '1.05em',
    }

    return (
      <div style={containerStyle}>
        <Grid columns={2} padded>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <List>
                  <List.Item>
                    <List.Content style={TeacherNameStyle}>Teacher Name</List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content style={SchoolNameStyle}>AIE</List.Content>
                  </List.Item>
                </List>

                {/* Change avatar for classroom later  */}
                <ImageShowOrChange
                  id="mgbjr-profile-avatar"
                  maxHeight="11em"
                  maxWidth="auto"
                  imageSrc={avatar}
                  header="User Avatar"
                  canEdit={false}
                />
                <List>
                  <List.Item>
                    <List.Content style={ChatFontStyle}>
                      <List.Icon name="chat" color="blue" />Teacher Chat
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column width={11}>
              <Segment raised color="blue">
                <Header as="h3" content="About Me" />
                <Segment>
                  <p style={ParagraphStyle}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
                    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                    est laborum.
                  </p>
                  <p style={ParagraphStyle}>
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

          <Grid.Row>
            <Grid.Column width={16}>
              <Segment raised color="yellow">
                <UserProfileGamesList user={currUser} currUser={currUser} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
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

    const leftColumnStyle = {
      float: 'left',
      border: '1px solid #BFBCBC',
      padding: '5px',
      //marginRight: '35px',
    }

    const rightColumnStyle = {
      float: 'right',
      border: '1px solid #BFBCBC',
      padding: '5px',
      marginLeft: '4em',
    }

    return (
      <div style={containerStyle}>
        <Grid columns={2} padded stretched>
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
        <Segment raised color="yellow">
          <Grid columns={2} padded stackable>
            <Grid.Row>
              <Grid.Column width={7} style={leftColumnStyle}>
                <Header as="h2" content="Upcoming Assignments" />
                <UpcomingClassAssignmentsList />
              </Grid.Column>
              <Grid.Column width={7} style={rightColumnStyle}>
                <Header as="h2" content="Past Assignments" />
                <PastClassAssignmentsList />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <hr />
          <Grid>
            <Grid.Row>
              <UserColleaguesList user={currUser} narrowItem projects={this.props.currUserProjects} />
            </Grid.Row>
            <hr />
            <Grid.Row>
              <UserProfileGamesList user={currUser} currUser={currUser} />
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }
}

class StudentProfile extends React.Component {
  render() {
    const { currUser } = this.props
    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = currUser.profile

    const TeacherNameStyle = {
      fontSize: '2.3em',
      textAlign: 'center',
    }

    const SchoolNameStyle = {
      fontSize: '1.3em',
      textAlign: 'center',
    }

    const ChatFontStyle = {
      textAlign: 'center',
      fontSize: '1.3em',
    }

    const ParagraphStyle = {
      fontSize: '1.1em',
    }
    return (
      <div style={containerStyle}>
        <Grid columns={2} padded>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <List>
                  <List.Item>
                    <List.Content style={TeacherNameStyle}>Student Name</List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content style={SchoolNameStyle}>Classname</List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content style={SchoolNameStyle}>AIE</List.Content>
                  </List.Item>
                </List>

                {/* Change avatar for classroom later  */}
                <ImageShowOrChange
                  id="mgbjr-profile-avatar"
                  maxHeight="11em"
                  maxWidth="auto"
                  imageSrc={avatar}
                  header="User Avatar"
                  canEdit={false}
                />
                <List>
                  <List.Item>
                    <List.Content style={ChatFontStyle}>
                      <List.Icon name="chat" color="blue" />Student Chat
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>

            <Grid.Column width={11}>
              <Segment raised color="blue">
                <Header as="h3" content="About Me" />
                <Segment>
                  <p style={ParagraphStyle}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                    ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
                    sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                    est laborum.
                  </p>
                  <p style={ParagraphStyle}>
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

          <Grid.Row>
            <Grid.Column width={16}>
              <Segment raised color="yellow">
                <UserProfileGamesList user={currUser} currUser={currUser} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

class HomePage extends React.Component {
  render() {
    return (
      <HeroLayout
        heroContent={
          <div>
            <Divider hidden />

            <HomeHeroBanner />

            <Divider hidden section />
          </div>
        }
      />
    )
  }
}

class HomeHeroBanner extends React.Component {
  render() {
    const { currUser } = this.props
    const { userId } = this.props

    const mascotColumnStyle = {
      pointerEvents: 'none',
    }
    return (
      <Grid columns="3" verticalAlign="middle" padded>
        <Grid.Row>
          <Grid.Column width={4} style={mascotColumnStyle}>
            <Image size="large" centered src={UX.makeMascotImgLink('team')} />
          </Grid.Column>
          <Grid.Column width={8}>
            <Header as="h1" inverted>
              <huge>My Game Builder</huge>
              <Header.Subheader>
                <p>Make Games. Make Friends. Have Fun.</p>
                <p>
                  <QLink to="/roadmap">Public BETA</QLink>
                </p>
              </Header.Subheader>
            </Header>
            {userId ? (
              <p style={{ color: '#fff', fontSize: '1.5em', maxWidth: '450px' }}>
                Welcome back, {username}!
                <br />
                Last time you were working on{' '}
                <em>
                  <RecentlyEditedAssetGET userId={userId} />
                </em>.
                <br />
                <Button
                  as={QLink}
                  to={`/u/${username}/assets`}
                  color="green"
                  size="huge"
                  style={{ marginTop: '1.5em', marginRight: '0.5em' }}
                  content="Keep going"
                />
                <Button
                  as={QLink}
                  to={`/learn`}
                  color="green"
                  size="huge"
                  style={{ marginTop: '0.5em' }}
                  content="Learn new skills"
                />
              </p>
            ) : (
              <p style={{ color: '#fff', fontSize: '1.5em', maxWidth: '450px' }}>
                Learn coding, design, team and biz skills - by making original games with friends
                <br />
                <Button
                  as={QLink}
                  to={`/learn/get-started`}
                  secondary
                  size="huge"
                  style={{ marginTop: '1.5em', marginRight: '0.5em' }}
                  content="Get started"
                />
                <Button
                  as={QLink}
                  to={`/signup`}
                  primary
                  size="huge"
                  style={{ marginTop: '0.5em' }}
                  content="Sign me up"
                />
              </p>
            )}
          </Grid.Column>
          <Grid.Column width={4}>
            <Image size="large" centered src={UX.makeMascotImgLink('aie-logo')} />
          </Grid.Column>
        </Grid.Row>
        <Divider section />
        <Grid.Row>
          <Grid.Column width={2} />
          <Grid.Column width={2}>
            <Image size="large" centered src={UX.makeMascotImgLink('aie-game-programming')} />
          </Grid.Column>
          <Grid.Column width={2}>
            <Image size="large" centered src={UX.makeMascotImgLink('learn-from-industry-leaders')} />
          </Grid.Column>
          <Grid.Column width={2}>
            <Image size="large" centered src={UX.makeMascotImgLink('aie-child')} />
          </Grid.Column>
          <Grid.Column width={2}>
            <Image
              size="large"
              centered
              src={UX.makeMascotImgLink('work-on-latest-hardware-and-industry-software-tools')}
            />
          </Grid.Column>
          <Grid.Column width={2}>
            <Image size="large" centered src={UX.makeMascotImgLink('game-design-and-production')} />
          </Grid.Column>
          <Grid.Column width={2}>
            <Image
              size="large"
              centered
              src={UX.makeMascotImgLink('develop-practical-skills-demanded-by-industry')}
            />
          </Grid.Column>
          <Grid.Column width={2} />
        </Grid.Row>
      </Grid>
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
      {
        menuItem: 'Teacher Profile',
        render: () => (
          <Tab.Pane>
            <TeacherProfile {...this.props} />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Student Profile',
        render: () => (
          <Tab.Pane>
            <StudentProfile {...this.props} />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'HomePage',
        render: () => (
          <Tab.Pane>
            <HomePage {...this.props} />
          </Tab.Pane>
        ),
      },
    ]
    return (
      <Container
        style={{
          overflowY: 'auto',
        }}
      >
        <Tab panes={panes} />
      </Container>
    )
  }
}
