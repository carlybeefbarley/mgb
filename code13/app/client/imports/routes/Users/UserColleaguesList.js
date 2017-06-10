import _ from 'lodash'
import React, { PropTypes } from "react"
import { Grid, Header, Card } from "semantic-ui-react"
import { createContainer } from "meteor/react-meteor-data"
import { Users } from "/imports/schemas"
import UserItem from '/client/imports/components/Users/UserItem'

const _wrapStyle = { clear: 'both', flexWrap: 'wrap' }
const _nowrapStyle = { clear: 'both', flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden', marginBottom: '1em' }

const UserColleaguesListUI = ( { wrap, loading, userList, narrowItem, handleClickUser } ) => (
    
  <Grid.Column className="animated fadeIn" width={16}>
    <Grid.Row>
      <Header 
          as='h2'
          content={<a>Colleagues <small>{userList ? userList.length : 0}</small></a>} />
      <Card.Group 
          className="relaxed" 
          style={wrap ? _wrapStyle : _nowrapStyle}
          >
        {loading === false &&
          userList.map((person, idx) => (
            <UserItem 
            key={idx}
            user={person} 
            narrowItem={narrowItem}
            handleClickUser={handleClickUser}
            //as={QLink} to={`/u/${person.username}`}
            />
          ))}
      </Card.Group>
      { ( !loading && (!userList || userList.length === 0) ) && 
        <span>No colleagues yet... Join or create some project teams!</span>  
      }
    </Grid.Row>
  </Grid.Column>
)

// we are given props.projects and we need to subscribe to the relevant users objects
const UserColleaguesList = createContainer(props => {

  let colleagueIds = []
  _.forEach(props.projects, project => {
    colleagueIds = _.union(colleagueIds, project.memberIds, [project.ownerId])
  })
  colleagueIds = _.without(colleagueIds, props.user._id)
  const selector = {_id: {"$in": colleagueIds}}
  const usersHandle = Meteor.subscribe("users.getByIdList", colleagueIds)

  return {
    userList: _.sortBy(Users.find(selector).fetch(), u => _.toLower(u.username)),
    loading: !usersHandle.ready()
  };
}, UserColleaguesListUI);
export default UserColleaguesList;
