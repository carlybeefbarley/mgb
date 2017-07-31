import React from 'react'
import { storiesOf } from '@storybook/react'
import * as knobs from '@storybook/addon-knobs'
import { action } from '@storybook/addon-actions'

import Editor from '../Editor'

const stories = storiesOf('Editor', module)

stories.add('Layout', () => (
  <Editor
    iconOnly={knobs.boolean('iconOnly', false)}
    actionMenu={{
      onActionClick: action('onActionClick'),
      items: [
        { icon: 'undo', content: 'Undo' },
        { icon: { name: 'undo', flipped: 'horizontally' }, content: 'Redo' },
        { icon: 'cut', content: 'Cut' },
      ],
    }}
    toolMenu={{
      onToolClick: action('onToolClick'),
      items: [
        { icon: 'fi-pencil', content: 'Pencil' },
        { icon: 'fi-eraser', content: 'Eraser' },
        { icon: 'fi-paint-bucket', content: 'Fill' },
      ],
    }}
    stage={{
      showCheckerboard: knobs.boolean('showCheckerboard', false),
      children: (
        <p>
          This is the <code>Stage</code>, where the <code>model</code> being edited is rendered.
        </p>
      ),
    }}
    panels={[
      { header: 'Panel A', content: <p>This is Panel A</p> },
      { header: 'Panel B', content: <p>This is Panel B</p> },
      { header: 'Panel C', content: <p>This is Panel C</p> },
    ]}
  />
))
