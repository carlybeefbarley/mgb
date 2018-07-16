import React from 'react'
import { utilPushTo } from '/client/imports/routes/QLink'
import Dashboard from '/client/imports/components/Dashboard/Dashboard'

export default class DashboardRoute extends React.PureComponent{
  componentWillMount() {
    if (!this.props.currUser) utilPushTo(null, '/')
  }

  render() {
    return <Dashboard {...this.props} />
  }
}
