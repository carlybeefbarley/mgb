import React, { Component, PropTypes } from 'react'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import QLink from '/client/imports/routes/QLink'
import { Dropdown } from 'semantic-ui-react'
import _ from 'lodash'

class NavPanelItem extends Component {
  static propTypes = {
    hdr: PropTypes.node,
    name: PropTypes.string.isRequired,        // Used for generating mgbjr-id-${name}-.. parts of joyride tags
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
  handleItemClick = (e) => { 
    if (e.target.dataset && e.target.dataset.joyridecompletiontag)
      joyrideCompleteTag(e.target.dataset.joyridecompletiontag)
    this.setState({ open: false })
  }
  // TODO(@Levi): How to remove the bind in OnClick.. data-____ props
  render() {
    const { hdr, name, menu, style, to, query, openLeft } = this.props
    const { open } = this.state

    return (
      <Dropdown
        item
        id={`mgbjr-np-${name}`}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={() => joyrideCompleteTag(`mgbjr-CT-np-${name}`) }
        trigger={<QLink to={to} query={query} >{hdr}</QLink>}
        icon={null}
        open={open}
        style={style}>
        <Dropdown.Menu style={openLeft ? { left: 'auto', right: '0' } : null}>
          {_.map(menu, ({ subcomponent, ...subcomponentProps }) => {
            return React.createElement(Dropdown[subcomponent], {
              key: subcomponentProps.jrkey,
              "data-joyridecompletiontag": `mgbjr-CT-np-${name}-${subcomponentProps.jrkey}`,
              id: `mgbjr-np-${name}-${subcomponentProps.jrkey}`,           
              as: QLink,
              onClick: this.handleItemClick,
              ...(_.omit(subcomponentProps, ['jrkey','explainClickAction'])),
            })
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

export default NavPanelItem
