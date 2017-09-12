import _ from 'lodash'
import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import Badge from '/client/imports/components/Badges/Badge'
import QLink from '/client/imports/routes/QLink'
import { badgeList } from '/imports/schemas/badges'
import { Header, Container, Segment, Item } from 'semantic-ui-react'
import { createContainer } from 'meteor/react-meteor-data'

const BadgeHoldersListUI = ({ params, loading, holders }) => {
  if (loading) return null
  if (!holders) return <span>none</span>

  const { badgename } = params
  const badgeInfo = badgeList[badgename]

  return (
    <Container text>
      <Segment basic padded>
        <Helmet
          title={`Badge Holders: ${badgename}`}
          meta={[{ name: 'Badge Holders', content: 'Badge Holders' }]}
        />

        <Header as="h2">{`${badgeInfo.descr} - ${holders.length} badge holders`}</Header>

        <Item.Group divided>
          {_.map(holders, u => (
            <Item key={u._id} as={QLink} to={`/u/${u.username}`}>
              <Item.Image as={Badge} name={badgename} />
              <Item.Content>
                <br />
                <Item.Header>{u.username}</Item.Header>
              </Item.Content>
            </Item>
          ))}
        </Item.Group>
      </Segment>
      <small>Only showing top 20 users</small>
    </Container>
  )
}

BadgeHoldersListUI.propTypes = {
  user: PropTypes.object,
}

const BadgeHoldersListRoute = createContainer(({ params }) => {
  const { badgename } = params
  const handle = Meteor.subscribe('users.badge.holders', badgename)

  return {
    loading: !handle.ready(),
    holders: Meteor.users.find({ badges: { $in: [badgename] } }, { sort: { badges_count: -1 } }).fetch(),
  }
}, BadgeHoldersListUI)

export default BadgeHoldersListRoute
