import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { Button, Menu, Header, List, Segment } from 'semantic-ui-react'

const linkLi = (txt, url) => <List.Item><a target="_blank" href={url}>{txt}</a></List.Item>

const _getFlipsideUrl = () => {
  const l = window.location
  const newHost = l.host.startsWith("localhost") ? "https://v2.mygamebuilder.com" : "http://localhost:3000"
  return `${newHost}${l.pathname}${l.search}`
}

const LinkTabContent = () => (
  <div>
    <Header sub>Dev Quicklinks</Header>
    <List bulleted>
      { linkLi("localhost/v2 flipside", _getFlipsideUrl()) }
      { linkLi("Slack", "https://devlapse.slack.com/messages/mgb-dev") }
      { linkLi("Github", "https://github.com/devlapse/mgb") }
      { linkLi("SemanticUI", "http://react.semantic-ui.com/") }
      { linkLi("TimeTracker spreadsheet", "https://docs.google.com/spreadsheets/d/1dq1FjxoHfMl49R-dIoxi7kpTZFi6HCHlz78-9QUO-Ds/edit#gid=131993583")}
    </List>

    <Header sub>Stock Assets Quicklinks</Header>
    <List bulleted>
      { linkLi("Stock Assets spreadsheet", "https://docs.google.com/spreadsheets/d/1LMmh_dTbBS51Nus8zLfXNAusoiUodBcJSMFzJz1agsg/edit#gid=1512032697")}
      { linkLi("'!vault/Stock Assets' view", "/u/!vault/assets?project=Stock+Assets")}
      { linkLi("'!vault/Tutorial Assets' view", "/u/!vault/assets?project=Tutorial+Data")}
    </List>

    <Header sub>Deployment/Monitoring Quicklinks</Header>
    <List bulleted>
      { linkLi("Google Analytics (RT)", "https://analytics.google.com/analytics/web/?authuser=0#realtime/rt-overview/a82379171w121883491p127579308/%3F_r.dsa%3D1%26_.advseg%3D%26_.useg%3D%26_.sectionId%3D/") }
      { linkLi("Hotjar (Ux analytics)", "https://insights.hotjar.com/sites/446876/dashboard") }
      { linkLi("TrackJs (client errors)", "https://my.trackjs.com/messages") }
      { linkLi("Galaxy (PaaS)", "https://galaxy.meteor.com/app/v2.mygamebuilder.com") }
      { linkLi("mLab telemetry", "https://mlab.com/realtime-dashboard?server=s-ds021730-a0") }
      { linkLi("mLab cluster", "https://mlab.com/clusters/rs-ds021730") }
    </List>
    <p>{Meteor.settings.public.MGB_GIT_BRANCH} @ cc={Meteor.settings.public.MGB_GIT_BRANCH_COMMIT_COUNT}</p>
  </div>
)

const UserAdmin = ( { user } ) => ( !user ? <div>Visit a page that has a user context</div> : ( 
  <div>
    <Header sub>Public Info: {user.username}</Header>
    <List bulleted>
      { linkLi(`UserId: ${user._id}`)}
      { linkLi(`MGB1 name: '${user.profile.mgb1name || ''}' ${!user.profile.mgb1nameVerified ? '' : ' (verified)' }`)}
      { linkLi(`Badges: ${_.join(user.badges, ',')}`,  `/u/${user.username}/badges`)}
      { linkLi(`Created: ${user.createdAt}`, `/u/${user.username}`)}
      { linkLi(`Latest WhatsNew seen: ${user.profile.latestNewsTimestampSeen}`, `/u/${user.username}`)}
      { linkLi(`Roles: ${user.permissions ? _.join(user.permissions[0].roles, ',') : 'none'}`, `/u/${user.username}`)}    
    </List>

    <Header sub>Secret Info</Header>
    <List bulleted>
      { linkLi("TODO", "/") }
    </List>

    <Header sub>Admin Actions</Header>
    <Button.Group vertical basic compact size='small'>
      <Button
        icon={{ color: 'red', name: 'ban' }}
        labelPosition='left'
        title='Banned users can still log in and be seen in user lists, but they cannot create/change/message'
        content={( user.suIsBanned ? "UNBAN" : "BAN") + ` user '${user.username}'`}
        onClick={() => Meteor.call('User.toggleBan', user._id) }
        />
      <Button
        icon={{ color: 'red', name: 'user close' }}
        labelPosition='left'
        title='Deactivated users are not shown in user lists, and cannot login. However (for now), their content and messages are still visible'
        content={( user.isDeactivated ? "Re-activate" : "Deactivate") + ` user '${user.username}'`}
        onClick={() => Meteor.call(user.isDeactivated ? 'User.reactivateAccount' :  'User.deactivateAccount', user._id) }
        />
    </Button.Group>
  </div>
))

class TabularMenu extends Component {
  state = { activeIndex: 0 }  

  render() {
    const menuItems = _.map(this.props.items, (item,idx) => ({ name: item.name, index: idx, key: item.name }))
    const SelectedElement = this.props.items[this.state.activeIndex].el
    return (
      <div>
        <Menu 
          tabular 
          activeIndex={this.state.activeIndex} 
          items={menuItems}
          attached='top'
          onItemClick={(ev, item) => { this.setState( { activeIndex: item.index} ) } }/>
        <Segment attached='bottom' basic>
          <SelectedElement user={this.props.user}/>
        </Segment>
      </div>
    )
  }
}

const _items = [
  { name: 'User',    el: UserAdmin },
  { name: 'Links',   el: LinkTabContent }
]

const fpSuperAdmin = ( { user, isSuperAdmin } ) => (
 // Yes, we lie to non-admins
  isSuperAdmin ? <TabularMenu items={_items} user={user}/> : <div>Not Yet Implemented</div>
)

fpSuperAdmin.propTypes = {
  user:               PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
  isSuperAdmin:       PropTypes.bool.isRequired     // Yes if one of core engineering team. Show extra stuff
}

export default fpSuperAdmin