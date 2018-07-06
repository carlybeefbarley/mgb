//@ts-check

import React from 'react'
import {
  Container,
  Divider,
  Button,
  Icon,
  Card,
  Image,
  Grid,
  Header,
  Segment,
  Tab,
  List,
  Input,
  TextArea,
  Table,
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
import HoverImage from 'react-hover-image'
import StudentDashboard from '/client/imports/components/Education/StudentDashboard'
import TeacherDashboard from '/client/imports/components/Education/TeacherDashboard'
import ClassroomRoute from '/client/imports/routes/Education/ClassroomRoute'

// DO NOT USE
// Use AssignmentsListGET instead. You may pass props showPastDue showNoDueDate & showUpcoming
// class UpcomingClassAssignmentsList extends React.Component {
//   render() {
//     return (
//       <List>
//         <List.Item key="id">
//           <List.Icon name="student" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>Assignment Name</List.Header>
//             <List.Description>
//               <small>Carly is cool</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id2">
//           <List.Icon name="code" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>Your Mom</List.Header>
//             <List.Description>
//               <small>goes to college</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id3">
//           <List.Icon name="clock" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>Llama Llama</List.Header>
//             <List.Description>
//               <small>red pajamas</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id4">
//           <List.Icon name="keyboard" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>Bread Jedi</List.Header>
//             <List.Description>
//               <small>flexible bean</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id5">
//           <List.Icon name="smile" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>See ya See ya</List.Header>
//             <List.Description>
//               <small>wouldn't wanna be ya</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id6">
//           <List.Icon name="female" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>Girls Rule</List.Header>
//             <List.Description>
//               <small>boys drool</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//       </List>
//     )
//   }
// }

// DO NOT USE
// Use AssignmentsListGET instead. You may pass props showPastDue showNoDueDate & showUpcoming
// class PastClassAssignmentsList extends React.Component {
//   render() {
//     return (
//       <List>
//         <List.Item key="id">
//           <List.Icon name="student" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>Foo bar</List.Header>
//             <List.Description>
//               <small>Carly is cool</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id2">
//           <List.Icon name="code" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>Your Mom</List.Header>
//             <List.Description>
//               <small>goes to college</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id3">
//           <List.Icon name="clock" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>Llama Llama</List.Header>
//             <List.Description>
//               <small>red pajamas</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id4">
//           <List.Icon name="keyboard" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>Bread Jedi</List.Header>
//             <List.Description>
//               <small>flexible bean</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id5">
//           <List.Icon name="smile" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>See ya See ya</List.Header>
//             <List.Description>
//               <small>wouldn't wanna be ya</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id6">
//           <List.Icon name="female" />
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>when</small>
//             </List.Content>
//             <List.Header>Girls Rule</List.Header>
//             <List.Description>
//               <small>boys drool</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//       </List>
//     )
//   }
// }

// DO NOT USE
// Use SubmissionFeed from imports/components/Education
// class SubmissionFeed extends React.Component {
//   render() {
//     return (
//       <List>
//         <List.Item key="id">
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>date submitted</small>
//             </List.Content>
//             <List.Header>Student Name</List.Header>
//             <List.Description>
//               <small>Assignment Name</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id2">
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>date submitted</small>
//             </List.Content>
//             <List.Header>Student Name</List.Header>
//             <List.Description>
//               <small>Assignment Name</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id3">
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>date submitted</small>
//             </List.Content>
//             <List.Header>Student Name</List.Header>
//             <List.Description>
//               <small>Assignment Name</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id4">
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>date submitted</small>
//             </List.Content>
//             <List.Header>Student Name</List.Header>
//             <List.Description>
//               <small>Assignment Name</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id5">
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>date submitted</small>
//             </List.Content>
//             <List.Header>Student Name</List.Header>
//             <List.Description>
//               <small>Assignment Name</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//         <List.Item key="id6">
//           <List.Content style={{ width: '100%' }}>
//             <List.Content floated="right">
//               <small style={{ color: 'lightgray' }}>date submitted</small>
//             </List.Content>
//             <List.Header>Student Name</List.Header>
//             <List.Description>
//               <small>Assignment Name</small>
//             </List.Description>
//           </List.Content>
//         </List.Item>
//       </List>
//     )
//   }
// }

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

// DO NOT USE
// Moved to ClassroomDashboardRoute already implemented.
// class ClassroomDashboard extends React.Component {
//   render() {
//     const { currUser } = this.props
//     const containerStyle = {
//       overflowY: 'auto',
//     }

//     const { avatar } = currUser.profile

//     const titleStyle = {
//       fontSize: '2em',
//       textAlign: 'center',
//     }

//     const infoStyle = {
//       fontSize: '1.3em',
//       textAlign: 'center',
//     }

//     return (
//       <div style={containerStyle}>
//         <Grid columns={2} padded stretched>
//           <Grid.Row>
//             <Grid.Column width={5}>
//               <Segment raised color="blue">
//                 <Header style={titleStyle} as="h1" content={`Classroom Dashboard`} />

//                 {/* Change avatar for classroom later  */}
//                 <ImageShowOrChange
//                   id="mgbjr-profile-avatar"
//                   maxHeight="11em"
//                   maxWidth="auto"
//                   imageSrc={avatar}
//                   header="User Avatar"
//                   canEdit={false}
//                 />
//                 <List style={infoStyle}>
//                   <List.Item>
//                     <List.Content>Teacher Name - ALREADY IMPLEMENTED</List.Content>
//                   </List.Item>
//                   <List.Item>
//                     <List.Content>
//                       <List.Icon name="chat" color="blue" />Class Chat
//                     </List.Content>
//                   </List.Item>
//                 </List>
//               </Segment>
//             </Grid.Column>
//             <Grid.Column width={11}>
//               <Segment raised color="blue">
//                 <Header as="h3" content="About this Class" />
//                 <Segment>
//                   <p>
//                     Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
//                     ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
//                     ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
//                     reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
//                     sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
//                     est laborum.
//                   </p>

//                   <p>
//                     Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
//                     ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
//                     ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
//                     reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur
//                     sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
//                     est laborum.
//                   </p>
//                 </Segment>
//               </Segment>
//             </Grid.Column>
//           </Grid.Row>
//         </Grid>

//         <Grid columns={2} padded stackable>
//           <Grid.Row>
//             <Grid.Column width={8}>
//               <Segment raised color="yellow">
//                 <Header as="h2" content="Upcoming Assignments" />
//                 <UpcomingClassAssignmentsList />
//               </Segment>
//             </Grid.Column>

//             <Grid.Column width={8}>
//               <Segment raised color="yellow">
//                 <Header as="h2" content="Past Assignments" />
//                 <PastClassAssignmentsList />
//               </Segment>
//             </Grid.Column>
//           </Grid.Row>
//         </Grid>
//         <Grid columns={1} padded stackable>
//           <Grid.Column width={16}>
//             <Grid.Row>
//               <Segment raised color="purple">
//                 <UserColleaguesList user={currUser} narrowItem projects={this.props.currUserProjects} />
//               </Segment>
//             </Grid.Row>
//           </Grid.Column>
//         </Grid>
//         <Grid columns={1} padded stackable>
//           <Grid.Column width={16}>
//             <Grid.Row>
//               <Segment raised color="teal">
//                 <UserProfileGamesList user={currUser} currUser={currUser} />
//               </Segment>
//             </Grid.Row>
//           </Grid.Column>
//         </Grid>
//       </div>
//     )
//   }
// }

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

// TODO: Needs to be refactored to own route
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

// TODO: Refactor to own class inside of HomePageRoute when refactoring class HomePage
class HomeHeroBanner extends React.Component {
  render() {
    const { currUser } = this.props
    const { userId } = this.props

    const mascotColumnStyle = {
      pointerEvents: 'none',
    }
    const gameProgrammingStyle = {
      color: 'black',
      border: '10 px solid orange',
    }

    const headerStyle = {
      fontSize: '3.2em',
      textAlign: 'center',
    }

    const subheaderStyle = {
      color: '#00cc00',
    }

    return (
      <div id="container">
        <Grid verticalAlign="middle" padded>
          <Grid.Row>
            <Grid.Column width={2} />
            <Grid.Column width={5} style={mascotColumnStyle}>
              <Image size="large" centered src={UX.makeMascotImgLink('team')} />
              <Header style={headerStyle} inverted>
                <huge>My Game Builder</huge>
                <Header.Subheader style={subheaderStyle}>
                  <p>Make Games. Make Friends. Have Fun.</p>
                </Header.Subheader>
              </Header>
            </Grid.Column>
            <Grid.Column width={2} />
            <Grid.Column width={5}>
              <Image size="large" centered src={UX.makeMascotImgLink('AIE-logo')} />
            </Grid.Column>
            <Grid.Column width={2} />
          </Grid.Row>
          <Grid.Row />
          <Grid.Row centered>
            {userId ? (
              <p style={{ color: '#fff', fontSize: '1.5em', maxWidth: '450px' }}>
                Welcome back, {currUser.username}!
                <br />
                Last time you were working on{' '}
                <em>
                  <RecentlyEditedAssetGET userId={userId} />
                </em>.
                <br />
                <Button
                  as={QLink}
                  to={`/u/${currUser.username}/assets`}
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
              <p style={{ color: '#fff', fontSize: '3.5em', textAlign: 'center' }}>
                Combining Forces So That You Can Learn How to Code Games With Your Class
                <br />
                <Button
                  centered
                  as={QLink}
                  to={`/signup`}
                  secondary
                  size="massive"
                  style={{ marginTop: '0.5em' }}
                  content="Sign me up"
                />
              </p>
            )}
          </Grid.Row>
        </Grid>
        <Divider section />
        <Grid>
          <Grid.Row>
            <Grid.Column width={2} />
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('game-design-and-production')}
                hoverSrc={UX.makeMascotImgLink('game-design-and-production2')}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('learn-from-industry-leaders')}
                hoverSrc={UX.makeMascotImgLink('learn-from-industry-leaders2')}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('aie-child')}
                hoverSrc={UX.makeMascotImgLink('aie-child2')}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('work-on-latest-hardware-and-industry-software-tools')}
                hoverSrc={UX.makeMascotImgLink('work-on-latest-hardware-and-industry-software-tools2')}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('aie-game-programming')}
                hoverSrc={UX.makeMascotImgLink('aie-game-programming2')}
              />
            </Grid.Column>
            <Grid.Column width={2}>
              <HoverImage
                src={UX.makeMascotImgLink('develop-practical-skills-demanded-by-industry')}
                hoverSrc={UX.makeMascotImgLink('develop-practical-skills-demanded-by-industry2')}
              />
            </Grid.Column>
            <Grid.Column minWidth={2} />
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

