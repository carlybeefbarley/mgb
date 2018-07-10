import React from 'react'
import { Icon, Segment } from 'semantic-ui-react'

export const AnnouncementBanner = props => {
  return (
    <Segment inverted color="blue" textAlign="center" style={{ margin: 0 }}>
      <Icon name="announcement" inverted />
      {props.text}
    </Segment>
  )
}
