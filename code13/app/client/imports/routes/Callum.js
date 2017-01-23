import React from 'react'
import { Grid, Image, Icon, Header } from 'semantic-ui-react'

const GridExamplePadded = () => (
  <div>
  

    <Grid columns={3} padded>
    <Grid.Row>
      <Grid.Column>
       <Header as='h3' icon>
        <Icon circular inverted name='user' size='huge' />
        Profile
        </Header>
      </Grid.Column>
      <Grid.Column>
        <Header as='h3' icon>
        <Icon circular inverted name='bullhorn' size='huge' />
        What's New
        </Header>
      </Grid.Column>
       <Grid.Column>
        <Header as='h3' icon>
        <Icon circular inverted name='map' size='huge' />
        Roadmap
        </Header>
      </Grid.Column>
        </Grid.Row>

         <Grid.Row>
      <Grid.Column>
        <Header as='h3' icon>
        <Icon circular inverted name='users' size='huge' />
        Users
        </Header>
      </Grid.Column>
      <Grid.Column>
        <Header as='h3' icon>
        <Icon circular inverted name='feed' size='huge' />
        Feed
        </Header>
      </Grid.Column>
       <Grid.Column>
        <Header as='h3' icon>
        <Icon circular inverted name='exclamation' size='huge' />
        Dailies
        </Header>
      </Grid.Column>
        </Grid.Row>

           <Grid.Row>
      <Grid.Column>
         <Header as='h3' icon>
        <Icon circular inverted name='star' size='huge' />
        Badges
        </Header>
      </Grid.Column>
      <Grid.Column>
         <Header as='h3' icon>
        <Icon circular inverted name='sitemap' size='huge' />
        Projects
        </Header>
      </Grid.Column>
       <Grid.Column>
        <Header as='h3' icon>
        <Icon circular inverted name='winner' size='huge' />
        Competitions
        </Header>
      </Grid.Column>
        </Grid.Row>

        <Grid.Row>
      <Grid.Column>
         <Header as='h3' icon>
        <Icon circular inverted name='mail outline' size='huge' />
        Send Feedback
        </Header>
      </Grid.Column>
      <Grid.Column>
         <Header as='h3' icon>
        <Icon circular inverted name='bell outline' size='huge' />
        Notifications
        </Header>
      </Grid.Column>
       <Grid.Column>
       <Header as='h3' icon>
        <Icon circular inverted name='graduation' size='huge' />
        Learn
        </Header>
      </Grid.Column>
        </Grid.Row>

             <Grid.Row>
      <Grid.Column>
        <Header as='h3' icon>
        <Icon circular inverted name='question' size='huge' />
        Help
        </Header>
      </Grid.Column>
      <Grid.Column>
         <Header as='h3' icon>
        <Icon circular inverted name='setting' size='huge' />
        Settings
        </Header>
      </Grid.Column>
       <Grid.Column>
        <Header as='h3' icon>
        <Icon circular inverted name='log out' size='huge' />
        Log Out
        </Header>
      </Grid.Column>
        </Grid.Row>
    </Grid>
  </div>
)

export default GridExamplePadded
