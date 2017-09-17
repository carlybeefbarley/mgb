/**

SPEC

* [ ] Add/Remove columns
* [ ] Add/Remove cards (UI is via column)
* [ ] Order cards within column
* [ ] Move cards between columns
* [ ] Assign card to user
* [ ] Labelled cards
*  ^---- board is associated w/ group of labels
* [ ] Boards have a default set of labels (bug, feature, help wanted)
* [ ] Default columns for board (todo, in progress, done)
* [ ] Set column title
* [ ] Reorder columns (global)
* [ ] Column shows how many cards it has in title
* [ ] Search for cards (searches by titles, at least)
* [ ] Dropdown/multiselect? for assignee
* [ ] Dropdown/multiselect? for label
* [ ] Example todo card, changes title as it moves between columns. Tutorial card.
*/

import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import * as knobs from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import { Button, Card, Container, Form, Icon, Image, Modal, Segment } from 'semantic-ui-react'

const stories = storiesOf('Kanban', module)

class KanbanBoard extends React.Component {
  render () {
    return (
      <div>
        {this.props.columns.map(col => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            cards={col.cards}
            onAddCard={this.props.onAddCard}
            onRemoveCard={this.props.onRemoveCard}
          />
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
  _onAddCard = () => {
    this.props.onAddCard(this.props.id)
  }

  _onRemoveCard = (cardId) => {
    this.props.onRemoveCard(this.props.id, cardId)
  }

  render () {
    const { cards, title } = this.props
    return (
      <div>
        <h2>
          {title}
          <div style={{ float: 'right' }}>
            <Icon name='plus' onClick={this._onAddCard} />
          </div>
        </h2>
        <hr />
        {cards.map(card => (
          <KanbanCard
            key={card.id}
            {...card}
            onRemove={this._onRemoveCard}
          />
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
  _onRemove = (e) => {
    e.preventDefault()
    this.props.onRemove(this.props.id)
  }

  render () {
    const { title, description, assigned } = this.props
    return (
      <div>
        <Card>
          <Card.Content>
            <Card.Header>
              {title}
              <div style={{ float: 'right' }} onClick={this._onRemove}>
                &times;
              </div>
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


const uuid = ((seed) => () => ++seed)(0)

const createColumn = (title, cards) => ({
  id: uuid(),
  title,
  cards: cards.map(createCard),
})

const createCard = (data) => ({
  id: uuid(),
  ...data,
})

class KanbanCardModal extends React.Component {
  state = {
    model: {
      title: '',
      description: '',
    },
  }

  _bind = (field) => {
    return {
      value: this.state.model[field],
      onChange: (e) => {
        const { value } = e.target
        this.setState(state => ({
          model: { ...state.model, [field]: value },
        }))
      },
    }
  }

  _onSubmit = (e) => {
    e.preventDefault()
    this.props.onSubmit(this.state.model)
    this.props.onClose()
  }

  render () {
    const { onClose } = this.props

    return (
      <Modal open onClose={onClose}>
        <Modal.Header>
          Create New Card
        </Modal.Header>
        <Modal.Content>
          <Form onSubmit={this._onSubmit}>
            <Form.Input label='Title' {...this._bind('title')} />
            <Form.Input label='Description' {...this._bind('description')} />
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button color='green' onClick={this._onSubmit} >
            Create
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

class MockKanbanContainer extends React.Component {
  state = {
    modal: {
      open: false,
      colId: null,
    },
    board: [
      createColumn('icebox', [
        { title: 'Something Iceboxed', description: 'foobar' },
        { title: 'Another Thing Iceboxed', description: 'foobar' },
      ]),
      createColumn('current', [
        { title: 'Something Current', description: 'foobar' },
        { title: 'Another Thing Current', description: 'foobar' },
        { title: 'Another Current Card', description: 'foobar' },
      ]),
    ],
  }

  _onAddCard = (colId, data) => {
    this.setState(state => ({
      board: state.board.map(col => {
        if (col.id !== colId) return col
        return {
          ...col,
          cards: [...col.cards, createCard(data)],
        }
      })
    }))
  }

  _onRemoveCard = (colId, cardId) => {
    this.setState(state => ({
      board: state.board.map(col => {
        if (col.id !== colId) return col
        return {
          ...col,
          cards: col.cards.filter(c => c.id !== cardId),
        }
      })
    }))
  }

  _openCreateCardModal = (colId) => {
    this.setState(state => ({
      modal: { ...state.modal, open: true, colId },
    }))
  }

  _onCardModalSubmit = (data) => {
    this._onAddCard(this.state.modal.colId, data)
  }

  render () {
    const { board, modal } = this.state
    return (
      <div>
        {modal.open && (
          <KanbanCardModal
            onSubmit={this._onCardModalSubmit}
            onClose={() => this.setState({ modal: { open: false, colId: null } })}
          />
        )}
        <KanbanBoard
          columns={this.state.board}
          onAddCard={this._openCreateCardModal}
          onRemoveCard={this._onRemoveCard}
        />
      </div>
    )
  }
}

stories.add('Sample Board', () => (
  <Container text>
    <MockKanbanContainer />
  </Container>
))

