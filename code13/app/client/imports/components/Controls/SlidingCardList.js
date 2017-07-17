import React from 'react'
import { Button, Card, Header, Icon, Label, Popup, Segment } from 'semantic-ui-react'

const SlidingCardList = ({ cardArray }) => (
  <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', padding: '8px' }}>
    <div style={{ width: 230 * cardArray.length + 21 * (cardArray.length - 1) }}>
      <Card.Group>{cardArray}</Card.Group>
    </div>
  </div>
)

export default SlidingCardList
