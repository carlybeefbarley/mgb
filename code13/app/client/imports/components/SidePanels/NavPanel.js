import PropTypes from 'prop-types'
import React from 'react'
import { Menu, Icon } from 'semantic-ui-react'
import getNavPanels from './getNavPanels'
import NavPanelItem from './NavPanelItem'

import { withStores } from '/client/imports/hocs'
import { joyrideStore } from '/client/imports/stores'

const menuStyle = {
  position: 'relative',
  flex: '0 0 auto',
  margin: 0,
  borderRadius: 0,
  marginBottom: 0,
}

class NavPanel extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  static propTypes = {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    navPanelAvailableWidth: PropTypes.number, // Width of the page area available for NavPanel menu
  }

  render() {
    const { router } = this.context
    const { currUser, joyrideStore, navPanelAvailableWidth } = this.props
    const useIcons = navPanelAvailableWidth < (joyrideStore.state.isRunning ? 790 : 670) // px
    const allNavPanels = getNavPanels(currUser)

    const navPanelItems = side =>
      allNavPanels[side]
        .filter(v => !(useIcons && v.hideInIconView))
        .map(({ content, href, icon, menu, name, query, to }) => (
          <NavPanelItem
            isActive={to && router.isActive(to)}
            name={name}
            openLeft={side === 'right'}
            key={name}
            content={useIcons || !content ? <Icon size="large" {...icon} /> : content}
            menu={menu}
            to={to}
            query={query}
            href={href}
          />
        ))

    return (
      <Menu icon={useIcons} inverted borderless style={menuStyle} id="mgbjr-np">
        {navPanelItems('left')}
        <Menu.Menu position="right">{navPanelItems('right')}</Menu.Menu>
      </Menu>
    )
  }
}

export default withStores({ joyrideStore })(NavPanel)