// DO NOT USE - Has been refactored into a single component along with student classroom as ClassroomRoute
// class TeacherClassroom extends React.Component {
//   render() {
//     const { currUser } = this.props

//     const containerStyle = {
//       overflowY: 'auto',
//     }

//     const { avatar } = currUser.profile

//     const titleStyle = {
//       fontSize: '2em',
//       textAlign: 'center',
//     }

//     const infoStyle = {
//       fontSize: '1.7em',
//       textAlign: 'center',
//     }

//     const cellStyle = {
//       textAlign: 'center',
//     }

//     // const buttonStyle = {
//     //   float: 'right',
//     // }

//     return (
//       <div style={containerStyle}>
//         {/* FLoating doesn't seem to work unless I include columns */}
//         <Grid columns={1} padded>
//           <Grid.Column width={16}>
//             <div>
//               <Button color="orange" floated="right">
//                 Add New Assignment
//               </Button>
//             </div>
//           </Grid.Column>
//         </Grid>
//         <Grid columns={2} padded stretched>
//           <Grid.Row>
//             <Grid.Column width={5}>
//               <Segment raised color="blue">
//                 <Header style={titleStyle} as="h1" content={`Classroom Dashboard`} />
//                 <ImageShowOrChange
//                   id="mgbjr-profile-avatar"
//                   maxHeight="11em"
//                   maxWidth="auto"
//                   imageSrc={avatar}
//                   header="User Avatar"
//                   canEdit={false}
//                 />
//                 <List style={infoStyle}>
//                   <List.Item>
//                     <List.Content>
//                       <List.Icon name="chat" color="blue" />Class Chat
//                     </List.Content>
//                   </List.Item>
//                 </List>
//               </Segment>
//             </Grid.Column>
//             <Grid.Column width={11}>
//               <Segment raised color="blue">
//                 <Header as="h3" content="Upcoming Assignments" />

