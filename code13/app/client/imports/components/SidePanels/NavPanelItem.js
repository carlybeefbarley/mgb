import React, { PureComponent } from 'react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Icon, Menu, Dropdown } from 'semantic-ui-react'
import { joyrideStore } from '/client/imports/stores'
import { utilPushTo } from '/client/imports/routes/QLink'

class NPDropdown extends PureComponent {
  getIcon = (data, color) => {
    if (typeof data !== 'string') {
      return data
    }
    return <Icon name={data} color={color} />
  }
  render() {
    const {
      parentChildren,
      jrkey,
      label,
      to,
      direction,
      header = null,
      iconColor = null,
      icon = null,
    } = this.props

    return (
      <Dropdown
        id={`mgbjr-np-${jrkey}`}
        item
        simple
        // Open is set to a constant to prevent dropdown items from highlighting themselves after being clicked
        // so that they maintain visual continuity with Menu.Item components, this does not affect how the
        // dropdown actually behaves elsewise.
        open={false}
        text={label}
        icon={this.getIcon(icon, iconColor)}
        onClick={e => {
          e.stopPropagation()
          utilPushTo(null, to)
          joyrideStore.completeTag(`mgbjr-CT-np-${jrkey}`)
        }}
        // onMouseEnter={() => {
        //   joyrideStore.completeTag(`mgbjr-CT-np-${jrkey}`)
        // }}
      >
        {/* Note that className="left" used below because semantic doesnt want to play nice and use direction="left" */}
        <Dropdown.Menu className={direction === 'left' ? 'left' : null}>
          {header && <Dropdown.Header id={`mgbjr-np-${jrkey}-${jrkey}Header`} content={header} />}
          {/* Children are cloned from props instead of allowing react to create children via standard means to allow joyride keys to be generated
          and so that standard React workflow can be followed when adding items to the NavPanel */}
          {React.Children.map(parentChildren, child => {
            return React.cloneElement(child, { parentJRKey: jrkey, jrkey: child.key })
          })}
        </Dropdown.Menu>
      </Dropdown>
    )
  }
}

class NPItem extends PureComponent {
  handleClick = e => {
    e.stopPropagation()
    const { to = null, toOptions = null, jrkey, onClick = null, parentJRKey } = this.props
    // Checks to see if anything was passed to onClick
    if (onClick) {
      onClick()
      // escape out of this function if we were already passed an onClick action.
      return
    }
    utilPushTo(toOptions, to, toOptions)
    joyrideStore.completeTag(`mgbjr-CT-np-${parentJRKey}-${jrkey}`)
  }

  getIcon = (data, color) => {
    if (typeof data !== 'string') {
      return data
    }
    return <Icon name={data} color={color} />
  }
  render() {
    const { jrkey, label, icon = null, iconColor = null } = this.props
    return (
      <Menu.Item
        id={`mgbjr-np-${jrkey}`}
        onClick={this.handleClick}
        content={label}
        icon={this.getIcon(icon, iconColor)}
      />
    )
  }
}

/**
 * This component is specifically paired with NavPanelItem components to work in tandem allowing both dropdown menus and simple buttons to be added
 * to the Nav panel without complicated object processing or using multiple components with special structuring and allowing the standard workflow
 * of React to be followed. It isn't quite as fast as rendering out all of the nav panel items based on a monolithic object but is much easier to
 * maintain as each item is instanciated off of a single component and child-parent relationships are readable as they now follow the standard react
 * child-parent workflow.
 *
 * This was done for two reasons.
 *
 * 1. Previously all nav panel items were simply stored in a large object with a large amount of nesting and render logic baked in via ternary operations
 *    and sometimes even nested turnary operations which gets confusing quickly and is difficult to work with when you're dealing with 30+ objects with specific
 *    child-parent relations.
 *
 * 2. Not only was it hard to understand what was happening, it was also very difficult to modify and add new items to the nav panel.
 *
 * 2018-07-27 - Hudson
 */
export class NavPanelOption extends PureComponent {
  handleClick = e => {
    e.stopPropagation()
    const { to = null, toOptions = null, jrkey, onClick = null, parentJRKey } = this.props
    // Checks to see if anything was passed to onClick
    if (onClick) {
      onClick()
      // escape out of this function if we were already passed an onClick action.
      return
    }
    utilPushTo(toOptions, to, toOptions)
    joyrideStore.completeTag(`mgbjr-CT-np-${parentJRKey}-${jrkey}`)
  }
  render() {
    const { label, icon, iconColor, jrkey, parentJRKey } = this.props
    return (
      <Dropdown.Item id={`mgbjr-np-${parentJRKey}-${jrkey}`} onClick={this.handleClick}>
        <Icon name={icon} color={iconColor || 'black'} />
        {label}
      </Dropdown.Item>
    )
  }
}

/**
 * Renders out a semantic ui Dropdown or Menu.Item depending on props passed to NavPanelItem
 */
export default class NavPanelItem extends PureComponent {
  static propTypes = {
    as: PropTypes.oneOf(['dropdown', 'item']),
  }

  render() {
    const { as } = this.props
    if (as === 'dropdown') {
      // parentChildren is passed via props to allow the final semantic ui Dropdown.Menu to render the children passed to this component
      // if it is to be rendered as a dropdown menu.
      return <NPDropdown {...this.props} parentChildren={this.props.children} />
    } else {
      return <NPItem {...this.props} />
    }
  }
}
