import React, { PropTypes, Component } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'
import ProjectsBeingMadeGET from '/client/imports/components/Projects/ProjectsBeingMadeGET'

import { Grid, Header, Button } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const _propTypes = {
}

const HomeProjectsBeingMadeColumn = () => (
  <Grid.Column className='animated fadeIn'>
    <Header as='h2' style={{ marginBottom: '1em' }}>See games being made</Header>
    <ProjectsBeingMadeGET numEntries={4} chosenClassName="ui very relaxed list" />
    <br />
    <Button as={QLink} to={`/games`} fluid color='teal' size='large' content='See more games' />
  </Grid.Column>
)

HomeProjectsBeingMadeColumn.propTypes = _propTypes
export default HomeProjectsBeingMadeColumn
