import React from 'react'
import { storiesOf } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import * as knob from '@storybook/addon-knobs'
import { linkTo } from '@storybook/addon-links'
import ChatReviewRoute from '../ChatReviewRoute'

const propsWithChat = {
  users: [{ username: 'bob' }, { username: 'angelica' }],
}

var stories = storiesOf('ChatReviewRoute', module)

stories.addDecorator(knob.withKnobs)

stories.add('Default View', () => {
  const name = knob.text('stuff', 'Contents')
  return <ChatReviewRoute names={name} />
})
