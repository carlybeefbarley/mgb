import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Popup } from 'semantic-ui-react'
import './WorkState.css'
import QLink from '/client/imports/routes/QLink'
import { createContainer } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'
import { showToast } from '/client/imports/modules'
import { logActivity } from '/imports/schemas/activity'

const UserLoveIcon = ({ size, onIconClick, currUserLoves }) => (
  <Icon name={currUserLoves ? 'heart' : 'empty heart'} size={size} onClick={onIconClick} color="red" />
)

const UserLovesUI = ({ seeLovers, userList, size, popupPosition, onIconClick, currUserLoves, asset }) => (
  <Popup
    on="hover"
    size="small"
    hoverable // So mouse-over popup keeps it visible for Edit for example
    position={popupPosition}
    trigger={
      <span>
        <small>{asset.heartedBy_count} </small>
        <UserLoveIcon
          currUserLoves={currUserLoves}
          size={size}
          onIconClick={!(asset.suIsBanned === true) && !asset.suFlagId ? onIconClick : null}
        />
      </span>
    }
  >
    {seeLovers && <Popup.Header>Users who love this</Popup.Header>}
    <Popup.Content>
      {seeLovers ? userList.length > 0 ? (
        userList.map((person, idx) => (
          <div key={idx}>
            <QLink to={`/u/${person.username}`}>
              <p>{person.username}</p>
            </QLink>
          </div>
        ))
      ) : (
        <span>(none yet)</span>
      ) : (
        <QLink to={`/u/${asset.dn_ownerName}/asset/${asset._id}`}>
          {asset.heartedBy ? asset.heartedBy.length : 0} love{asset.heartedBy_count !== 1 ? 's' : ''}
        </QLink>
      )}
    </Popup.Content>
  </Popup>
)

UserLovesUI.propTypes = {
  popupPosition: PropTypes.string.isRequired,
  asset: PropTypes.object.isRequired,
  onIconClick: PropTypes.func,
  currUserLoves: PropTypes.bool,
  seeLovers: PropTypes.bool,
}

UserLovesUI.defaultProps = {
  popupPosition: 'bottom right',
}

// TODO: Only get the username list when the popup shows.. or find a cheaper cache for id->username

const UserLoves = createContainer(props => {
  const { seeLovers, currUser, asset } = props
  const canLove = Boolean(currUser)
  const userId = currUser ? currUser._id : null
  const heartedByIds = asset.heartedBy
  const hasHearts = _.isArray(heartedByIds) && heartedByIds.length > 0
  const selector = { _id: { $in: heartedByIds } }
  const doGetUsernames = seeLovers && hasHearts

  // Only do this query if the asset has some Hearts
  /// ... AND if seeLovers == true ?
  const usersHandle = doGetUsernames ? Meteor.subscribe('users.getByIdList', heartedByIds) : null

  return {
    userList: doGetUsernames ? _.sortBy(Users.find(selector).fetch(), u => _.toLower(u.username)) : [],
    currUserLoves: currUser ? _.includes(asset.heartedBy, userId) : false,
    onIconClick: !canLove
      ? null
      : () => {
          Meteor.call('Azzets.toggleHeart', asset._id, userId, (error, result) => {
            if (error) showToast.error('was unable to love/unlove this asset: ' + error.reason)
            else {
              if (result.newLoveState)
                logActivity('asset.userLoves', `${currUser.username} loved this asset`, null, asset)
            }
          })
        },
    loading: doGetUsernames ? !usersHandle.ready() : false,
  }
}, UserLovesUI)

UserLoves.propTypes = {
  currUser: PropTypes.object, // currently Logged In user (not always provided)
  asset: PropTypes.object.isRequired,
  seeLovers: PropTypes.bool.isRequired,
}

export default UserLoves
