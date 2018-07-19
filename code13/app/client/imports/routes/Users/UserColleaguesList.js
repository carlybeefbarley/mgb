import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Grid, Header, Card } from 'semantic-ui-react'
import { withTracker } from 'meteor/react-meteor-data'
import { Users } from '/imports/schemas'
import UserCard from '/client/imports/components/Users/UserCard'

const _wrapStyle = { clear: 'both', flexWrap: 'wrap' }
const _nowrapStyle = {
  clear: 'both',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
  marginBottom: '1em',
}

const UserColleaguesListUI = ({ wrap, loading, userList, narrowItem, handleClickUser }) =>
  loading || !userList || userList.length === 0 ? null : (
    <Grid.Column className="animated fadeIn" width={16}>
      <Grid.Row>
        <Header
          as="h2"
          content={
            <a>
              Colleagues <small>({userList.length})</small>
            </a>
          }
        />
        <Card.Group className="relaxed" style={wrap ? _wrapStyle : _nowrapStyle}>
          {loading === false &&
            userList.map((person, idx) => (
              <UserCard
                key={idx}
                user={person}
                narrowItem={narrowItem}
                handleClickUser={handleClickUser}
                //as={QLink} to={`/u/${person.username}`}
              />
            ))}
        </Card.Group>
      </Grid.Row>
    </Grid.Column>
  )

// we are given props.projects and we need to subscribe to the relevant users objects
const UserColleaguesList = withTracker(props => {
  let colleagueIds = []
  _.forEach(props.projects, project => {
    colleagueIds = _.union(colleagueIds, project.memberIds, [project.ownerId])
  })
  colleagueIds = _.without(colleagueIds, props.user._id)
  const selector = { _id: { $in: colleagueIds } }
  const usersHandle = Meteor.subscribe('users.getByIdList', colleagueIds)

  return {
    userList: _.sortBy(Users.find(selector).fetch(), u => _.toLower(u.username)),
    loading: !usersHandle.ready(),
  }
})(UserColleaguesListUI)

UserColleaguesList.propTypes = {
  wrap: PropTypes.bool,
  projects: PropTypes.array,
  user: PropTypes.object.isRequired,
  narrowItem: PropTypes.bool,
  handleClickUser: PropTypes.func,
}

export default UserColleaguesList
