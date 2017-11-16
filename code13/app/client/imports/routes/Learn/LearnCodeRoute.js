import PropTypes from 'prop-types'
import React from 'react'
import '../home.css'
import QLink from '../QLink'
import { Divider, Grid, Card, Header, Icon } from 'semantic-ui-react'
import MascotImage from '/client/imports/components/MascotImage/MascotImage'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import { codeItems } from '/imports/Skills/SkillNodes/SkillNodes'

const LearnCodeRoute = ({ currUser, isSuperAdmin, params }, context) => (
  <Grid container columns="1">
    <Divider hidden />
    <Grid.Column>
      <Header as="h1">
        Code
        <Header.Subheader>Learn to code games with JavaScript and Phaser.</Header.Subheader>
      </Header>
    </Grid.Column>
    <Grid.Column>
      <Card.Group itemsPerRow={1} stackable className="skills">
        {codeItems.map((area, idx) => (
          <QLink
            key={idx}
            className="card animated fadeIn"
            style={cardStyle}
            to={area.link}
            query={area.query}
          >
            <Card.Content>
              <MascotImage name={area.mascot} />
              <Header as="h2" style={headerStyle}>
                <Icon name={area.icon} />&nbsp;{area.content}
              </Header>
              <p style={descStyle}>{area.desc}</p>
              {area.skillPath &&
              currUser && (
                <SkillsMap
                  isSuperAdmin={isSuperAdmin}
                  skills={context.skills}
                  skillPaths={[area.skillPath]}
                />
              )}
            </Card.Content>
          </QLink>
        ))}
      </Card.Group>
    </Grid.Column>
  </Grid>
)

LearnCodeRoute.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnCodeRoute

const cardStyle = {
  color: '#2e2e2e',
}

const headerStyle = {
  marginTop: '0.15em',
  marginBottom: '0.4em',
}

const descStyle = {
  fontSize: '1.25em',
  lineHeight: '1.5em',
}
