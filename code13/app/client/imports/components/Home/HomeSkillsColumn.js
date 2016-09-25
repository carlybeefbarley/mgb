import React, { PropTypes, Component } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'

import QLink from '/client/imports/routes/QLink'

const _propTypes = {
  userId:   PropTypes.string       // Can be null/undefined. It is used to indicate if anyone is logged in
}

const _hdrSpaceBelowSty = {marginBottom: "1em"}

const HomeSkillsColumn = (props) => (
  <div className="column">
    <h2 style={_hdrSpaceBelowSty}>Grow your <em>real</em> skill tree</h2>
    <div className="ui very relaxed list">
      <div className="item">
        <i className="code large icon" />
        <div className="content">
          <h3>Programming</h3>
        </div>
      </div>
      <div className="item">
        <i className="paint brush large icon" />
        <div className="content">
          <h3>Pixel art</h3>
        </div>
      </div>
      <div className="item">
        <i className="music large icon" />
        <div className="content">
          <h3>Music &amp; audio</h3>
        </div>
      </div>
      <div className="item">
        <i className="idea large icon" />
        <div className="content">
          <h3>Game design</h3>
        </div>
      </div>
      <div className="item">
        <i className="write large icon" />
        <div className="content">
          <h3>Story writing</h3>
        </div>
      </div>
      <div className="item">
        <i className="area chart large icon" />
        <div className="content">
          <h3>Analytics</h3>
        </div>
      </div>
    </div>
    <br />
    <QLink to={`/getstarted`}>
    { props.userId ?
      <button className="ui teal large button">Set skill goals</button>
      :
      <button className="ui teal large button">Build a game</button>
    }
    </QLink>
  </div>
)

HomeSkillsColumn.propTypes = _propTypes
export default HomeSkillsColumn