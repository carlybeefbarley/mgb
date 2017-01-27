import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import Badge from '/client/imports/components/Controls/Badge/Badge'
import { badgeList, getAllBadgesForUser } from '/imports/schemas/badges'
import { Segment, Item, Header } from 'semantic-ui-react'

const makeBadgeFromVal = val => {
  const badge = badgeList[val] 
  return (
    <Item key={val}>
      <Item.Image as={Badge} name={val} key={val} />
      <Item.Content>
        <Item.Header content={(badge ? badge[1] : val) + ' Badge' } />
      </Item.Content>
    </Item>
  )
}

const BadgeListRoute = ( { user, isTopLevelRoute } ) => {
  if (!user) 
    return null

  const badgesForUser = getAllBadgesForUser(user)

  return (
    <Segment basic padded>

      <Helmet
        title={`${user.profile.name} Badge List`}
        meta={[
            {"name": "description", "content": "Badges"}
        ]}
      />
      { isTopLevelRoute && 
        <Header as='h2' content='Badges'/>
      }
      <Item.Group divided>
        { badgesForUser.map(val => makeBadgeFromVal(val) ) } 
      </Item.Group>

    </Segment>
  )
}

BadgeListRoute.propTypes = {
  user:             PropTypes.object,
  isTopLevelRoute:  PropTypes.bool         // Useful so routes can be re-used for embedding.  If false, they can turn off toolbars/headings etc as appropriate
}

export default BadgeListRoute