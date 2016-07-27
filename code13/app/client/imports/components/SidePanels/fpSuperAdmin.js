import _ from 'lodash';
import React, { PropTypes } from 'react';

export default fpSuperAdmin = React.createClass({
  
  propTypes: {
    currUser:               PropTypes.object,             // Currently Logged in user. Can be null/undefined
    user:                   PropTypes.object,             // User object for context we are navigation to in main page. Can be null/undefined. Can be same as currUser, or different user
    panelWidth:             PropTypes.string.isRequired   // Typically something like "200px". 
  },

  render: function () {    
    const linkLi = (txt, url) => (<li><a target="_blank" href={url}>{txt}</a></li>)

    return  <div>
              <div className="ui header">SuperAdmin panel</div>
              <div className="ui sub header">Team Quicklinks</div>
              <ul>
                { linkLi("localhost/v2 flipside", this.getFlipsideUrl()) }
                { linkLi("TrackJs", "https://my.trackjs.com/messages") }
                { linkLi("Galaxy", "https://galaxy.meteor.com/app/v2.mygamebuilder.com") }
                { linkLi("Kadira", "https://ui.kadira.io/apps/e7zK3YN4QZijYhpmY/dashboard/overview") }
                { linkLi("Slack", "https://devlapse.slack.com/messages/mgb-dev") }
                { linkLi("Github", "https://github.com/devlapse/mgb") }
                { linkLi("SemanticUI", "http://semantic-ui.com/") }
                { linkLi("mLab telemetry", "https://mlab.com/realtime-dashboard?server=s-ds021730-a0") }
                { linkLi("mLab cluster", "https://mlab.com/clusters/rs-ds021730") }
                { linkLi("TimeTracker spreadsheet", "https://docs.google.com/spreadsheets/d/1dq1FjxoHfMl49R-dIoxi7kpTZFi6HCHlz78-9QUO-Ds/edit#gid=131993583")}
              </ul>
            </div>
  },


  getFlipsideUrl() {
    const l = window.location
    const newHost = l.host.startsWith("localhost") ? "https://v2.mygamebuilder.com" : "http://localhost:3000"
    return `${newHost}${l.pathname}${l.search}`
  }
})