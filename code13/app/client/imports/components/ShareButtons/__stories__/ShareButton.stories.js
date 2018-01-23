import React from 'react'
import { storiesOf } from '@storybook/react'
import * as knobs from '@storybook/addon-knobs'

import ShareButton from '../ShareButton'
import AssetShareButton from '../AssetShareButton'
import { Button } from 'semantic-ui-react'

const stories = storiesOf('ShareButton', module)

const scss = () => (
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css" />
)

stories.add('Default', () => (
  <div>
    {scss()}
    <ShareButton all url="http://build.games" description="Something" />
  </div>
))

stories.add('Knobs', () => (
  <div>
    {scss()}
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
        tooltip: 'Share with friends',
      })}
    >
      <Button>Click Here To Open Share dialog</Button>
    </ShareButton>
  </div>
))

stories.add('Asset share Button', () => (
  <div>
    {scss()}
    <div>Button is on the top right :)</div>
    <AssetShareButton all url="http://build.games" description="Something" tooltip="Share with friends" />
  </div>
))
