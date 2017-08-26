import React from 'react'
import { Segment, Header, List, Icon } from 'semantic-ui-react'
import QLink from '../QLink'

const UserLink = ({ u }) => <QLink to={`/u/${u}`}>@{u}</QLink>

const AboutHeader = () => (
  <Segment raised padded>
    <Header>
      MyGameBuilder is now in public BETA
      <Header.Subheader>
        Actively developed by <UserLink u="dgolds" />
        {', '}
        <UserLink u="stauzs" />
        {', '}
        <UserLink u="guntis" />
        {', '}
        <UserLink u="Bouhm" />
        {', '}
        <UserLink u="leah" />
        {' and '}
        <UserLink u="levithomason" />
      </Header.Subheader>
    </Header>
    <p>
      Welcome to MyGameBuilder!
      <br />
      If you have thoughts, comments or feedback let us know using the{' '}
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
