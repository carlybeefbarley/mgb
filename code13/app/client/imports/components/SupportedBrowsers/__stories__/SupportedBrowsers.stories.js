import React from 'react'
import { storiesOf } from '@storybook/react'
import * as knobs from '@storybook/addon-knobs'

import SupportedBrowsers from '../SupportedBrowsers'

const stories = storiesOf('SupportedBrowsers', module)

stories.add('Default', () => (
  <SupportedBrowsers
    buttons={[
      knobs.object('buttons[0]', {
        icon: 'chrome',
        content: 'Chrome',
        recommended: true,
        href: 'javascript:;',
      }),
      knobs.object('buttons[1]', {
        icon: 'firefox',
        content: 'Firefox',
        href: 'javascript:;',
      }),
      knobs.object('buttons[2]', {
        icon: 'safari',
        content: 'Safari',
        href: 'javascript:;',
      }),
    ]}
  />
))

stories.add('Recommended Buttons', () => (
  <SupportedBrowsers
    buttons={[
      knobs.object('buttons[0]', {
        icon: 'asterisk',
        content: 'Recommended',
        recommended: true,
        href: 'javascript:;',
      }),
      knobs.object('buttons[1]', {
        icon: 'asterisk',
        content: 'Also recommended',
        recommended: true,
        href: 'javascript:;',
      }),
      knobs.object('buttons[2]', {
        icon: 'asterisk',
        content: 'Not Recommended',
        href: 'javascript:;',
      }),
    ]}
  />
))
