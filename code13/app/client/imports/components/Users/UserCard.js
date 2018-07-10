import PropTypes from 'prop-types'
import React from 'react'
import { Header, Label, Card, Icon } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import { utilPushTo } from '/client/imports/routes/QLink'
import Badge from '/client/imports/components/Badges/Badge'
import { getAllBadgesForUser } from '/imports/schemas/badges'
import { makeChannelName } from '/imports/schemas/chats'
import QLink from '/client/imports/routes/QLink'
// These can be rendered as attached segments so the caller can easily place/attach buttons around it

const _cardStyle = { textAlign: 'center' }

export default class UserCard extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    handleClickUser: PropTypes.func, // If provided, call this with the userId instead of going to the user Profile Page
    narrowItem: PropTypes.bool, // if true, this is narrow format (e.g flexPanel)
  }

  static contextTypes = {
    urlLocation: PropTypes.object,
  }

  handleClickUser = () => {
    const { user, handleClickUser } = this.props
    const { username, _id } = user
    if (handleClickUser) handleClickUser(_id, username)
    else utilPushTo(this.context.urlLocation.query, `/u/${username}`)
  }

  render() {
    const { user, narrowItem, style } = this.props
    const { profile, createdAt, suIsBanned, isDeactivated, username } = user
    const { title } = profile
    const channelName = makeChannelName({ scopeGroupName: 'User', scopeId: this.props.user.username })
    // TODO: Find how to add style={overflow: "hidden"} back to the div style of 'ui segment' without hitting the off-window-images-dont-get-rendered problem that seems unique to Chrome
    // avatar here comes directly from mgb server - as we need it to be up to date always (mgb server will still handle etag - if not changed)

    if (narrowItem)
      return (
        <Card
          as="div"
          link
          style={{ ...style, ..._cardStyle }}
          className="mgb-useritem-width-narrow"
          onClick={this.handleClickUser}
        >
          <Card.Content>
            <UX.UserAvatarNoLink username={username} height="4em" />
          </Card.Content>
          <Card.Content style={{ paddingLeft: 0, paddingRight: 0 }}>
            <Card.Header title={username} content={username} />
            {suIsBanned && (
              <div>
                <Label size="small" color="red" content="Suspended" />
              </div>
            )}
            {isDeactivated && (
              <div>
                <Label size="small" color="purple" content="Deactivated" />
              </div>
            )}
          </Card.Content>
        </Card>
      )

    const badgesForUser = getAllBadgesForUser(user)
    const getBadgeN = idx => (
      <Badge forceSize={32} name={idx < badgesForUser.length ? badgesForUser[idx] : '_blankBadge'} />
    )

    return (
      <Card
        as="div"
        link
        style={{ ...style, ..._cardStyle }}
        className="mgb-useritem-width-normal"
        onClick={this.handleClickUser}
      >
        <Card.Content>
          <UX.UserAvatarNoLink username={username} height="6em" />
        </Card.Content>
        <Card.Content style={{ paddingLeft: 0, paddingRight: 0 }}>
          <Header size="large" content={username} />
          <Card.Meta>
            <UX.UserTitle title={title} />
          </Card.Meta>
          <Card.Meta>
            <UX.UserWhenJoined when={createdAt} />
            <QLink query={{ _fp: `chat.${channelName}` }} style={{ marginBottom: '6px' }}>
              <Icon link color="blue" name="chat" style={{ marginLeft: '4px' }} />
            </QLink>
          </Card.Meta>
          {suIsBanned && (
            <div>
              <Label size="small" color="red" content="Suspended Account" />
            </div>
          )}
          {isDeactivated && (
            <div>
              <Label size="small" color="purple" content="Deactivated Account" />
            </div>
          )}
        </Card.Content>
        <Card.Content extra>
          {getBadgeN(0)} {getBadgeN(1)} {getBadgeN(2)} {getBadgeN(3)}
        </Card.Content>
      </Card>
    )
  }
}
