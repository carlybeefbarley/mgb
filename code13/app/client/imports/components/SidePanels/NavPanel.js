import PropTypes from 'prop-types'
import React from 'react'
import { Menu, Icon } from 'semantic-ui-react'
import getNavPanels from './getNavPanels'
import NavPanelItem from './NavPanelItem'

import { ActivityTypes } from '/imports/schemas/activity'
import { AssetKinds } from '/imports/schemas/assets'

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
    activity: PropTypes.array,
    hazUnreadActivities: PropTypes.array,
  }

  render() {
    const { router } = this.context
    const { currUser, navPanelAvailableWidth, activity, hazUnreadActivities } = this.props
    const useIcons = navPanelAvailableWidth < 728 // px
    const allNavPanels = getNavPanels(currUser, null, this.props)
    return allNavPanels

    const notifications = _.find(allNavPanels.right, item => item.name === 'notifications')
    if (notifications) {
      // if there are no notifications
      if (activity.length === 0) {
        notifications.menu.push({
          subcomponent: 'Item',
          content: "You don't have any notifications yet",
          jrkey: 'empty-notifications',
        })
      }
      // add menu items for notifications
      _.map(activity, act => {
        const linkTo = `/u/${act.toOwnerName}/asset/${act.toAssetId}`
        const icon = {
          name: AssetKinds.getIconName(act.toAssetKind),
          color: AssetKinds.getColor(act.toAssetKind),
        }
        const isUnread = !!_.find(hazUnreadActivities, unread => unread._id === act._id)
        const description =
          act.toAssetName + ': ' + act.byUserName + ' ' + ActivityTypes.getDescription(act.activityType)

        notifications.menu.push({
          subcomponent: 'Item',
          icon,
          content: description,
          to: linkTo,
          jrkey: act._id,
          selected: isUnread,
        })
      })

      // add red bubble for unread notifications
      if (hazUnreadActivities && hazUnreadActivities.length > 0) {
        if (notifications) notifications.notifyCount = hazUnreadActivities.length
      }
    }

    const navPanelItems = side =>
      allNavPanels[side]
        .filter(v => !(useIcons && v.hideInIconView))
        .map(({ content, href, icon, menu, name, notifyCount, query, to }) => (
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
            hazUnreadActivities={hazUnreadActivities}
            notifyCount={notifyCount}
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

export default NavPanel
