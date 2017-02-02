import React, { Component, PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Dropdown } from 'semantic-ui-react'
import _ from 'lodash'

class NavPanelItem extends Component {
  static propTypes = {
    hdr: PropTypes.node,
    openLeft: PropTypes.bool,
    menu: PropTypes.arrayOf(PropTypes.shape({
      subcomponent: PropTypes.oneOf(['Item', 'Header', 'Divider']),
      to: PropTypes.string,
      icon: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.object,
      ]),
      content: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
    })),
  }

  state = { open: false }

  handleMouseEnter = () => this.setState({ open: true })
  handleMouseLeave = () => this.setState({ open: false })
  handleItemClick = () => this.setState({ open: false })

  render() {
    const { hdr, menu, style, to, openLeft } = this.props
    const { open } = this.state

    return (
      <Dropdown
        item
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        trigger={<QLink to={to}>{hdr}</QLink>}
        icon={null}
        open={open}
        style={style}>
        <Dropdown.Menu style={openLeft ? { left: 'auto', right: '0' } : null}>
          {_.map(menu, ({ subcomponent, ...subcomponentProps }) => {
            return React.createElement(Dropdown[subcomponent], {
              key: subcomponentProps.content,
              as: QLink,
              onClick: this.handleItemClick,
              ...subcomponentProps,
            })
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

export default NavPanelItem
