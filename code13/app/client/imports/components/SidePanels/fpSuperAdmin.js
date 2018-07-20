import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Button, Menu, Header, List, Segment } from 'semantic-ui-react'
import { isSameUser } from '/imports/schemas/users'
import moment from 'moment'
import FlagsModerate from '/client/imports/components/Controls/FlagsModerate'
import { utilPushTo } from '/client/imports/routes/QLink'

const outlinkLi = (txt, url, key) => (
  <List.Item key={key}>
    <a target="_blank" href={url}>
      <small>{txt}</small>
    </a>
  </List.Item>
)

const inlinkLi = (txt, url, key) => (
  <List.Item key={key}>
    <QLink to={url}>
      <small>{txt}</small>
    </QLink>
  </List.Item>
)

const linkLi = (txt, url, key) =>
  _.startsWith(url, '/') ? inlinkLi(txt, url, key) : outlinkLi(txt, url, key)

const _getFlipsideUrl = () => {
  const l = window.location
  const newHost = l.host.startsWith('localhost') ? 'https://v2.mygamebuilder.com' : 'http://localhost:3000'
  return `${newHost}${l.pathname}${l.search}`
}

const LinkTabContent = () => (
  <div>
    <Header sub>Dev Quicklinks</Header>
    <List bulleted>
      <List.Item>
        <QLink to="/users" query={{ sort: 'createdNewest', limit: 100 }}>
          <small>Newest users</small>
        </QLink>
      </List.Item>
      {linkLi('Administrators Panel', '/devpanel')}
      {linkLi('localhost/v2 flipside', _getFlipsideUrl())}
      {linkLi('Slack', 'https://devlapse.slack.com/messages/mgb-dev')}
      {linkLi('Github', 'https://github.com/devlapse/mgb')}
      {linkLi('SemanticUI', 'http://react.semantic-ui.com/')}
      {/*linkLi("TimeTracker spreadsheet", "https://docs.google.com/spreadsheets/d/1dq1FjxoHfMl49R-dIoxi7kpTZFi6HCHlz78-9QUO-Ds/edit#gid=131993583") */}
    </List>

    <Header sub>Stock Assets Quicklinks</Header>
    <List bulleted>
      {linkLi(
        'Stock Assets spreadsheet',
        'https://docs.google.com/spreadsheets/d/1LMmh_dTbBS51Nus8zLfXNAusoiUodBcJSMFzJz1agsg/edit#gid=1512032697',
      )}
      {linkLi("'!vault/Stock Assets' view", '/u/!vault/assets?project=Stock+Assets')}
      {linkLi("'!vault/Tutorial Assets' view", '/u/!vault/assets?project=Tutorial+Data')}
    </List>

    <Header sub>Deployment/Monitoring Quicklinks</Header>
    <List bulleted>
      {linkLi(
        'Google Analytics (RT)',
        'https://analytics.google.com/analytics/web/?authuser=0#realtime/rt-overview/a82379171w121883491p127579308/%3F_r.dsa%3D1%26_.advseg%3D%26_.useg%3D%26_.sectionId%3D/',
      )}
      {linkLi('Hotjar (Ux analytics)', 'https://insights.hotjar.com/sites/446876/dashboard')}
      {linkLi('TrackJs (client errors)', 'https://my.trackjs.com/messages')}
      {linkLi('Galaxy (PaaS)', 'https://galaxy.meteor.com/app/v2.mygamebuilder.com')}
      {linkLi('mLab telemetry', 'https://mlab.com/realtime-dashboard?server=s-ds021730-a0')}
      {linkLi('mLab cluster', 'https://mlab.com/clusters/rs-ds021730')}
    </List>
    <p>
      {Meteor.settings.public.MGB_GIT_BRANCH} @ commit count={Meteor.settings.public.MGB_GIT_BRANCH_COMMIT_COUNT}{' '}
      ({Meteor.settings.public.MGB_GIT_DESCRIBE})
    </p>
  </div>
)

