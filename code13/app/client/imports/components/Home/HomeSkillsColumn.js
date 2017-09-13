import React, { PropTypes } from 'react'
import '/client/imports/routes/home.css'
import '/client/imports/routes/GetStarted.css'

import { Grid, Header, List, Icon, Button, Segment } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const _propTypes = {
  userId: PropTypes.string, // Can be null/undefined. It is used to indicate if anyone is logged in
}

const skillsList = [
  { icon: 'code', msg: 'Coding', link: '/learn/code' },
  { icon: 'paint brush', msg: 'Pixel art', link: '/learn/art' },
  { icon: 'music', msg: 'Music & audio', link: '/learn/skills/audio' },
  { icon: 'idea', msg: 'Game design', link: '/learn/skills/design' },
  { icon: 'book', msg: 'Story writing', link: '/learn/skills/writing' },
  { icon: 'line chart', msg: 'Analytics', link: '/learn/skills/analytics' },
]

const segmentStyle = {
  display: 'flex',
  flexDirection: 'column',
}

const listStyle = {
  flex: '1',
}

const HomeSkillsColumn = () => (
  <Grid.Column className="animated fadeIn">
    <Segment raised style={segmentStyle}>
      <Header as="h2" textAlign="center">
        Grow your <em>real</em> skill tree
      </Header>
      <List relaxed="very" size="large" selection style={listStyle}>
        {skillsList.map((skill, idx) => (
          <List.Item key={idx} as={QLink} to={skill.link}>
            <Icon name={skill.icon} size="large" />
            <List.Content verticalAlign="middle">
              <Header as="h3">{skill.msg}</Header>
            </List.Content>
          </List.Item>
        ))}
      </List>
      <br />
      <Button
        as={QLink}
        to={`/learn/skills`}
        fluid
        primary
        size="large"
        content="Set skill goals"
        // prevent vertical stretching in the `stretched` column
        style={{ flex: '0 0 auto' }}
      />
    </Segment>
  </Grid.Column>
)

HomeSkillsColumn.propTypes = _propTypes
export default HomeSkillsColumn
