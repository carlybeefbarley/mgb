import _ from 'lodash'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown, Menu, Label } from 'semantic-ui-react'

import { joyrideStore } from '/client/imports/stores'
import QLink, { utilPushTo } from '/client/imports/routes/QLink'

const _openLeftStyle = { left: 'auto', right: '0' }

const getElementType = ({ to, query, onClick }) => {
  return to || query || onClick ? QLink : 'div'
}

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

  getJoyrideId = (name, jrkey) => _.compact(['mgbjr-np', name, jrkey]).join('-')

  handleMouseEnter = e => {
    this.setState({ open: true })
    // read notifications if notification submenu is opened
    if (this.props.name == 'notifications' && this.props.hazUnreadActivities.length > 0) {
      Meteor.call('Activity.readLog', (err, res) => {
        if (err) console.log('Could not read Activity: ', err.reason)
      })
    }
  }
  handleMouseLeave = () => this.setState({ open: false })
  handleClick = props => (e, data) => {
    const { jrkey, name, onClick, query, to } = props
    if (onClick) onClick(e, data)

    if (name || jrkey) {
      const tagString = _.compact(['mgbjr-CT-np', name, jrkey]).join('-')
      joyrideStore.completeTag(tagString)
    }
    if (to || query) utilPushTo(null, to, query)

    this.setState({ open: !this.state.open })
  }

  render() {
    const { isActive, className, content, href, jrkey, name, menu, style, openLeft, notifyCount } = this.props
    const { open } = this.state

    let fullContent = content
    if (notifyCount && notifyCount > 0) {
      fullContent = (
        <div>
          {content}
          <Label circular color="red" floating size="mini">
            {notifyCount}
          </Label>
        </div>
      )
    }
    const props = {
      href,
      id: this.getJoyrideId(name, jrkey),
      // Heads up!
      // Do no use a QLink here for activeClassName support.
      // The Dropdown requires a ref and <Link /> is a functional component.
      // React does not support refs on functional components.
      className: cx(className, { active: isActive }),
      onClick: this.handleClick(this.props),
      style,
    }

    if (!menu) {
      return <Menu.Item {...props} content={fullContent} />
    }

    return (
      <Dropdown
        {...props}
        item
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        trigger={fullContent}
        icon={null}
        open={open}
        label={{ color: 'red', circular: true }}
      >
        <Dropdown.Menu style={openLeft ? _openLeftStyle : null}>
          {_.map(menu, ({ subcomponent, ...subcomponentProps }) => {
            const { jrkey, ...rest } = subcomponentProps
            delete rest.explainClickAction

            return React.createElement(Dropdown[subcomponent], {
              ...rest,
              key: jrkey,
              as: getElementType(rest),
              id: this.getJoyrideId(name, jrkey),
              // we need the parent `name` and the item's `jrkey` for the joyride completion tag
              onClick: this.handleClick({ ...rest, name, jrkey }),
            })
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

export default NavPanelItem
