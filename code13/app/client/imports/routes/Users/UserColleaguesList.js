import React, { PropTypes, Component } from "react";
import homeStyles from "/client/imports/routes/home.css";
import getStartedStyle from "/client/imports/routes/GetStarted.css";
import { Grid, Header, Card } from "semantic-ui-react";
import { createContainer } from "meteor/react-meteor-data";
import { Users } from "/imports/schemas";
import UserItem from '/client/imports/components/Users/UserItem'
import _ from 'lodash'
import { userSorters } from '/imports/schemas/users'

const _wrapStyle = { clear: 'both', flexWrap: 'wrap' }
const _nowrapStyle = { clear: 'both', flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden', marginBottom: '1em' }

const UserColleaguesListUI = props => (
    
  <Grid.Column className="animated fadeIn" width={16}>
      <Grid.Row>

    <Header as="h2" content="User's Colleagues" />
    <Card.Group 
        className="very relaxed" 
        style={props.wrap ? _wrapStyle : _nowrapStyle}
        >
      {props.loading === false &&
        props.userList.map((person, idx) => (
          <UserItem 
          className="mgb-projectcard-width"
          key={idx}
          user={person} 
          narrowItem={props.userList.narrowItem}
          handleClickUser={props.userList.handleClickUser}
          //as={QLink} to={`/u/${person.username}`}
          />
        ))}
    </Card.Group>
    <br />
    </Grid.Row>
  </Grid.Column>
);

// we are given props.projects and we need to subscribe to the relevant users objects
const UserColleaguesList = createContainer((props) => {

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
