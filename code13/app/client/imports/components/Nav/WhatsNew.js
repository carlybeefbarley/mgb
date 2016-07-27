import _ from 'lodash';
import React, {PropTypes} from 'react';
import mgbReleaseInfo from './mgbReleaseInfo.js';
import QLink from "/client/imports/routes/QLink";

// Would be nice to do something like http://thejoyofux.tumblr.com/post/85707480676/the-wolf-of-trello-presenting-rew-features-in-a


export default WhatsNew = React.createClass({

  propTypes: {
    currUser:       PropTypes.object,                 // Can be null (if user is not logged in)
    asHidingLink:   PropTypes.bool                    // If true then render as null or <Qlink> depending on last seen
  },  
  
  latestRelTimestamp: function()
  {
    return mgbReleaseInfo.releases[0].timestamp
  },

  render: function() 
  {
    const u = this.props.currUser  
    const laterNewsAvailable = u && u.profile && u.profile.latestNewsTimestampSeen !== this.latestRelTimestamp()
    const hilite = laterNewsAvailable ? "yellow" : ""
    const iconEl = <i className={hilite + " announcement icon"}></i>

    if (this.props.asHidingLink)
      return laterNewsAvailable && 
        <QLink  to="/whatsnew" 
                title="Announcements of new features/fixes to MGBv2" 
                className="fitted item" 
                style={{paddingLeft: "16px", marginTop: "6px"}}>
          <i className={"circular inverted yellow announcement icon"}></i>
        </QLink>

    return iconEl
  }
})