import _ from 'lodash'
import React, { PropTypes } from 'react'
import styles from '../home.css'
import QLink from '../QLink'
import { Grid, Card, Header, Image, Icon } from 'semantic-ui-react'

const jsItems = [
  {
    icon: 'code',
    link: '/u/!vault/asset/5Bm4R9kJHRAMBv4kD',
    content: 'Variables',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'Arithmetic operators',
    desc: `addition, subtraction, division, multiplication`
  },
  {
    icon: 'code',
    link: '',
    content: 'Arrays',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'Objects',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'For loops',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'If statements',
    desc: ``
  },
  {
    icon: 'code',
    link: '',
    content: 'Functions',
    desc: ``
  },
]

const LearnCodeJsRoute = ({ currUser }, context) => {
  return (
    <Grid stackable container>
      <Grid.Row >
        <Header as='h1' size='huge' style={{ fontSize: '2.5em' }}>
          JavaScript programming basics
          <em className="sub header">Click on item and explore it</em>
        </Header>
      </Grid.Row>
      <Grid.Row>
        <Card.Group itemsPerRow={1} stackable className="skills">
          { jsItems.map( (area, idx) => (
            <QLink key={idx} to={area.link} className='card animated fadeIn' style={cardStyle}>
              <Card.Content>
                <p style={descStyle}>
                  <i className={area.icon + " large icon"}></i>
                  <b>{area.content}</b>
                  &nbsp;- {area.desc}
                </p>

              </Card.Content>
            </QLink>
          ) ) }
        </Card.Group>
      </Grid.Row>
    </Grid>
  )
}

export default LearnCodeJsRoute

const cardStyle = {
  color: "#2e2e2e"
}

const mascotStyle = {
  maxWidth: "8em",
  paddingRight: "0.5em",
  marginBottom: "0"
}

const headerStyle = {
  marginTop: "0.15em",
  marginBottom: "0.4em"
}

const descStyle = {
  fontSize: "1.25em",
  lineHeight: "1.5em"
}
