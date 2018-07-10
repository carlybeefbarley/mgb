import React from 'react'

import DashboardAction from './DashboardAction'

export default class VideoAction extends React.Component {
  render() {
    return (
      <DashboardAction
        color="blue"
        icon="video play"
        header="Videos"
        subheader="Learn tips and tricks of using MyGameBuilder!"
        buttonContent="Watch"
        to="/video"
      />
    )
  }
}
