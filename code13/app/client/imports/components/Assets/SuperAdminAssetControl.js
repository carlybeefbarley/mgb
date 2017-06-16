import React, { PropTypes } from 'react'
import { Popup, Label, Button, Segment } from 'semantic-ui-react'

const SuperAdminAssetControl = ( { asset, handleToggleBan } ) => {
  const isBanned = asset && asset.suIsBanned
  const labelText = isBanned ? 'BANNED' : null
  const labelStyle = labelText ? null : { marginRight: 0 }


  return (
    <Popup
        hoverable
        wide
        size='tiny'
        trigger={(
          <Label
              basic
              size='small'
              icon={{ name: 'bomb', color: 'red', style: labelStyle }}
              content={ labelText }
              />
        )}
        position='bottom right' >
        <Popup.Header>
          SuperAdmin Asset Control
        </Popup.Header>
        <Popup.Content>
          <Segment basic>
            You have great power. Use it wisely.
            <Button 
              as='div'
              onClick={() => handleToggleBan()}
              size='tiny'
              style={{ margin: '1em 1em 0em 2em' }}
              compact 
              color={ asset.suIsBanned ? 'red' : 'green' }
              icon='bomb'
              content={ asset.suIsBanned  ? 'Un-Ban Asset' : 'Ban Asset' } />
          </Segment>
        </Popup.Content>
      </Popup>
  )
}

SuperAdminAssetControl.propTypes = {
  asset:              PropTypes.object.isRequired,
  handleToggleBan:    PropTypes.func.isRequired
}

export default SuperAdminAssetControl