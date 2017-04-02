import React, { PropTypes } from 'react'
import moment from 'moment'
import { utilPushTo } from '/client/imports/routes/QLink'
import Badge from '/client/imports/components/Controls/Badge/Badge'
import { getAllBadgesForUser } from '/imports/schemas/badges'
import { makeCDNLink, makeExpireTimestamp } from '/client/imports/helpers/assetFetchers'
import { Header, Label, Segment, Card } from 'semantic-ui-react'
import SpecialGlobals from '/imports/SpecialGlobals'

// These can be rendered as attached segments so the caller can easily place/attach buttons around it
// See http://v2.mygamebuilder.com/assetEdit/2Bot4CwduQRfRWBi6 for an example
export default UserItem = React.createClass({

  propTypes: {
    user: PropTypes.object.isRequired,
    handleClickUser: PropTypes.func,        // If provided, call this with the userId instead of going to the user Profile Page
    narrowItem:  PropTypes.bool,            // if true, this is narrow format (e.g flexPanel)
    renderAttached: PropTypes.bool          // if true, then render attached
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  handleClickUser: function() {
    const { name } = this.props.user.profile
    const uid = this.props.user._id
    if (this.props.handleClickUser)
      this.props.handleClickUser(uid, name)
    else
      utilPushTo(this.context.urlLocation.query, `/u/${name}`)
  },

  render: function() {
    const { user, narrowItem, renderAttached } = this.props
    const { profile, createdAt, suIsBanned, isDeactivated } = user
    const { name, avatar, title } = profile
    const createdAtFmt = moment(createdAt).format('MMMM DD, YYYY')
    const imageSize = narrowItem ? "mini" : "tiny"
    const titleSpan = <span><i className="quote left icon blue"></i>{title || "(no title)"}&nbsp;<i className="quote right icon blue"></i></span>
    const badgesForUser = getAllBadgesForUser(user)
    const getBadgeN = idx => (<Badge forceSize={32} name={idx < badgesForUser.length ? badgesForUser[idx] : "_blankBadge"} />)

    // TODO: Find how to add style={overflow: "hidden"} back to the div style of 'ui segment' without hitting the off-window-images-dont-get-rendered problem that seems unique to Chrome
    // avatar here comes directly from mgb server - as we need it to be up to date always (mgb server will still handle etag - if not changed)
    // return (
    //   <Segment
    //       raised={!renderAttached}
    //       attached={renderAttached}
    //       onClick={this.handleClickUser} >
    //     <Header size='large' content={name}/>
    //     <img src={makeCDNLink(avatar, makeExpireTimestamp(60)) || SpecialGlobals.defaultUserProfileImage} className={`ui floated image ${imageSize}`} />
    //     { narrowItem ? <small>{titleSpan}</small> : <big>{titleSpan}</big> }
    //     { suIsBanned &&
    //       <div><Label size='small' color='red' content='Suspended Account' /></div>
    //     }
    //     { isDeactivated &&
    //       <div><Label size='small' color='purple' content='Deactivated Account' /></div>
    //     }
    //     <p><small style={{color:"rgb(0, 176, 224)"}}>Joined {createdAtFmt}</small></p>
    //     {getBadgeN(0)} {getBadgeN(1)} {getBadgeN(2)} {getBadgeN(3)}
    //   </Segment>
    // )
    return (
      <Card
          raised={!renderAttached}
          attached={renderAttached}
          onClick={this.handleClickUser} >
          <Card.Content>
          </Card.Content>
          <Card.Content style={{textAlign: "center"}}>
        <img src={makeCDNLink(avatar, makeExpireTimestamp(60)) || SpecialGlobals.defaultUserProfileImage} className={`ui centered image circular ${imageSize}`} />
        </Card.Content>
        <Card.Content style={{textAlign: "center"}}>
        <Card.Header>
        <Header size='large' content={name}/>
        </Card.Header>
        <Card.Meta>
        { narrowItem ? <small>{titleSpan}</small> : <big>{titleSpan}</big> }
        </Card.Meta>
        { suIsBanned &&
          <div><Label size='small' color='red' content='Suspended Account' /></div>
        }
        { isDeactivated &&
          <div><Label size='small' color='purple' content='Deactivated Account' /></div>
        }
        <p><small style={{color:"rgb(0, 176, 224)"}}>Joined {createdAtFmt}</small></p>
        </Card.Content>
        <Card.Content extra style={{textAlign: "center"}}>{getBadgeN(0)} {getBadgeN(1)} {getBadgeN(2)} {getBadgeN(3)}
        </Card.Content>
      </Card>
    )
  }
})
//i tried to use the card stuff for semantic ui lol it looks not good... partly because its so tiny but when i made it bigger it just looked sparse
//i think it wouldnt look so weird in general tho using card or segment if users list was two columns instead of just one, also it wouldnt feel like you had to endlessly scroll to the bottom as much...
  // return (
  //     <Card
  //         raised={!renderAttached}
  //         attached={renderAttached}
  //         onClick={this.handleClickUser} >
  //         <Card.Content>
  //         <Card.Header>
  //       <Header size='large' content={name}/>
  //       </Card.Header>
  //       <img src={makeCDNLink(avatar, makeExpireTimestamp(60)) || SpecialGlobals.defaultUserProfileImage} className={`ui floated image ${imageSize}`} />
  //       <Card.Meta>
  //       { narrowItem ? <small>{titleSpan}</small> : <big>{titleSpan}</big> }
  //       </Card.Meta>
  //       { suIsBanned &&
  //         <div><Label size='small' color='red' content='Suspended Account' /></div>
  //       }
  //       { isDeactivated &&
  //         <div><Label size='small' color='purple' content='Deactivated Account' /></div>
  //       }
  //       <p><small style={{color:"rgb(0, 176, 224)"}}>Joined {createdAtFmt}</small></p>
  //       </Card.Content>
  //       <Card.Content extra>{getBadgeN(0)} {getBadgeN(1)} {getBadgeN(2)} {getBadgeN(3)}</Card.Content>
  //     </Card>
  //   )