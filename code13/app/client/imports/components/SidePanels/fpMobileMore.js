import React from 'react'
import { Grid, Icon, Header } from 'semantic-ui-react'

const rowStyle = { paddingTop: '10px', paddingBottom: '0px' }

const fpMobileMore = () => (
  <div>
    <Grid columns={3} style={{ paddingTop: '16px' }}>
      <Grid.Row style={rowStyle}>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="user" size="huge" />
            Profile
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="bullhorn" size="huge" />
            News
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="graduation" size="huge" />
            Learn
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row style={rowStyle}>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="users" size="huge" />
            Users
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="sitemap" size="huge" />
            Projects
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="exclamation" size="huge" />
            Dailies
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row style={rowStyle}>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="winner" size="huge" />
            Jams
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="bell outline" size="huge" />
            Alerts
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="mail outline" size="huge" />
            Feedback
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row style={rowStyle}>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="question" size="huge" />
            Help
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="setting" size="huge" />
            Settings
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h4" icon>
            <Icon circular inverted name="log out" size="huge" />
            Log Out
          </Header>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
)

export default fpMobileMore
