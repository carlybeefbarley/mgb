import _ from 'lodash';
import React, { PropTypes } from 'react';

import style from './FlexPanel_Z2.css'

export default fpSuperAdmin = React.createClass({

  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px".
  },

  render: function () {
    const linkLi = (txt, url) => (<li><a target="_blank" href={url}>{txt}</a></li>)

    return (
      <div>
      <h3>Current goal</h3>
      <div className="ui card course">
        <div className="content">
          <i className="right floated code icon"></i>
          <div className="header">Display an image</div>
          <div className="description">
            <ol className="ui list">
              <li className="complete">Load an image using the asset selector</li>
              <li className="active">Create a sprite using the image</li>
            </ol>
            <button className="ui button">
              <i className="code icon"></i>
              View documentation
            </button>
          </div>
        </div>
        <div className="extra content">
          <div className="ui tiny green progress" data-percent="50" style={{marginBottom: "0"}}>
            <div className="bar"></div>
          </div>
        </div>
      </div>
      </div>
    )
  },


  getFlipsideUrl() {
    const l = window.location
    const newHost = l.host.startsWith("localhost") ? "https://v2.mygamebuilder.com" : "http://localhost:3000"
    return `${newHost}${l.pathname}${l.search}`
  }
})
