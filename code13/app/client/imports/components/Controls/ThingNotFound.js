import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import Helmet from 'react-helmet'
import { Segment, Message } from 'semantic-ui-react'

const ThingNotFound = ({ type, id, defaultHead }) => (
  <Segment padded>
    {defaultHead && <Helmet title={`MGB: ${type} not found`} meta={[{ name: `MGB`, content: type }]} />}
    <Message
      error
      icon="broken chain"
      header={`${type} not found`}
      list={[
        _.compact([type, id, 'does not exist. Weird...']).join(' '),
        `Maybe it was deleted?`,
        `Names and Ids in URLs are case-sensitive - maybe that's the issue?`,
      ]}
    />
  </Segment>
)

ThingNotFound.propTypes = {
  defaultHead: PropTypes.bool, // if true, provide a default <head> tag (we use react-helmet)
  type: PropTypes.string.isRequired, // E.g  "User". Should be UpperFirstChar.
  id: PropTypes.string, // e.g a98uqeihuca. Optional.
}

export default ThingNotFound
