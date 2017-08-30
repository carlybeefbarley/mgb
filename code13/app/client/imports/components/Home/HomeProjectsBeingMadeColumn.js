import React from 'react'
import '/client/imports/routes/home.css'
import '/client/imports/routes/GetStarted.css'
import ProjectsBeingMadeGET from '/client/imports/components/Projects/ProjectsBeingMadeGET'

import { Grid, Header, Button, Segment } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const _propTypes = {}

const segmentStyle = {
  display: 'flex',
  flexDirection: 'column',
}

const listStyle = {
  flex: '1',
}

const HomeProjectsBeingMadeColumn = () => (
  <Grid.Column className="animated fadeIn">
    <Segment raised style={segmentStyle}>
      <Header as="h2" textAlign="center">
        See games being made
      </Header>
      <ProjectsBeingMadeGET numEntries={4} relaxed="very" style={listStyle} />
      <br />
      <Button as={QLink} to={`/games`} fluid primary size="large" content="See more games" />
    </Segment>
  </Grid.Column>
)

HomeProjectsBeingMadeColumn.propTypes = _propTypes
export default HomeProjectsBeingMadeColumn
