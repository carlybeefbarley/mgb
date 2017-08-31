import React, { PropTypes } from 'react'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'
import { Dropdown, Menu } from 'semantic-ui-react'
import _ from 'lodash'

const _openLeftStyle = { left: 'auto', right: '0' }

class NavPanelItem extends React.PureComponent {
  static propTypes = {
    content: PropTypes.node,
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
    const { content, name, menu, style, to, openLeft, query } = this.props
    const { open } = this.state

    const isLink = to || query

    const props = {
      id: `mgbjr-np-${name}`,
      onClick: isLink ? this.handleClick : null,
      style,
    }

    if (!menu) {
      return <Menu.Item {...props} as={isLink ? QLink : 'div'} content={content} />
    }

    return (
      <Dropdown
        {...props}
        item
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        trigger={content}
        icon={null}
        open={open}
      >
        <Dropdown.Menu style={openLeft ? _openLeftStyle : null}>
          {_.map(menu, ({ subcomponent, ...subcomponentProps }) => {
            const { jrkey, ...rest } = subcomponentProps
            delete rest.explainClickAction

            const isLink = rest.to || rest.query
            return React.createElement(Dropdown[subcomponent], {
              ...rest,
              key: jrkey,
              as: isLink ? QLink : 'div',
              'data-joyridecompletiontag': `mgbjr-CT-np-${name}-${jrkey}`,
              id: `mgbjr-np-${name}-${jrkey}`,
              onClick: isLink ? this.handleItemClick : null,
            })
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

export default NavPanelItem
