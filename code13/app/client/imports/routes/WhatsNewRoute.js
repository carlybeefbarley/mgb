import _ from 'lodash';
import React, {PropTypes} from 'react';
import QLink from './QLink';
import Footer from '/client/imports/components/Footer/Footer';
import mgbReleaseInfo from '/client/imports/components/Nav/mgbReleaseInfo';
import moment from 'moment';

export default WhatsNewRoute = React.createClass({

  propTypes: {
    currUser: PropTypes.object,                 // Can be null (if user is not logged in)
  },
  
  /** React callback - before render() is called */
  getInitialState: function() {
    return {
      releaseIdx: 0       // Index into mgbReleaseInfo[] for currently viewed release
    }
  },

  componentDidMount: function() {
    this.handleUserSawNews(this.latestRelTimestamp())
  },
  
  /** This is called when the WhatsNew popup has been clicked and shown. 
   *  We are to note the current timestamp of the latest release in the user profile 
   */
  handleUserSawNews: function(latestNewsTimestampSeen)
  {
    let currUser = this.props.currUser
    if (currUser && currUser.profile.latestNewsTimestampSeen !== latestNewsTimestampSeen)
    {      
      Meteor.call('User.updateProfile', currUser._id, {
        "profile.latestNewsTimestampSeen": latestNewsTimestampSeen
      }, (error) => {
        if (error)
          console.log("Could not update profile with What's New timestamp")      
      });      
      
    }
  },
  
  
  latestRelTimestamp: function()
  {
    return mgbReleaseInfo.releases[0].timestamp
  },
  

  handleReleaseClicked: function (releaseIdx)
  {
    this.setState( { "releaseIdx": releaseIdx} )
  },

  headerMessage: (
    <div className="ui raised padded segment">
      <div className="ui header">My Game Builder v2 is ALPHA and in active development</div>
      <div className="ui meta">
        <p>
          You are very welcome to use this new MyGameBuilder site and give us feedback 
          using the <i className="chat icon" />chat panel on the right hand side of the screen
        </p>
        <ul>
          <li>The Graphic, Map and Code asset types are quite stable and can be used safely</li>
          <li>The Sound, Music and Doc assets are highly experimental currently</li>
          <li>For best results, use Google's Chrome browser. Some features like Audio are buggy on other browsers currently</li>
        </ul>
        <p title="However, if you want to help us get the word out when we are ready, message us in Chat!">
          Please do NOT post this v2.mygamebuilder.com link to news sites like 
          Facebook/ProductHunt/Reddit/SlashDot/HackerNews etc. - we aren't ready for prime time yet!
        </p>
        <p>
          See what's coming soon in our <QLink to="/roadmap">feature roadmap</QLink>.
        </p>
      </div>
    </div>
  ),

  render: function() {
    return (
      <div>
        <div className="ui basic segment">
          <div className="ui container">
            <h2 className="ui header"><i className="announcement icon" />What's New</h2>
            { this.headerMessage }
            { this.renderNews() }
          </div>
        </div>
        <Footer />
      </div>
    )
  },


  // Some sub-functions to render various bits of this control. 
  // They are called (directly, or indirectly) by render() above
  // They use   state.releaseIdx   to know what is being selected
  
  /** This renders the 2 column structure for update info */  
  renderNews: function() {
    const { releaseIdx } = this.state
    const rel = mgbReleaseInfo.releases[releaseIdx]
    const state = rel.id.state === 'alpha' ? 'α' : (rel.id.state + "#")
    const ago = moment(new Date(rel.timestamp)).fromNow() 

    return (
      <div className="ui padded two column relaxed equal height divided grid">
        <div className="column">
          <h4 className="ui header">MGBv2 updates</h4>
          { this.renderNewsMgbVersionsColumn() }
        </div>
        <div className="column">
          <h4 className="ui header">
            Changes in v{rel.id.ver}&nbsp;&nbsp;&nbsp;<small><i>{state + rel.id.iteration}</i>&emsp;{ago}</small>
          </h4>
          { this.renderNewsRelChangesColumn() }
        </div>
      </div>
    )
  },
  

  /** This is the left column. Uses React's state.releaseIdx */
  renderNewsMgbVersionsColumn: function() {
    const rels = mgbReleaseInfo.releases
    const activeRelIdx = this.state.releaseIdx
    const gry = {color: "#888"}
    const blk = {color: "#000"}

    return  (
      <div className="ui list">
        { rels.map( (r, idx) =>  {
          const sty = (activeRelIdx === idx) ? blk : gry
          const ago = moment(new Date(r.timestamp)).fromNow() 
          const state = r.id.state === 'alpha' ? 'α' : (r.id.state + "#")
          return (
            <div className="item" key={r.timestamp} style={sty} onClick={this.handleReleaseClicked.bind(this, idx)}>
              <div className="content">
                v{r.id.ver}&nbsp;&nbsp;&nbsp;<small><i>{state + r.id.iteration}</i></small>
                <div className="right floated meta"><small>{ago}</small></div>
              </div>
            </div>
          )
        })
        }
      </div>
    )
  },
  
  
  /** ct is a string from mgbReleaseInfo.releases[].changes[].type */
  getIconForChangeType: function(ct) {
    const iconNames = 
      { 
        "feature":     "green plus",
        "improvement": "grey plus",
        "bugfix":      "red bug", 
        "removed":     "red remove" 
      }

    return <i className={"ui icon " + iconNames[ct]}></i>
  },

  
  /** This is the right column. Uses React's state.releaseIdx */
  renderNewsRelChangesColumn: function() {
    const relIdx = this.state.releaseIdx
    const rel = mgbReleaseInfo.releases[relIdx]
    
    return  (
      <div className="ui icon items">
        { rel.changes.map( (c, idx) => {
          return (
            <div className="ui icon item" key={c.changeName} >
              { this.getIconForChangeType(c.type) }
              <div className="content">
                <div className="header"><small>{c.changeName}</small></div>
                <div className="meta">
                  <p>{ c.changeSummary }</p>
                  { c.otherUrls && c.otherUrls.length && c.otherUrls.length > 0 ?  
                    (
                      <ul>
                      { c.otherUrls.map( (u, idx) => (<li><a href={u.href} key={idx} target="_blank">{u.txt}</a></li>) )
                      }
                    </ul>
                    ) : null
                  }
                </div>
              </div>
            </div>
          )
        })
        }
      </div>
    )
  }
})