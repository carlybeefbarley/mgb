import _ from 'lodash'
import React from 'react'
import UserCard from '../Users/UserCard'
import { Segment } from 'semantic-ui-react'
import Spinner from '/client/imports/components/Nav/Spinner'

const _nowrapStyle = {
  display: 'flex',
  clear: 'both',
  flexWrap: 'nowrap',
  overflowX: 'auto',
  overflowY: 'hidden',
}

// ...GET - because this is a component that GETs it's own data via getMeteorData() callback

const StudentList = ({ classroom }) => (
  <div>
    {classroom ? classroom.studentIds.length ? (
      <div style={_nowrapStyle}>
        {_.map(this.data.users, user => {
          return (
            <div key={user._id} style={{ margin: '0 1em 1em 0' }}>
              <UserCard narrowItem user={user} style={{ marginBottom: 0 }} />
            </div>
          )
        })}
      </div>
    ) : (
      <Segment tertiary style={{ padding: '6vh 0' }} textAlign="center">
        There are no students enrolled in this class.
      </Segment>
    ) : (
      <Spinner />
    )}
  </div>
)

export default StudentList
