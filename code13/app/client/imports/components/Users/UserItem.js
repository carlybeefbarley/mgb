import _ from 'lodash'
import React, { PropTypes } from 'react'
import moment from 'moment'
import { utilPushTo } from '/client/imports/routes/QLink'
import Badge, { getAllBadgesForUser } from '/client/imports/components/Controls/Badge/Badge'


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
    const { profile, createdAt } = user
    const { name, avatar, title } = profile
    const createdAtFmt = moment(createdAt).format('MMMM DD, YYYY')
    const segClass = renderAttached ? "ui attached  segment" : "ui raised  segment"
    const imageSize = narrowItem ? "small" : "tiny"
    const titleSpan = <span><i className="quote left icon blue"></i>{title || "(no title)"}&nbsp;<i className="quote right icon blue"></i></span>
    const badgesForUser = getAllBadgesForUser(user)
    const getBadgeN = idx => (<Badge forceSize={32} name={idx < badgesForUser.length ? badgesForUser[idx] : "blank"} />)

    // TODO: Find how to add style={overflow: "hidden"} back to the div style of 'ui segment' without hitting the off-window-images-dont-get-rendered problem that seems unique to Chrome
    return ( 
      <div className={segClass} onClick={this.handleClickUser} >
        <div className="ui header large">{name}</div>
        <img src={avatar} className={`ui floated image ${imageSize}`} />
        { narrowItem ? titleSpan : <big>{titleSpan}</big> }
        <p><font color="lighblue">Joined {createdAtFmt}</font></p>
        { getBadgeN(0)} {getBadgeN(1)} {getBadgeN(2)} {getBadgeN(3)} 
      </div>
    )
  }
})