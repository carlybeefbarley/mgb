import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Label, Popup } from 'semantic-ui-react'

const _menuItemIndicatorStyle = {
  top: '0px',
  right: '-2px',
  textShadow:
    '-1px -1px 0 rgba(0,0,0,0), 1px -1px 0 rgba(0,0,0,0), -1px 1px 0 rgba(0,0,0,0), 1px 1px 0 rgba(0,0,0,0)',
}

const AssetChatDetail = ({ hasUnreads, handleClick, style }) => (
  <Popup
    size="small"
    position="bottom right"
    mouseEnterDelay={500}
    trigger={
      <Label basic style={style} id="mgbjr-asset-edit-header-right-chat" size="small">
        <Icon.Group>
          <Icon name="chat" style={hasUnreads ? null : { marginRight: 0 }} onClick={handleClick} />
          {hasUnreads && (
            <Icon corner color="red" size="mini" name="circle" style={_menuItemIndicatorStyle} />
          )}
        </Icon.Group>
      </Label>
    }
    header="Asset Chat"
    content={`Click to open the Chat FlexPanel for this Asset.${hasUnreads
      ? ' There are unread messages on this Asset you have not seen'
      : ''}`}
  />
)

AssetChatDetail.propTypes = {
  hasUnreads: PropTypes.bool.isRequired, // True if there are unread messages
  handleClick: PropTypes.func, // Callback function - no params
}

export default AssetChatDetail
