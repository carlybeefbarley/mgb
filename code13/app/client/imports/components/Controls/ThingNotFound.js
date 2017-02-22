import React, { PropTypes } from 'react'
import { Segment, Message } from 'semantic-ui-react'

const ThingNotFound = ( { type, id } ) => (
  <Segment padded>
    <Message 
      error 
      icon='broken chain'
      header={`${type} not found`}
      list={[
        `${type} ${id ? `'${id}' `: ''} does not exist. Weird...`,
        `Maybe it was deleted?`,
        `Also, names and Ids in URLs are case-sensitive, maybe that's the issue?`
      ]}
      />
  </Segment>
)

ThingNotFound.propTypes = {
  type: PropTypes.string.isRequired,     // E.g  "User". Should be UpperFirstChar.
  id:   PropTypes.string                 // e.g a98uqeihuca. Optional.
}

export default ThingNotFound