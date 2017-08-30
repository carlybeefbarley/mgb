import React, { PropTypes } from 'react'
import { Grid } from 'semantic-ui-react'
import SkillAction from './Actions/SkillAction'
import VideoAction from './Actions/VideoAction'
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
    return (
      <Grid columns="equal" verticalAlign="top" style={{ margin: '0 0 0 0' }}>
        <Grid.Row stretched>
          <Grid.Column width={10}>
            <SkillAction currUser={this.props.currUser} />

            <VideoAction />

            <BadgesSegment currUser={this.props.currUser} />

            <FeedSegment
              feedArr={this.props.currUser}
              currUser={this.props.currUser}
              activities={this.props.activities}
            />

            <FaqSegment />
          </Grid.Column>
          <Grid.Column width={6}>
            <ExploreSegment />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}
