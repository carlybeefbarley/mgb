import React from 'react'
import { Grid, Header, Segment, List, Button } from 'semantic-ui-react'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import Spinner from '/client/imports/components/Nav/Spinner'
import ReactQuill from 'react-quill'
import AssignmentsListGET from '/client/imports/components/Education/AssignmentsListGET'
import StudentListGET from '/client/imports/components/Education/StudentListGET'
import QLink from '/client/imports/routes/QLink'

export default class ClassroomStudentView extends React.Component {
  render() {
    const { currUser, classroom, teacher, toggleChat } = this.props

    if (!classroom) {
      return <Spinner loadingMsg="Loading Classroom..." />
    }

    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = classroom

    const titleStyle = {
      fontSize: '1.6em',
      textAlign: 'center',
    }

    const infoStyle = {
      fontSize: '1.7em',
      textAlign: 'center',
      marginTop: '0.2em',
    }

    const cellStyle = {
      textAlign: 'center',
    }

    const headerStyle = {
      color: 'lightgrey',
      fontSize: '2.5em',
      textAlign: 'center',
    }

    const rowStyle = {
      minHeight: '18em',
      maxHeight: '18em',
      marginBottom: '1em',
    }

    const secondRowStyle = {
      minHeight: '14em',
      maxHeight: '14em',
      marginBottom: '1em',
    }

    const listStyle = {
      overflowY: 'auto',
      maxHeight: '13em',
      minHeight: '13em',
    }

    const smallStyle = {
      fontSize: '0.7em',
    }

    return (
      <div style={containerStyle}>
        <Grid columns={1} padded>
          <Grid.Column width={3} />
          <Grid.Row>
            <Grid.Column width={13}>
              <Header as="h1" content="Student Classroom Dashboard" style={headerStyle} />
            </Grid.Column>
          </Grid.Row>

          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue" style={rowStyle}>
                <Header style={titleStyle} as="h1" content={classroom && classroom.name} />

                <ImageShowOrChange
                  id="mgbjr-profile-avatar"
                  maxHeight="8em"
                  maxWidth="auto"
                  imageSrc={avatar}
                  header="User Avatar"
                  canEdit={false}
                />
                <List style={infoStyle}>
                  <List.Item>
                    <List.Content style={smallStyle}>
                      Teacher:&nbsp;
                      {teacher && <QLink to={`/u/${teacher.username}`}>{`${teacher.username}`}</QLink>}
                    </List.Content>
                  </List.Item>
                  <List.Item>
                    <List.Content onClick={toggleChat}>
                      <Button icon="chat" color="blue" content="Classroom Chat" />
                    </List.Content>
                  </List.Item>
                </List>
              </Segment>
            </Grid.Column>
            <Grid.Column width={8}>
              <Segment raised color="green" style={rowStyle}>
                <Header as="h3" content="About this Class" />
                <Segment>
                  <ReactQuill
                    readOnly
                    style={{ pointerEvents: 'none' }}
                    theme={null}
                    defaultValue={classroom && classroom.description}
                  />
                </Segment>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={13}>
              <Segment raised color="yellow" style={rowStyle}>
                <Header as="h3" content="Upcoming Assignments" />
                <div style={listStyle}>
                  <AssignmentsListGET {...this.props} showUpcoming showNoDueDate showProjectCreateButtons />
                </div>
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={13}>
              <Segment raised color="purple" style={secondRowStyle}>
                <Header as="h3" content="Classmates" />
                <StudentListGET studentIds={classroom.studentIds} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={13}>
              <Segment raised color="red" style={secondRowStyle}>
                <Header as="h3" content="Our Finished Games" />
                <UserProfileGamesList user={currUser} currUser={currUser} />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>

      // <div style={containerStyle}>

      //   <Grid columns={2} padded stretched>
      //     <Grid.Row style={rowStyle}>
      //       <Grid.Column width={5}>
      //         <Segment raised color="blue" style={rowStyle}>
      //           <Header style={titleStyle} as="h1" content={classroom && classroom.name} />

      //           {/* Change avatar for classroom later  */}
      //           <ImageShowOrChange
      //             id="mgbjr-profile-avatar"
      //             maxHeight="12em"
      //             maxWidth="auto"
      //             imageSrc={avatar}
      //             header="User Avatar"
      //             canEdit={false}
      //           />
      //           <List style={infoStyle}>
      //             <List.Item>
      //               <List.Content>
      //                 {teacher && <QLink to={`/u/${teacher.username}`}>{`${teacher.username}`}</QLink>}
      //               </List.Content>
      //             </List.Item>
      //             <List.Item>
      //               <List.Content onClick={toggleChat}>
      //                 <Button icon="chat" color="blue" content="Classroom Chat" />
      //               </List.Content>
      //             </List.Item>
      //           </List>
      //         </Segment>
      //       </Grid.Column>

      //       <Grid.Column width={8}>
      //         <Segment raised color="green">
      //           <Header as="h2" content="About this Class" />
      //           <Segment>
      //             <ReactQuill
      //               readOnly
      //               style={{ pointerEvents: 'none' }}
      //               theme={null}
      //               defaultValue={classroom && classroom.description}
      //             />
      //           </Segment>
      //         </Segment>
      //       </Grid.Column>
      //     </Grid.Row>
      //     <Grid.Row>
      //       <Grid.Column width={13}>
      //         <Segment raised color="yellow">
      //           <Header as="h2" content="Upcoming Assignments" />
      //           <AssignmentsListGET {...this.props} showUpcoming showNoDueDate showProjectCreateButtons />
      //         </Segment>
      //       </Grid.Column>
      //     </Grid.Row>
      //     <Grid.Column width={13}>
      //       <Grid.Row>
      //         <Segment raised color="purple">
      //           <Header as="h2" content="Students" />
      //           <StudentListGET studentIds={classroom.studentIds} />
      //         </Segment>
      //       </Grid.Row>
      //     </Grid.Column>

      //     <Grid.Column width={13}>
      //       <Grid.Row>
      //         <Segment raised color="orange">
      //           <Header as="h2" content="Published Games from this Class" />
      //           <UserProfileGamesList user={currUser} currUser={currUser} />
      //         </Segment>
      //       </Grid.Row>
      //     </Grid.Column>
      //   </Grid>
      // </div>
    )
  }
}
