import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Dropdown } from 'semantic-ui-react'
import _ from 'lodash'

const NavPanelItem = ({ hdr, menu }) => (
  <Dropdown item simple trigger={hdr} icon={null}>
    <Dropdown.Menu>
      {_.map(menu, ({ subcomponent, ...subcomponentProps }) => {
        return React.createElement(Dropdown[subcomponent], {
          key: subcomponentProps.content,
          as: QLink,
          ...subcomponentProps,
        })
      })}
    </Dropdown.Menu>
  </Dropdown>
)

NavPanelItem.propTypes = {
  hdr: PropTypes.node,
  menu: PropTypes.arrayOf(PropTypes.shape({
    subcomponent: PropTypes.oneOf(['Item', 'Header', 'Divider']),
    to: PropTypes.string,
    icon: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.object,
    ]),
    content: PropTypes.string,
  })),
}

export default NavPanelItem
