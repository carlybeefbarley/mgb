import React, { PropTypes } from 'react'

import sty from  './dashboard.css'

import DashboardCreate from './DashboardCreate'
import DashboardSocial from './DashboardSocial'

// console.log(assetViewChoices, defaultAssetViewChoice)


class DashboardUI extends React.Component {

  static propTypes = {
    currUser:   PropTypes.object,
    assets:     PropTypes.array,
    loading:    PropTypes.bool.isRequired
  }

  static contextTypes = {
    skills:       PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
  }

  // TODO
  // trending stuff on the right
  // competition
  // if color is on palette, then don't do anything
  // top/hot/recommended games, watch people making games live, dailies, competitions
  // people who need help

  render () {

    // Note - can get skills via     this.context.skills

    return (
      <DashboardSocial/>
    )
  }
}

export default DashboardUI