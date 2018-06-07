import React from 'react'
import { Container, Divider, Grid, Header, Segment } from 'semantic-ui-react'
import Footer from '/client/imports/components/Footer/Footer'
import PropTypes from 'prop-types'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import SkillAction from '/client/imports/components/Dashboard/Actions/SkillAction'
import UserColleaguesList from '/client/imports/routes/Users/UserColleaguesList'

//import RecentAssetAction from './Actions/RecentAssetAction'

export default class Dashboard1st extends React.Component {
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
      <Container style={containerStyle}>
        <Grid columns={2} padded>
          <Grid.Row>
            <Grid.Column>
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
            <Grid.Column>
              <Segment raised color="blue">
                <Header as="h2" content="Upcoming Assignments" />
                ...
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
      </Container>
    )
  }
}
