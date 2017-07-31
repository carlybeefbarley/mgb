import React from 'react'
import { storiesOf } from '@storybook/react'
import * as knobs from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'

import EditorToolMenu from '../EditorToolMenu'

const getItems = () => [
  {
    icon: 'fi-pencil',
    content: 'Pencil',
    onClick: action('onClick Pencil'),
  },
  {
    icon: 'fi-eraser',
    content: 'Eraser',
    onClick: action('onClick Eraser'),
  },
  {
    icon: 'fi-paint-bucket',
    content: 'Fill',
    onClick: action('onClick Fill'),
  },
]

const stories = storiesOf('Editor.ToolMenu', module)

stories.add('Default', () => <EditorToolMenu items={getItems()} />)

stories.add('Icon only', () => (
  <EditorToolMenu items={getItems()} iconOnly={knobs.boolean('iconOnly', true)} />
))
