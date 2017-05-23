import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Icon, Popup } from 'semantic-ui-react'
import style from './WorkState.css'
import QLink from '/client/imports/routes/QLink'
import { createContainer } from 'meteor/react-meteor-data'
import { Users } from "/imports/schemas"

const UserLoveIcon = ( { size, onIconClick, currUserLoves } ) => (
  <Icon 
      name={ currUserLoves ? 'heart' : 'empty heart' }
      size={size}
      onClick={onIconClick}
      color='red'
      //className={`mgb-loves-${heartedBy}`} 
      />
)

const UserLovesUI = ( { seeLovers, userList, canEdit, size, popupPosition, onIconClick, currUserLoves, asset } ) => (
  <Popup
      on='hover'
      size='small'
      hoverable={true}    // So mouse-over popup keeps it visible for Edit for example
      positioning={popupPosition}
      trigger={(
        <span>
          <small>{asset.heartedBy_count} </small>
          <UserLoveIcon 
              currUserLoves={currUserLoves} 
              size={size} 
              onIconClick={canEdit ? onIconClick : null }/>
        </span>
      )} >
      { seeLovers && 
        <Popup.Header>
          Users who love this
        </Popup.Header>
      }
      <Popup.Content>
        { seeLovers ? 
            ( userList.length > 0 ? 
                userList.map((person, idx) => (
                  <div key={idx} >
                      <QLink to={`/u/${person.username}`}>
                          <p>{person.username}</p>
                      </QLink>
                  </div>
                ))
              :
                <span>(none yet)</span>
            )
          : 
            <QLink to={`/u/${asset.dn_ownerName}/asset/${asset._id}`}>
                {asset.heartedBy ? asset.heartedBy.length : 0} love{asset.heartedBy_count !== 1 ? 's' : ''}
            </QLink>
        }
      </Popup.Content>
  </Popup>
)

UserLovesUI.propTypes = {
  popupPosition:  PropTypes.string.isRequired,
  canEdit:        PropTypes.bool,
  asset:          PropTypes.object,
  onIconClick:    PropTypes.func,
  currUserLoves:  PropTypes.bool,
  seeLovers:      PropTypes.bool
}
UserLovesUI.defaultProps = {
  popupPosition: "bottom right",
}



const UserLoves = createContainer ((props)=> {
  const heartedByIds = props.asset.heartedBy
  const hasHearts = _.isArray(heartedByIds) && heartedByIds.length > 0
  const selector = {_id: {"$in": heartedByIds}}

  // Only do this query if the asset has some Hearts
  const usersHandle = hasHearts ? Meteor.subscribe("users.getByIdList", heartedByIds) : null
    
  return {
    userList: hasHearts ? _.sortBy(Users.find(selector).fetch(), u => _.toLower(u.username)) : [],
    loading: hasHearts ? !usersHandle.ready() : false
  }

}, UserLovesUI)
export default UserLoves
