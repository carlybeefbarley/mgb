import React from 'react'
import { Segment, Header, List, Message, Icon } from 'semantic-ui-react'
import QLink from '../QLink'

const UserLink = ({ u }) => <QLink to={`/u/${u}`}>@{u}</QLink>

const AboutHeader = () => (
  <Segment raised padded>
    <Header>
      MyGameBuilder is now in public BETA
      <br />
      <small>
        ...actively developed by <UserLink u="dgolds" />
        {', '}
        <UserLink u="stauzs" />
        {', '}
        <UserLink u="guntis" />
        {', '}
        <UserLink u="Bouhm" />
        {' and '}
        <UserLink u="leah" />
      </small>
    </Header>
    <p>
      Welcome to MyGameBuilder!&emsp; If you have thoughts, comments or feedback let us know using the{' '}
      <QLink query={{ _fp: 'chat' }}>
        <Icon name="chat" />chat panel
      </QLink>{' '}
      on the right hand side of the screen
    </p>
    <List className="bulleted">
      <List.Item>
        We are testing with Chrome, Firefox and Safari, but for best results now, use{' '}
        <a href="https://www.google.com/chrome/"> Google's Chrome browser</a> on Windows/Mac/Linux.
      </List.Item>
    </List>
  </Segment>
)

export default AboutHeader
