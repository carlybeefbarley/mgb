import React, { PropTypes } from 'react'
import '../home.css'
import QLink from '../QLink'
import '../GetStarted.css'
import { Card, Divider, Grid, Header, Icon, Label } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import { skillAreaItems } from '/imports/Skills/SkillAreas'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import './learnRoute.css'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const headerStyle = {
  marginTop: '0.15em',
  marginBottom: '0.4em',
}

const descStyle = {
  fontSize: '1.25em',
  lineHeight: '1.5em',
}

// Override for pages that have special learn routes. Everything else goes to /learn/skills/${area.tag}
const _linkOverrides = {
  code: '/learn/code', // This has a special toplevel (for now) instead of data-generated /learn/skills/code page
  art: '/learn/art', // WIP
}

const LearnSkillsRoute = ({ currUser }, context) => (
  <Grid container columns="1">
    <Divider hidden />
    <Grid.Column>
      <Header as="h1">
        All Skills
        <Header.Subheader>What kind of skill do you want to learn next?</Header.Subheader>
      </Header>
    </Grid.Column>
    <Grid.Column>
      <Card.Group itemsPerRow={1} stackable className="skills">
        {skillAreaItems.map((area, idx) => (
          <Card
            as={QLink}
            key={idx}
            to={_linkOverrides[area.tag] ? _linkOverrides[area.tag] : `/learn/skills/${area.tag}`}
          >
            <Card.Content>
              <div
                className="learnThumbnail"
                style={{ backgroundImage: `url("${UX.makeMascotImgLink(area.mascot)}")` }}
              />
              <Header as="h2" style={headerStyle}>
                <Icon name={area.icon} />&nbsp;{area.title}
              </Header>
              <p style={descStyle}>{area.desc}.</p>
              {!_linkOverrides[area.tag] && (
                <Label basic color="orange" content="under construction during Beta" />
              )}
              {currUser && <SkillsMap skills={context.skills} skillPaths={[area.tag]} />}
            </Card.Content>
          </Card>
        ))}
      </Card.Group>
    </Grid.Column>
  </Grid>
)

LearnSkillsRoute.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}

export default LearnSkillsRoute
