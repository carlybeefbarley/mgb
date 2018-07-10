import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import * as knobs from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'

import { Button, Container, Segment } from 'semantic-ui-react'

const stories = storiesOf('__Examples__', module)

stories.add('Actions', () => (
  <Container text>
    <p>Stories can log actions. Open the "Action Logger" panel and click the button.</p>
    <Button onClick={action('onClick')}>Log Action</Button>
  </Container>
))

stories.add('Knobs', () => {
  // Knobs appear in the Storybook in the order they were instantiated in code
  const props = {
    content: knobs.text('text', 'Click Me'),
    size: knobs.select('size', ['mini', 'tiny', 'small', 'medium', 'large', 'big', 'huge', 'massive']),
    color: knobs.select('color', [
      'red',
      'orange',
      'yellow',
      'olive',
      'green',
      'teal',
      'blue',
      'violet',
      'purple',
      'pink',
      'brown',
      'grey',
      'black',
    ]),
    active: knobs.boolean('active', false),
    basic: knobs.boolean('basic', false),
    circular: knobs.boolean('circular', false),
    compact: knobs.boolean('compact', false),
    disabled: knobs.boolean('disabled', false),
    fluid: knobs.boolean('fluid', false),
    inverted: knobs.boolean('inverted', false),
    loading: knobs.boolean('loading', false),
  }

  return (
    <Container text>
      <p>
        Knobs make your story interactive. It is a good practice to make a "knob" for each prop you are
        showing the story for.
      </p>
      <p>Open the "Knobs" panel and try it out.</p>
      <Segment inverted={props.inverted}>
        <Button {...props} />
      </Segment>
    </Container>
  )
})

stories.add('Links', () => (
  <Container text>
    <p>Stories can link to other stories.</p>
    <Button
      primary
      onClick={linkTo('__Examples__', 'Knobs')}
      icon="level up"
      labelPosition="left"
      content="Go to 'Knobs'"
    />
  </Container>
))
