import React, { PropTypes } from 'react'

import style from './FlexPanel.css'

export default fpSuperAdmin = React.createClass({

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px".
  },

  render: function () {

    return (
      <div>
        <h3 style={{marginTop: 0, marginBottom: 20}}>
          Slimy's quests
          <div className="ui label large right floated" style={{float: 'right', opacity: '0.75'}}>19 / 114&nbsp;&nbsp;<i className="check circle icon" style={{marginRight: 0}} /></div>
        </h3>
        <p style={{fontSize: '1.25em'}}>
          <img src="/images/mascots/slimy.png" style={{maxWidth: 70, float: 'left', marginRight: 15}} />
          <span style={{position: 'relative', top: 0}}>Let's figure out how to show an animated sprite in Phaser!</span>
        </p>
        <div className="ui card complete" style={{opacity: 0.5}}>
          <div className="content">
            <i className="green right floated checkmark icon" />
            <div className="header" style={{marginBottom: 0}}>Load an image</div>
          </div>
        </div>
        <div className="ui card course">
          <div className="content">
            <i className="right floated code icon" />
            <div className="header">Display an image</div>
            <div className="description">
              <ol className="ui list">
                <li className="complete">Load an image</li>
                <li className="active">Create a sprite</li>
              </ol>
              <button className="ui active yellow button">
                <i className="student icon"></i>
                Show me
              </button>
            </div>
          </div>
          <div className="extra content">
            <div className="ui tiny green progress" data-percent={50} style={{marginBottom: 0}}>
              <div className="bar" />
            </div>
          </div>
        </div>
        <div className="ui link card">
          <div className="content">
            <i className="right floated paint brush icon" />
            <div className="header">Draw an animated sprite</div>
          </div>
        </div>
        <div className="ui link card">
          <div className="content">
            <i className="right floated code icon" />
            <div className="header">Load an animated sprite</div>
          </div>
        </div>
        <div className="ui link card">
          <div className="content">
            <i className="right floated paint brush icon" />
            <div className="header">Draw an animated sprite</div>
          </div>
        </div>
        <button className="ui button large fluid"><i className="refresh icon" />Get more tasks</button>
      </div>
    )
  }
})