//                 <UpcomingClassAssignmentsList />
//               </Segment>
//             </Grid.Column>
//           </Grid.Row>
//         </Grid>
//         <Grid columns={1} padded>
//           <Grid.Column width={16}>
//             <div>
//               <Button color="green" floated="right">
//                 Add New Student
//               </Button>
//             </div>
//           </Grid.Column>
//         </Grid>
//         <Grid columns={1} padded>
//           <Grid.Column width={16}>
//             <Segment raised color="yellow">
//               <Grid.Row>
//                 <Table celled striped>
//                   <Table.Header>
//                     <Table.Row>
//                       <Table.HeaderCell colSpan="1" />
//                       <Table.HeaderCell colSpan="1">Assignment 1</Table.HeaderCell>
//                       <Table.HeaderCell colSpan="1">Assignment 2</Table.HeaderCell>
//                       <Table.HeaderCell colSpan="1">Assignment 3</Table.HeaderCell>
//                       <Table.HeaderCell colSpan="1">Assignment 4</Table.HeaderCell>
//                       <Table.HeaderCell colSpan="1">Assignment 5</Table.HeaderCell>
//                     </Table.Row>
//                   </Table.Header>
//                   <Table.Body>
//                     <Table.Row>
//                       <Table.Cell collapsing>Jim Bob</Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="check circle" color="green" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="check circle" color="green" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="check circle" color="green" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="x" color="red" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="check circle" color="green" />
//                       </Table.Cell>
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Billy Bob Joe</Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="check circle" color="green" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="x" color="red" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="x" color="red" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="x" color="red" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="x" color="red" />
//                       </Table.Cell>
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Alexander Hamilton</Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="x" color="red" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="plus circle" color="yellow" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="plus circle" color="yellow" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="plus circle" color="yellow" />
//                       </Table.Cell>
//                       <Table.Cell style={cellStyle}>
//                         <Icon name="check circle" color="green" />
//                       </Table.Cell>
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Maria Carey</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Kendrick Lamar</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Archibald T. Doodle</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Dolly Parton</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Howdy Doody</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Janelle Monae</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Ava Grace</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Cookie Monster</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Purple Telletubby</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Ginny Weasley</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Princess Nokia</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Richard Simmons</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                     <Table.Row>
//                       <Table.Cell collapsing>Ada Lovelace</Table.Cell>
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                       <Table.Cell />
//                     </Table.Row>
//                   </Table.Body>
//                 </Table>
//               </Grid.Row>
//             </Segment>
//           </Grid.Column>
//         </Grid>
//       </div>
//     )
//   }
// }

