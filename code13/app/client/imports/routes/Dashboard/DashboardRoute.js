import React from 'react'
import { utilPushTo } from '/client/imports/routes/QLink'
import Dashboard from '/client/imports/components/Dashboard/Dashboard.js'

const DashboardRoute = React.createClass({
  componentWillMount() {
    if (!this.props.currUser) utilPushTo(null, '/')
  },

  render() {
    return <Dashboard {...this.props} />
  },
})

export default DashboardRoute
