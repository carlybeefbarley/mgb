import React from 'react'
import { storiesOf } from '@storybook/react'
import * as knobs from '@storybook/addon-knobs'

import ShareButton from '../ShareButton'
import { Button } from 'semantic-ui-react'

const stories = storiesOf('ShareButton', module)
stories.add('Default', () => (
  <div>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
    />
    <ShareButton facebook twitter google stumbleupon mail url="http://build.games" description="Something">
      <Button>Click Here To Open Share dialog</Button>
    </ShareButton>
  </div>
))

stories.add('Knobs', () => (
  <div>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
    />
    <ShareButton
      {...knobs.object('props', {
        facebook: true,
        twitter: true,
        google: true,
        blogger: false,
        reddit: true,
        tumblr: false,
        pinterest: false,
        vk: false,
        linkedin: false,
        stumbleupon: false,
        mail: true,
        all: false,

        url: 'http://build.games',
        description: 'Here goes description',
      })}
    >
      <Button>Click Here To Open Share dialog</Button>
    </ShareButton>
  </div>
))

stories.add('All', () => (
  <div>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
    />
    <ShareButton all url="http://build.games" description="Something">
      <Button>Click Here</Button>
    </ShareButton>
  </div>
))
stories.add('Default Button', () => (
  <div>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
    />
    <ShareButton all url="http://build.games" description="Something" />
  </div>
))
