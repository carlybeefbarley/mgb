/**

SPEC

* [ ] Default columns for board (todo, in progress, done)
* [ ] Add/Remove cards (UI is via column)
* [ ] Order cards within column
* [ ] Move cards between columns
* [ ] Assign card to user
* [ ] Labelled cards
*  ^---- board is associated w/ group of labels
* [ ] Boards have a default set of labels (bug, feature, help wanted)
* [ ] Example todo card, changes title as it moves between columns. Tutorial card.
* [ ] Add/Remove columns
* [ ] Set column title
* [ ] Reorder columns (global)
* [ ] Column shows how many cards it has in title
* [ ] Search for cards (searches by titles, at least)
* [ ] Dropdown/multiselect? for assignee
* [ ] Dropdown/multiselect? for label
*/

import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import * as knobs from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { Button, Card, Container, Image, Segment } from 'semantic-ui-react'

const stories = storiesOf('Kanban', module)

class KanbanBoard extends React.Component {
  render () {
    return (
      <div>
        {this.props.columns.map(col => (
          <KanbanColumn title={col.title} cards={col.cards} />
        ))}
      </div>
    )
  }
}

/**
SUI Components:
 - Header
*/
class KanbanColumn extends React.Component {
  render () {
    const { cards, title } = this.props
    return (
      <div>
        <h2>{title}</h2>
        <hr />
        {cards.map(item => (
          <KanbanCard {...item} />
        ))}
      </div>
    )
  }
}

/**
SUI Components:
  - Card
  - Label
  - UserAvatar (but wont be able to use real component due to meteor) -- Image w/ avatar prop
*/
class KanbanCard extends React.Component {
  render () {
    const { title, description, assigned } = this.props
    return (
      <div>
        <Card>
          <Card.Content>
            <Card.Header>
              {title}
            </Card.Header>
            <Card.Meta>
              {description}
            </Card.Meta>
          </Card.Content>
          <Card.Content extra>
            {assigned}
          </Card.Content>
        </Card>
      </div>
    )
  }
}

const board = [
  { title: 'icebox', cards: [
    { title: 'Something Iceboxed', description: 'foobar' },
    { title: 'Another Thing Iceboxed', description: 'foobar' },
  ]},
  { title: 'current', cards: [
    { title: 'Something Current', description: 'foobar' },
    { title: 'Another Thing Current', description: 'foobar' },
    { title: 'Another Current Card', description: 'foobar' },
  ]},
]

stories.add('Test', () => (
  <Container text>
    <KanbanBoard columns={board} />
  </Container>
))

