import React from 'react'
import { Container, Divider, Grid, Header, Segment, Tab, List } from 'semantic-ui-react'
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
      </List>
    )
  }
}

class Dashboard1st extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
  }
  render() {
    const { currUser } = this.props
    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = currUser.profile

    return (
      <div>
        <Grid columns={2} padded>
          <Grid.Row>
            <Grid.Column width={5}>
              <Segment raised color="blue">
                <Header as="h1" content={`Student Dashboard: ${currUser.username}`} />
                <ImageShowOrChange
                  id="mgbjr-profile-avatar"
                  maxHeight="8em"
                  maxWidth="auto"
                  imageSrc={avatar}
                  header="User Avatar"
                  canEdit={true}
                />
              </Segment>
              {/* Not sure if we are tracking skills with AIE
                
                <SkillAction currUser={currUser} />  
                <RecentAssetAction currUser={currUser} />*/}
            </Grid.Column>
            <Grid.Column width={11}>
              <Segment raised color="blue">
                <Header as="h2" content="Upcoming Assignments" />
                <AssignmentsList />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Divider hidden />

        <Grid padded stackable>
          <Grid.Column tablet={11} computer={12}>
            <Header as="h3" color="grey" content="My Badges" />
            {/* <BadgesSegment currUser={currUser} /> */}

            <Grid>
              {/*
                Heads Up!
                This is a responsive position.
                The ExploreSegment appears at the end of the page in mobile/tablet.
                See below...
              */}
              <Grid.Column width={16} only="computer">
                <Divider hidden section />
                {/* <ExploreSegment /> */}
              </Grid.Column>
            </Grid>
          </Grid.Column>

          <Grid.Column width={16}>
            {/* <ExploreSegment /> */}
            <UserProfileGamesList user={currUser} currUser={currUser} />
            <UserColleaguesList user={currUser} narrowItem projects={this.props.currUserProjects} />
          </Grid.Column>
        </Grid>
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
            <Dashboard1st {...this.props} />
          </Tab.Pane>
        ),
      },
      {
        menuItem: 'Classroom 1',
        render: () => <Tab.Pane>Do stuff already</Tab.Pane>,
      },
    ]
    return (
      <Container>
        <Tab panes={panes} />
      </Container>
    )
  }
}
