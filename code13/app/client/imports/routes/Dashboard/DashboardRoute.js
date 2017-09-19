import _ from 'lodash'
import React from 'react'
import { Message } from 'semantic-ui-react'
import Dashboard from '/client/imports/components/Dashboard/Dashboard.js'

const DashboardRoute = React.createClass({
  render() {
    return !this.props.currUser ? <Message content="Not logged in" /> : <Dashboard {...this.props} />
  },
})

export default DashboardRoute
