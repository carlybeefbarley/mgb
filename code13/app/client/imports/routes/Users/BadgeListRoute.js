import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import Badge from '/client/imports/components/Controls/Badge/Badge'
import { badgeList, getAllBadgesForUser } from '/imports/schemas/badges'
import { Container, Segment, Item } from 'semantic-ui-react'

const BadgeListRoute = ( { user } ) => {
  if (!user) 
    return null

  const badgesForUser = getAllBadgesForUser(user)

  return (
    <Container>
      <Segment>

        <Helmet
            title={`${user.profile.name} Badge List`}
            meta={[ {"name": "User Badges", "content": "Badges"} ]} />
            
        <Item.Group divided>
          { badgesForUser.map(val => (
            <Item key={val}>
              <Item.Image as={Badge} name={val} key={val} />
              <Item.Content>
                <Item.Header content={(badgeList[val] ? badgeList[val][1] : val) + ' Badge' } />
              </Item.Content>
            </Item>
          ))}
        </Item.Group>

      </Segment>
    </Container>
  )
}

BadgeListRoute.propTypes = {
  user:             PropTypes.object
}

export default BadgeListRoute