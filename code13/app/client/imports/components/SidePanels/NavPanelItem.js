import React, { PropTypes } from 'react'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import { Dropdown, Menu } from 'semantic-ui-react'
import _ from 'lodash'

const _openLeftStyle = { left: 'auto', right: '0' }
class NavPanelItem extends React.PureComponent {
  static propTypes = {
    header: PropTypes.node,
    name: PropTypes.string.isRequired, // Used for generating mgbjr-id-${name}-.. parts of joyride tags
    openLeft: PropTypes.bool,
    menu: PropTypes.arrayOf(
      PropTypes.shape({
        subcomponent: PropTypes.oneOf(['Item', 'Header', 'Divider']),
        to: PropTypes.string,
        icon: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
        content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      }),
    ),
  }

  state = { open: false }

  handleMouseEnter = () => this.setState({ open: true })
  handleMouseLeave = () => this.setState({ open: false })
  handleItemClick = (e, data) => {
    if (data && data['data-joyridecompletiontag']) joyrideCompleteTag(data['data-joyridecompletiontag'])
    this.setState({ open: false })
  }
  handleClick = () => {
    const { to, query, name } = this.props
    joyrideCompleteTag(`mgbjr-CT-np-${name}`)
    utilPushTo(null, to, query)
  }

  render() {
    const { header, name, menu, style, to, openLeft } = this.props
    const { open } = this.state

    const props = {
      id: `mgbjr-np-${name}`,
      onClick: to ? this.handleClick : null,
      style,
    }

    if (!menu) {
      return <Menu.Item as={to ? 'a' : 'div'} {...props} content={header} />
    }

    return (
      <Dropdown
        {...props}
        item
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        trigger={<span>{header}</span>}
        icon={null}
        open={open}
      >
        <Dropdown.Menu style={openLeft ? _openLeftStyle : null}>
          {_.map(menu, ({ subcomponent, ...subcomponentProps }) => {
            return React.createElement(Dropdown[subcomponent], {
              key: subcomponentProps.jrkey,
              'data-joyridecompletiontag': `mgbjr-CT-np-${name}-${subcomponentProps.jrkey}`,
              id: `mgbjr-np-${name}-${subcomponentProps.jrkey}`,
              as: QLink,
              onClick: this.handleItemClick,
              ..._.omit(subcomponentProps, ['jrkey', 'explainClickAction']),
            })
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

export default NavPanelItem
