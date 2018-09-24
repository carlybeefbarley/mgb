import _ from 'lodash'
import React from 'react'
import { Header, Segment } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const MembershipSegment = () => {
  return (
    <Segment style={{ background: 'transparent' }}>
      <Header as="h1" inverted>
        Become a member today!<span style={{ color: 'rgba(255, 255, 255, 0.75)' }}>*</span>
        <Header.Subheader>
          <small>
            <QLink to="/whats-new">What's this?</QLink>
          </small>
        </Header.Subheader>
      </Header>
      <p style={{ color: '#fff', fontSize: '1.5em' }}>
        Your first month of My Game Builder membership is free. By being a member you can continue to get
        access to our continuously growing tutorials and learning resources, and create as many games and
        projects as you'd like. Join our community and start learning, building, and playing!
      </p>
      <h5 style={{ color: 'white' }}>
        *My Game Builder is still 100% free during Public BETA. Free trials begin after official launch.
      </h5>
    </Segment>
  )
}

export default MembershipSegment
