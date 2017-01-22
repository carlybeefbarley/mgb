import React from 'react'
import { Grid, Image, Icon } from 'semantic-ui-react'

const GridExamplePadded = () => (
  <div>
  

    <Grid columns={3} padded>
    <Grid.Row>
      <Grid.Column>
        <Icon circular inverted name='user' size='huge' />
      </Grid.Column>
      <Grid.Column>
        <Icon circular inverted name='bullhorn' size='huge' />
      </Grid.Column>
       <Grid.Column>
        <Icon circular inverted name='map' size='huge' />
      </Grid.Column>
        </Grid.Row>

         <Grid.Row>
      <Grid.Column>
         <Icon circular inverted name='users' size='huge' />
      </Grid.Column>
      <Grid.Column>
         <Icon circular inverted name='feed' size='huge' />
      </Grid.Column>
       <Grid.Column>
        <Icon circular inverted name='exclamation' size='huge' />
      </Grid.Column>
        </Grid.Row>

           <Grid.Row>
      <Grid.Column>
         <Icon circular inverted name='star' size='huge' />
      </Grid.Column>
      <Grid.Column>
         <Icon circular inverted name='folder' size='huge' />
      </Grid.Column>
       <Grid.Column>
        <Icon circular inverted name='winner' size='huge' />
      </Grid.Column>
        </Grid.Row>

        <Grid.Row>
      <Grid.Column>
         <Icon circular inverted name='mail outline' size='huge' />
      </Grid.Column>
      <Grid.Column>
         <Icon circular inverted name='bell outline' size='huge' />
      </Grid.Column>
       <Grid.Column>
        <Icon circular inverted name='graduation' size='huge' />
      </Grid.Column>
        </Grid.Row>

             <Grid.Row>
      <Grid.Column>
         <Icon circular inverted name='question' size='huge' />
      </Grid.Column>
      <Grid.Column>
         <Icon circular inverted name='setting' size='huge' />
      </Grid.Column>
       <Grid.Column>
        <Icon circular inverted name='log out' size='huge' />
      </Grid.Column>
        </Grid.Row>
    </Grid>
  </div>
)

export default GridExamplePadded
