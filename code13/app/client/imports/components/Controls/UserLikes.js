import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Popup, Header } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'
import { createContainer } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'
import { showToast } from '/client/imports/modules'
import { logActivity } from '/imports/schemas/activity'

const UserLikeIcon = ({ size, onIconClick, currUserLikes }) => (
  <div>
    <a>
      <Icon
        name={currUserLikes ? 'thumbs up' : 'thumbs outline up'}
        size={size}
        onClick={onIconClick}
        color="blue"
      />
      <small>&nbsp;Like</small>
    </a>
  </div>
)

const UserLikesUI = ({ seeLikers, userList, size, popupPosition, onIconClick, currUserLikes, asset }) => (
  <Popup
    on="hover"
    size="small"
    hoverable // So mouse-over popup keeps it visible for Edit for example
    position={popupPosition}
    trigger={
      <span overflow="hidden">
        <small overflow="hidden">{asset.likedBy_count} </small>
        <UserLikeIcon
          currUserLikes={currUserLikes}
          size={size}
          onIconClick={!(asset.suIsBanned === true) && !asset.suFlagId ? onIconClick : null}
        />
      </span>
    }
  >
    {seeLikers && <Popup.Header>Users who like this</Popup.Header>}
    <Popup.Content>
      {seeLikers ? userList.length > 0 ? (
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
          <span display="inline">
            {' '}
            {asset.likedBy ? asset.likedBy.length : 0} like{asset.likedBy_count !== 1 ? 's' : ''}
          </span>
        </QLink>
      )}
    </Popup.Content>
  </Popup>
)

UserLikesUI.propTypes = {
  popupPosition: PropTypes.string.isRequired,
  asset: PropTypes.object.isRequired,
  onIconClick: PropTypes.func,
  currUserLikes: PropTypes.bool,
  seeLikers: PropTypes.bool,
}

UserLikesUI.defaultProps = {
  popupPosition: 'bottom right',
}

// TODO: Only get the username list when the popup shows.. or find a cheaper cache for id->username

const UserLikes = createContainer(props => {
  const { seeLikers, currUser, asset } = props
  const canLike = Boolean(currUser)
  const userId = currUser ? currUser._id : null
  const likedByIds = asset.likedBy
  const hasLikes = _.isArray(likedByIds) && likedByIds.length > 0
  const selector = { _id: { $in: likedByIds } }
  const doGetUsernames = seeLikers && hasLikes

  // Only do this query if the asset has some Likes
  /// ... AND if seeLikers == true ?
  const usersHandle = doGetUsernames ? Meteor.subscribe('users.getByIdList', likedByIds) : null

  return {
    userList: doGetUsernames ? _.sortBy(Users.find(selector).fetch(), u => _.toLower(u.username)) : [],
    currUserLikes: currUser ? _.includes(asset.likedBy, userId) : false,
    onIconClick: !canLike
      ? null
      : () => {
          Meteor.call('Azzets.toggleLike', asset._id, userId, (error, result) => {
            if (error) showToast.error('was unable to like/unlike this asset: ' + error.reason)
            else {
              if (result.newLikeState)
                logActivity('asset.userLikes', `${currUser.username} liked this asset`, null, asset)
            }
          })
        },
    loading: doGetUsernames ? !usersHandle.ready() : false,
  }
}, UserLikesUI)

UserLikes.propTypes = {
  currUser: PropTypes.object, // currently Logged In user (not always provided)
  asset: PropTypes.object.isRequired,
  seeLikers: PropTypes.bool.isRequired,
}

export default UserLikes
