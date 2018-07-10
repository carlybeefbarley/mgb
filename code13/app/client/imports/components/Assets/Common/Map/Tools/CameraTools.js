import React from 'react'
import { Icon, Dropdown } from 'semantic-ui-react'

// TODO: techdebt - when RSUI will support (or be fixed) multi level menus - remove this fix (rsui-dd-fix.css)
import './rsui-dd-fix.css'

const CameraTools = ({ button }) => (
  <Dropdown
    compact
    button
    className={'require-sub-menu-fix' + (button.disabled ? ' disabled' : '')}
    text={button.iconText}
  >
    <Dropdown.Menu>
      <Dropdown.Item onClick={button.resetCamera}>Reset Camera</Dropdown.Item>
      <Dropdown.Item onClick={button.fitMap}>
        <Icon name="dropdown" />
        <span className="text">Fit Map</span>
        <Dropdown.Menu onClick={e => e.stopPropagation()}>
          <Dropdown.Item onClick={button.fitMap}>Best Fit</Dropdown.Item>
          <Dropdown.Item onClick={button.fitMapH}>Horizontally</Dropdown.Item>
          <Dropdown.Item onClick={button.fitMapV}>Vertically</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
)

export default CameraTools
