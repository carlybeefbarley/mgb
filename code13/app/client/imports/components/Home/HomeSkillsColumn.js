import React, { PropTypes, Component } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'

import { Grid, Header, List, Icon, Button } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const _propTypes = {
  userId:   PropTypes.string       // Can be null/undefined. It is used to indicate if anyone is logged in
}

const skillsList = [ 
  { icon: 'code',        msg: 'Programming' },
  { icon: 'paint brush', msg: 'Pixel art' },
  { icon: 'music',       msg: 'Music & audio' },
  { icon: 'idea',        msg: 'Game design' },
  { icon: 'book',        msg: 'Story writing' },
  { icon: 'line chart',  msg: 'Analytics' }
]

const HomeSkillsColumn = (props) => (
  <Grid.Column>
    <Header as='h2' style={{ marginBottom: "1em" }}>Grow your <em>real</em> skill tree</Header>
    <List className="very relaxed">
      {
        skillsList.map( (skill, idx) => (
          <List.Item key={idx}>
            <Icon name={skill.icon} size='large' />
            <Header className="content" as='h3' >{skill.msg}</Header>
          </List.Item>
        ))
      }
    </List>
    <br />
    <QLink to={`/getstarted`}>
      <Button color='teal' size='large' content={props.userId ? 'Set skill goals' : 'Build a game' } />
    </QLink>
  </Grid.Column>
)

HomeSkillsColumn.propTypes = _propTypes
export default HomeSkillsColumn