import React from 'react'
import { Icon, Dropdown } from 'semantic-ui-react'
import './rsui-dd-fix.css'

const CameraTools = ({button}) => (
    <Dropdown labeled compact button
      className='icon require-sub-menu-fix'
      text={button.iconText} icon="crosshairs"
    >
      <Dropdown.Menu>
        <Dropdown.Item onClick={button.resetCamera}>Reset Camera</Dropdown.Item>
        <Dropdown.Item onClick={button.fitMap}>
          <Icon name='dropdown' />
          <span className='text'>Fit Map</span>
          <Dropdown.Menu onClick={e => e.stopPropagation() }>
            <Dropdown.Item onClick={button.fitMap}>Best Fit</Dropdown.Item>
            <Dropdown.Item onClick={button.fitMapH}>Horizontally</Dropdown.Item>
            <Dropdown.Item onClick={button.fitMapV()}>Vertically</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )

export default CameraTools