// DO NOT USE, has been refactored to own component and is controlled by EducationDashboard Route
// class TeacherDashboard extends React.Component {
//   render() {
//     const { currUser } = this.props

//     const containerStyle = {
//       overflowY: 'auto',
//     }
//     const titleStyle = {
//       fontSize: '3em',
//       textAlign: 'center',
//     }

//     const { avatar } = currUser.profile

//     const infoStyle = {
//       fontSize: '1.7em',
//       textAlign: 'center',
//     }

//     const inputStyle = {
//       minHeight: '10em',
//       width: '100%',
//       opacity: '0.9',
//     }

//     const ulStyle = {
//       listStyleType: 'none',
//       padding: '5px',
//     }
//     return (
//       <div style={containerStyle}>
//         <Grid columns={1} padded>
//           <Grid.Column width={16}>
//             <div>
//               <Button color="orange" floated="right">
//                 Add New Class
//               </Button>
//             </div>
//           </Grid.Column>
//         </Grid>
//         <Grid columns={2} padded stretched>
//           <Grid.Row>
//             <Grid.Column width={5}>
//               <Segment raised color="blue">
//                 <Header style={titleStyle} as="h1" content={`${currUser.username}`} textAlign="center" />
//                 <ImageShowOrChange
//                   id="mgbjr-profile-avatar"
//                   maxHeight="11em"
//                   maxWidth="auto"
//                   imageSrc={avatar}
//                   header="User Avatar"
//                   canEdit={false}
//                 />
//                 <List style={infoStyle}>
//                   <List.Item>
//                     <List.Content>
//                       <List.Icon name="chat" color="blue" />Class Chat
//                     </List.Content>
//                   </List.Item>
//                 </List>
//               </Segment>
//             </Grid.Column>
//             <Grid.Column width={11}>
//               <Segment raised color="blue">
//                 <Header as="h2" content="Your Classes" />
//                 <ul style={ulStyle}>
//                   <li>Animation Class</li>
//                   <li>JavaScript Class</li>
//                   <li>Phaser Class</li>
//                   <li>Advanced JavaScript</li>
//                   <li>Advanced Animation</li>
//                 </ul>
//               </Segment>
//             </Grid.Column>
//           </Grid.Row>
//         </Grid>
//         <Grid columns={1} padded stackable>
//           <Grid.Column width={16}>
//             <Grid.Row>
//               <Segment raised color="yellow">
//                 <Header as="h2" content="Submission Feed" />
//                 <SubmissionFeed />
//               </Segment>
//             </Grid.Row>
//           </Grid.Column>
//         </Grid>
//         <Grid columns={1} padded stackable>
//           <Grid.Column width={16}>
//             <Grid.Row>
//               <Segment raised color="purple">
//                 <Header as="h2" content="About You" />
//                 <TextArea
//                   placeholder="Let your students know a little bit about your background and what kind of games you have worked on"
//                   style={inputStyle}
//                 />
//               </Segment>
//             </Grid.Row>
//           </Grid.Column>
//         </Grid>
//       </div>
//     )
//   }
// }

// TODO: This boiler plate will be discarded once all other classes/routes are implemented.
export default class DashboardTabs extends React.Component {
  render() {
    const panes = [
      {
        menuItem: 'Student Dashboard',
        render: () => (
          <Tab.Pane>
            <div>Implemented - live demo</div>
            <StudentDashboard {...this.props} />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Classroom (Student & Teacher)  ',
        render: () => (
          <Tab.Pane>
            <div>Implemented - live demo</div>
            <ClassroomRoute {...this.props} params={{ classroomId: 'SbbGBBJc78KwYAH8C' }} />
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
        menuItem: 'Home Page',
        render: () => (
          <Tab.Pane>
            <HomePage {...this.props} />
          </Tab.Pane>
        ),
      },
      // {
      //   menuItem: '(Teacher) Classroom',
      //   render: () => (
      //     <Tab.Pane>
      //       <TeacherClassroom {...this.props} />
      //     </Tab.Pane>
      //   ),
      // },
      {
        menuItem: '(Teacher) Dashboard',
        render: () => (
          <Tab.Pane>
            <div>Implemented - live demo</div>
            <TeacherDashboard {...this.props} />
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
