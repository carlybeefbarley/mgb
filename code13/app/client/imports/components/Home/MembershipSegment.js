import _ from 'lodash'
import React from 'react'
import { Header, Segment } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const MembershipSegment = () => {
  return (
    <Segment style={{ background: 'transparent' }}>
      <Header as="h1" inverted>
        Become a member today!
        <Header.Subheader>
          <small>
            <QLink to="/whats-new">What's this?</QLink>
          </small>
        </Header.Subheader>
      </Header>
      <p style={{ color: '#fff', fontSize: '1.5em' }}>
        Your first month of MyGameBuilder membership is 100% free. By being a member you can continue to get
        access to our constantly growing tutorials and learning resources, and create as many games and
        project as you like. Join our community and start learning, building, and playing!
      </p>
    </Segment>
  )
}

export default MembershipSegment
