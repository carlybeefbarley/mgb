import React, { PropTypes } from 'react'
import { Header, Label, Card, Icon } from 'semantic-ui-react'
import UX from '/client/imports/UX'
import { utilPushTo } from '/client/imports/routes/QLink'
import Badge from '/client/imports/components/Controls/Badge/Badge'
import { getAllBadgesForUser } from '/imports/schemas/badges'
import { makeChannelName} from '/imports/schemas/chats'
import QLink from '/client/imports/routes/QLink'
// These can be rendered as attached segments so the caller can easily place/attach buttons around it
// See http://v2.mygamebuilder.com/assetEdit/2Bot4CwduQRfRWBi6 for an example
export default class UserItem extends React.Component {

  static propTypes = {
    user: PropTypes.object.isRequired,
    handleClickUser: PropTypes.func,        // If provided, call this with the userId instead of going to the user Profile Page
    narrowItem:  PropTypes.bool,            // if true, this is narrow format (e.g flexPanel) [[ DEPRECATED ]]
    renderAttached: PropTypes.bool          // if true, then render attached
  }

  static contextTypes = {
    urlLocation: React.PropTypes.object
  }

  handleClickUser = () => {
    const { username, _id } = this.props.user
    if (this.props.handleClickUser)
      this.props.handleClickUser(_id, username)
    else
      utilPushTo(this.context.urlLocation.query, `/u/${username}`)
  }

  render() {
    const { user, renderAttached, className } = this.props
    const { profile, createdAt, suIsBanned, isDeactivated, username } = user
    const { title } = profile
    const badgesForUser = getAllBadgesForUser(user)
    const getBadgeN = idx => (<Badge forceSize={32} name={idx < badgesForUser.length ? badgesForUser[idx] : "_blankBadge"} />)
    const channelName = makeChannelName( { scopeGroupName: 'User', scopeId: this.props.user.username } )
    // TODO: Find how to add style={overflow: "hidden"} back to the div style of 'ui segment' without hitting the off-window-images-dont-get-rendered problem that seems unique to Chrome
    // avatar here comes directly from mgb server - as we need it to be up to date always (mgb server will still handle etag - if not changed)
    return (
      <Card
          raised={!renderAttached}
          className={className}
          onClick={this.handleClickUser} >
        <Card.Content style={{textAlign: "center"}}>
          <UX.UserAvatarNoLink username={username} height='6em'/>
        </Card.Content>
        <Card.Content style={{textAlign: "center"}}>
          <Card.Header>
          <Header size='large' content={username}/>
          </Card.Header>
          <Card.Meta>
            <UX.UserTitleSpan title={title}/>
          </Card.Meta>
          { suIsBanned &&
            <div><Label size='small' color='red' content='Suspended Account' /></div>
          }
          { isDeactivated &&
            <div><Label size='small' color='purple' content='Deactivated Account' /></div>
          }
          <p>
            <small style={{color:"rgb(0, 176, 224)"}}>Joined <UX.TimeMDY when={createdAt}/></small>
            <QLink query={{ _fp: `chat.${channelName}` }} style={{marginBottom: '6px'}}>
              <Icon name='chat' style={{marginLeft: "4px"}} />
            </QLink>
          </p>
        </Card.Content>
        <Card.Content extra style={{textAlign: "center"}}>
          {getBadgeN(0)} {getBadgeN(1)} {getBadgeN(2)} {getBadgeN(3)}
        </Card.Content>
      </Card>
    )
  }
}
