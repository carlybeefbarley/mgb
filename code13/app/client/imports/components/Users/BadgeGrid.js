import React, { PropTypes } from 'react'
import Badge from '/client/imports/components/Controls/Badge/Badge'
import { getAllBadgesForUser } from '/imports/schemas/badges'

import { Grid, Segment, Header, Label } from 'semantic-ui-react'

const BadgeN = props => (
  <Grid.Column textAlign='center'>
    <Badge name={props.badge || '_blankBadge'} />
  </Grid.Column>
)

const BadgeGrid = ( { user, className } ) => {
  if (!user) 
    return null
  
  const badgesPageUrl = `/u/${user.profile.name}/badges`
  const uBadges = getAllBadgesForUser(user)

  return (
    <div className={className}>
      <Segment>

        <Header as='h2' id='#mgbjr-profile-badges-header'>
          <QLink to={badgesPageUrl}>
            Badges
          </QLink>
        </Header>
      
        <Grid columns='equal' id='#mgbjr-profile-badges-area'>
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

      </Segment>
    </div>
  )
}

BadgeGrid.propTypes = {
  user:      PropTypes.object,
  className: PropTypes.string
}

export default BadgeGrid