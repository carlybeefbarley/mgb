import React from 'react'
import { Label, Icon } from 'semantic-ui-react'

import ShareButton from './ShareButton'

export default () => {
  return (
    <ShareButton
      facebook
      google
      mail
      url={window.location.href}
      tooltip="Share with friends"
      position="bottom right"
    >
      <Label basic id="mgbjr-asset-edit-header-right-share" size="small" style={{ float: 'right' }}>
        <Icon.Group>
          <Icon name="share" title="Share" />
        </Icon.Group>
      </Label>
    </ShareButton>
  )
}
