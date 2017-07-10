import React, { PropTypes } from 'react'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import { Dropdown } from 'semantic-ui-react'
import _ from 'lodash'

const _openLeftStyle = { left: 'auto', right: '0' }
class NavPanelItem extends React.PureComponent {
  static propTypes = {
    hdr: PropTypes.node,
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
  handleDropdownClick = () => {
    const { to, query, name } = this.props
    joyrideCompleteTag(`mgbjr-CT-np-${name}`)
    utilPushTo(null, to, query)
  }

  render() {
    const { hdr, name, menu, style, openLeft } = this.props
    const { open } = this.state

    return (
      <Dropdown
        item
        id={`mgbjr-np-${name}`}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={this.handleDropdownClick}
        trigger={
          <span>
            {hdr}
          </span>
        }
        icon={null}
        open={open}
        style={style}
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