const UserAdmin = ({ user, extraUserInfo }) => {
  if (!user) return <div>Visit a page that has a user context</div>

  const usrLink = `/u/${user.username}`
  const mgb1Link = `${usrLink}/projects/import/mgb1`

  return (
    <div>
      <Header sub>Public Info: {user.username}</Header>
      <List bulleted>
        {linkLi(`UserId: ${user._id}`)}
        {!_.isEmpty(user.permissions) &&
          linkLi(`Roles: ${user.permissions ? _.join(user.permissions[0].roles, ',') : 'none'}`, usrLink)}
        {linkLi(`Self-claimed MGB1 names: '${user.profile.mgb1name || ''}'`, mgb1Link)}
        {linkLi(`ADMIN-verified MGB1 names: '${user.profile.mgb1namesVerified}'`, mgb1Link)}
        {linkLi(`Badges: ${_.join(user.badges, ', ')}`, `${usrLink}/badges`)}
        {linkLi(`Created: ${moment(user.createdAt).fromNow()}`, usrLink)}
        {linkLi(
          `Latest WhatsNew seen: ${moment(new Date(user.profile.latestNewsTimestampSeen)).fromNow()}`,
          usrLink,
        )}
      </List>

      <Header sub>Admin Actions</Header>
      <Button.Group vertical basic compact size="small">
        <Button
          icon={{ color: 'red', name: 'ban' }}
          labelPosition="left"
          title="Banned users can still log in and be seen in user lists, but they cannot create/change/message"
          content={(user.suIsBanned ? 'UNBAN' : 'BAN') + ` user '${user.username}'`}
          onClick={() => Meteor.call('User.toggleBan', user._id)}
        />
        <Button
          icon={{ color: 'red', name: 'user close' }}
          labelPosition="left"
          title="Deactivated users are not shown in user lists, and cannot login. However (for now), their content and messages are still visible"
          content={(user.isDeactivated ? 'Re-activate' : 'Deactivate') + ` user '${user.username}'`}
          onClick={() =>
            Meteor.call(user.isDeactivated ? 'User.reactivateAccount' : 'User.deactivateAccount', user._id)}
        />
      </Button.Group>

      <Header sub>Admin-only user Info</Header>
      {extraUserInfo && (
        <List bulleted>
          {linkLi('usernames: ' + _.join(extraUserInfo.ua.usernames, ', '), '/')}
          {_.map(extraUserInfo.u.emails, email =>
            linkLi(
              'email: ' + email.address + (email.verified ? ' (v)' : ' (!v)'),
              'mailto:' + email.address,
              email,
            ),
          )}
          {_.map(extraUserInfo.ua.ipAddresses, ipStr =>
            linkLi('IP: ' + ipStr, 'https://freegeoip.net/?q=' + ipStr, ipStr),
          )}
        </List>
      )}
    </div>
  )
}

const ModeratorList = () => <FlagsModerate />

/* TabularMenu is the actual tabbed admin menu. It will also get and inject extended user data
 * using an admin-only Meteor call so we can see email, IPs etc easily
 */
class TabularMenu extends Component {
  state = {
    activeIndex: 0,
    extraUserInfo: null,
  }

  getExtraUserInfo = user => {
    if (user) {
      this.setState({ extraUserInfo: null })
      //load more data here such as recent flagged items user meteor.call for now
      //check out definition for below .call
      Meteor.call('User.su.analytics.info', user._id, (err, result) => {
        if (result && !err) this.setState({ extraUserInfo: result })
      })
    }
  }

  componentWillMount() {
    if (this.props.user) this.getExtraUserInfo(this.props.user)
  }

  componentWillReceiveProps(nextProps) {
    if (!isSameUser(this.props.user, nextProps.user)) this.getExtraUserInfo(nextProps.user)
  }

  render() {
    const menuItems = _.map(this.props.items, (item, idx) => ({
      name: item.name,
      index: idx,
      key: item.name,
    }))
    const SelectedElement = this.props.items[this.state.activeIndex].el
    return (
      <div>
        <Menu
          tabular
          activeIndex={this.state.activeIndex}
          items={menuItems}
          attached="top"
          onItemClick={(ev, item) => {
            this.setState({ activeIndex: item.index })
          }}
        />
        <Segment attached="bottom" basic>
          <SelectedElement user={this.props.user} extraUserInfo={this.state.extraUserInfo} />
        </Segment>
      </div>
    )
  }
}

const _items = [
  { name: 'User', el: UserAdmin },
  { name: 'Links', el: LinkTabContent },
  { name: 'Moderation', el: ModeratorList },
]

/* fpSuperAdmin is the overall super admin Flex Panel. For non-admins it
 * pretends to be not-yet-implemented lol
 */
const fpSuperAdmin = ({ user, isSuperAdmin }) =>
  isSuperAdmin ? <TabularMenu items={_items} user={user} /> : <div>Not Yet Implemented</div>

fpSuperAdmin.propTypes = {
  user: PropTypes.object, // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
  isSuperAdmin: PropTypes.bool.isRequired, // Yes if one of core engineering team. Show extra stuff
}

export default fpSuperAdmin
