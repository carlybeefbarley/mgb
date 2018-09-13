import _ from 'lodash'
import React from 'react'
import { Header } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const MembershipSegment = () => {
  return (
    <div>
      <Header as="h1" inverted>
        Become a member today!
        <Header.Subheader>
          <QLink to="/whats-new">What's this?</QLink>
        </Header.Subheader>
      </Header>
      <p style={{ color: '#fff', fontSize: '1.5em' }}>
        Your first month of MyGameBuilder membership is 100% free. By being a member you can continue to get
        access to our constantly growing tutorials and learning resources, and create as many games and
        project as you like. Become a member of the community where you can learn, play, and grow as game
        builders.
      </p>
    </div>
  )
}

export default MembershipSegment
