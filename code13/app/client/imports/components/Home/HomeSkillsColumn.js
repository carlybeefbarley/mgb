import React, { PropTypes } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'

import { Grid, Header, List, Icon, Button } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const _propTypes = {
  userId:   PropTypes.string       // Can be null/undefined. It is used to indicate if anyone is logged in
}

const skillsList = [
  { icon: 'code',        msg: 'Programming',  link: '/learn/code' },
  { icon: 'paint brush', msg: 'Pixel art',    link: '/learn/art' },
  { icon: 'music',       msg: 'Music & audio',link: '/learn/skills/audio' },
  { icon: 'idea',        msg: 'Game design',  link: '/learn/skills/design' },
  { icon: 'book',        msg: 'Story writing',link: '/learn/skills/writing' },
  { icon: 'line chart',  msg: 'Analytics',    link: '/learn/skills/analytics' }
]

const HomeSkillsColumn = () => (
  <Grid.Column className='animated fadeIn'>
    <Header as='h2' style={{ marginBottom: "1em" }}>Grow your <em>real</em> skill tree</Header>
    <List relaxed='very' size='large'>
      {
        skillsList.map( (skill, idx) => (
          <List.Item key={idx} as={QLink} to={skill.link}>
            <Icon name={skill.icon} size='large' />
            <Header className="content" as='h3' >{skill.msg}</Header>
          </List.Item>
        ))
      }
    </List>
    <br />
    <Button
      as={QLink}
      to={`/learn/skills`}
      fluid
      color='teal'
      size='large'
      content='Set skill goals'
      // prevent vertical stretching in the `stretched` column
      style={{ flex: '0 0 auto' }}
    />
  </Grid.Column>
)

HomeSkillsColumn.propTypes = _propTypes
export default HomeSkillsColumn
