import React, { PropTypes } from 'react'
import { Container, Divider, Grid, Header } from 'semantic-ui-react'
import SkillAction from './Actions/SkillAction'
import RecentAssetAction from './Actions/RecentAssetAction'
// import VideoAction from './Actions/VideoAction'
import FeedSegment from './Feed/FeedSegment'
import FaqSegment from './Faq/FaqSegment'
import BadgesSegment from './Badges/BadgesSegment'
import ExploreSegment from './Explore/ExploreSegment'

export default class Dashboard1st extends React.Component {
  static propTypes = {
    currUser: PropTypes.object,
    activities: PropTypes.array,
  }

  render() {
    const { activities, currUser } = this.props

    return (
      <Container>
        <Grid columns={1} padded>
          <Grid.Column>
            <Header as="h3" color="grey" content="Next up" />
            <SkillAction currUser={currUser} />
            {/* TODO uncomment once we get more videos
            <VideoAction />
            */}
            <RecentAssetAction currUser={currUser} />
          </Grid.Column>
        </Grid>

        <Divider hidden />

        <Grid padded stackable>
          <Grid.Column tablet={11} computer={12}>
            <Header as="h3" color="grey" content="My Badges" />
            <BadgesSegment currUser={currUser} />

            <Grid>
              {/*
                Heads Up!
                This is a responsive position.
                The ExploreSegment appears at the end of the page in mobile/tablet.
                See below...
              */}
              <Grid.Column width={16} only="computer">
                <Divider hidden section />
                <ExploreSegment />
              </Grid.Column>
            </Grid>
          </Grid.Column>

          <Grid.Column tablet={5} computer={4}>
            <FeedSegment feedArr={currUser} currUser={currUser} activities={activities} />
            <Divider hidden section />
            <FaqSegment />
          </Grid.Column>

          {/*
            Heads Up!
            This is a responsive position.
            The ExploreSegment appears under the BadgesSegment in desktop.
            See above...
          */}
          <Grid.Column width={16} only="mobile tablet">
            <ExploreSegment />
          </Grid.Column>
        </Grid>
      </Container>
    )
  }
}
