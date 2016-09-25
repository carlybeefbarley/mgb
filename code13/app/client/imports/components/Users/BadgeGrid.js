import React, { PropTypes } from 'react'
import Badge, { getAllBadgesForUser } from '/client/imports/components/Controls/Badge/Badge'
import { Grid, Header, Label } from 'stardust'

const BadgeN = props => (
  <Grid.Column>
    <Badge name={props.badge || "blank"} />
  </Grid.Column>
)

const BadgeGrid = props => {
  const { user, className } = props
  if (!user) return null
  
  const badgesPageUrl = `/u/${user.profile.name}/badges`
  const uBadges = getAllBadgesForUser(user)

  return (
    <div className={className}>
      <QLink to={badgesPageUrl}>
        <Header as='h2'>Badges</Header>
      </QLink>
      <Grid columns='equal'>
        <Grid.Row>
          <BadgeN badge={uBadges[0]} />
          <BadgeN badge={uBadges[1]} />
          <BadgeN badge={uBadges[2]} />
        </Grid.Row>
        <Grid.Row>
          <BadgeN badge={uBadges[3]} />
          <BadgeN badge={uBadges[4]} />
          <BadgeN badge={uBadges[5]} />
        </Grid.Row>
        <Grid.Row>
          <BadgeN badge={uBadges[6]} />
          <BadgeN badge={uBadges[7]} />
          <Grid.Column>
            <QLink to={badgesPageUrl}>
              <Label content='more' />
            </QLink>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  )
}

BadgeGrid.propTypes = {
  user:      PropTypes.object,
  className: PropTypes.string
}

export default BadgeGrid