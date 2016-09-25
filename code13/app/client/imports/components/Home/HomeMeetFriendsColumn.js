import React, { PropTypes, Component } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'

import QLink from '/client/imports/routes/QLink'

const _propTypes = {
}

const _hdrSpaceBelowSty = {marginBottom: "1em"}

const HomeMeetFriendsColumn = () => (
  <div className="column">
    <h2 style={_hdrSpaceBelowSty}>Meet creative friends</h2>
    <div className="ui very relaxed list">
      <div className="item">
        <img className="ui image avatar middle aligned" style={{ height: 60, width: 60 }} src="http://semantic-ui.com/images/avatar/small/helen.jpg" />
        <div className="content middle aligned" style={{ marginLeft: '1em' }}>
          <h3>azurehaze</h3>
          <p><i className="trophy icon" />10 badges</p>
        </div>
      </div>
      <div className="item">
        <img className="ui image avatar middle aligned" style={{ height: 60, width: 60 }} src="http://semantic-ui.com/images/avatar/small/daniel.jpg" />
        <div className="content middle aligned" style={{ marginLeft: '1em' }}>
          <h3>bossmaker</h3>
          <p><i className="trophy icon" />9 badges</p>
        </div>
      </div>
      <div className="item">
        <img className="ui image avatar middle aligned" style={{ height: 60, width: 60 }} src="http://semantic-ui.com/images/avatar/small/christian.jpg" />
        <div className="tiny content middle aligned" style={{ marginLeft: '1em' }}>
          <h3>uggy</h3>
          <p><i className="trophy icon" />6 badges</p>
        </div>
      </div>
    </div>
    <br />
    <QLink to={`/users`}>
      <button className="ui black large button">See more creators</button>
    </QLink>
  </div>
)

HomeMeetFriendsColumn.propTypes = _propTypes
export default HomeMeetFriendsColumn