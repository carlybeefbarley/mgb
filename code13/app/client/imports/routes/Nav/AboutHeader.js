import React from 'react'
import { Segment, Header, List, Message, Icon } from 'semantic-ui-react'
import QLink from '../QLink'

const UserLink = ( { u } ) => (<QLink to={`/u/${u}`}>@{u}</QLink>)

export default () => (
  <Segment raised padded>
    <Header>
      My Game Builder is in <em>Semi-Secret Beta</em> test until May 4th 2017.
      <br />
      <small>
        ...actively developed by
        {' '}
        <UserLink u="dgolds" />
        ,
        {' '}
        <UserLink u="stauzs" />
        ,
        {' '}
        <UserLink u="guntis" />
        {' '}
        and
        {' '}
        <UserLink u="Bouhm" />
      </small>
    </Header>
    <p>
      You are very welcome to use this new MyGameBuilder site and give us feedback
      using the <i className="chat icon" />chat panel on the right hand side of the screen
    </p>
    <List className="bulleted">
      <List.Item>
        We are testing with Chrome, Firefox and Safari, but for best results now, use
        {' '}
        <a href="https://www.google.com/chrome/"> Google's Chrome browser</a>
        {' '}
        on Windows/Mac/Linux.
      </List.Item>
    </List>
    <Message warning icon>
      <Icon name="spy" />
      <Message.Content>
        <Message.Header>Shhh</Message.Header>
        <p>
          Please
          {' '}
          <em>do NOT</em>
          {' '}
          post our
          {' '}
          <a href="https://v2.mygamebuilder.com">v2.mygamebuilder.com</a>
          {' '}
          link to public sites like Forums, Facebook, ProductHunt, Reddit, SlashDot, HackerNews etc
          {' '}
          <em>YET</em>
          . We aren't quite ready for big groups yet!
        </p>
        <p>
          It's OK to directly ask some friends or family to try it though if you like, as long as they follow this rule.
        </p>
      </Message.Content>
    </Message>
  </Segment>
)
