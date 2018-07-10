import PropTypes from 'prop-types'
import React from 'react'
import Helmet from 'react-helmet'
import Badge from '/client/imports/components/Badges/Badge'
import QLink from '/client/imports/routes/QLink'
import { badgeList, getAllBadgesForUser } from '/imports/schemas/badges'
import { Header, Container, Segment, Item } from 'semantic-ui-react'

const BadgeListRoute = ({ user }) => {
  if (!user) return null

  const badgesForUser = getAllBadgesForUser(user)

  return (
    <Container text>
      <Segment basic padded>
        <Helmet title={`${user.username} Badge List`} meta={[{ name: 'User Badges', content: 'Badges' }]} />

        <Header as="h2" content={`${user.username} has ${badgesForUser.length} badges`} />

        <Item.Group divided>
          {badgesForUser.map(val => (
            <Item key={val}>
              <QLink to={`/badge/${val}`}>
                <Item.Image as={Badge} name={val} key={val} />
              </QLink>
              <Item.Content>
                <br />
                <Item.Header>&emsp;{badgeList[val] ? badgeList[val].descr : val}</Item.Header>
              </Item.Content>
            </Item>
          ))}
        </Item.Group>
      </Segment>
    </Container>
  )
}

BadgeListRoute.propTypes = {
  user: PropTypes.object,
}

export default BadgeListRoute
