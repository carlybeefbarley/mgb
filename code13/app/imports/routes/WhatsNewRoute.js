import React, {PropTypes} from 'react';
import QLink from './QLink';
import Footer from '../components/Footer/Footer';
import mgbReleaseInfo from '../components/Nav/mgbReleaseInfo';
import moment from 'moment';

export default WhatsNewRoute = React.createClass({

  propTypes: {
    currUser: PropTypes.object,                 // Can be null (if user is not logged in)
  },
  
  /** React callback - before render() is called */
  getInitialState: function() {
    return {
      releaseIdx: 0,       // Index into mgbReleaseInfo[] for currently viewed release
      changeIdx: 0         // Index into mgbReleaseInfo[] for currently viewed release
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
          console.log("Could not update profile with news timestamp")      
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


  handleChangeClicked: function (changeIdx)
  {
    this.setState( { "changeIdx": changeIdx} )
  },

  render: function() {

    return (
      <div>
        <div className="ui basic segment">
          <div className="ui container">
            <div className="ui raised  padded segment">
              <div className="ui header">My Game Builder v2 is currently under development.</div>
              <div className="ui meta">
                The site is unstable and rapidly changing, but you are welcome to use it and give feedback. We aim to be stable in July 2016
              </div>
            </div>
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
  
  /** The 3 column structure for update info */  
  renderNews: function() {
    return <div className="ui padded three column relaxed equal height divided grid">
            <div className="column">
              <h4 className="ui header">MGBv2 updates</h4>
              { this.renderNewsMgbVersionsColumn() }
            </div>
            <div className="column">
              <h4 className="ui header">Changes</h4>
              { this.renderNewsRelChangesColumn() }
            </div>
            <div className="column">
              <h4 className="ui header">Details</h4>
              { this.renderNewsChangeDetailsColumn() }
            </div>          
          </div>
  },
  

  /** This is the left column. Uses React's state.releaseIdx */
  renderNewsMgbVersionsColumn: function() {
    const rels = mgbReleaseInfo.releases
    const activeRelIdx = this.state.releaseIdx
    const gry = {color: "#888"}
    const blk = {color: "#000"}
    

    return  <div className="ui list">
              { rels.map( (r, idx) =>  {
                const sty = (activeRelIdx === idx) ? blk : gry
                const ago = moment(new Date(r.timestamp)).fromNow() 
                const state = r.id.state === 'alpha' ? 'α' : (r.id.state + "#")
                return  <div className="item" key={r.timestamp} style={sty} onClick={this.handleReleaseClicked.bind(this, idx)}>
                          <div className="content">
                            v{r.id.ver}&nbsp;&nbsp;&nbsp;<small><i>{state + r.id.iteration}</i></small>
                            <div className="right floated meta"><small>{ago}</small></div>
                          </div>
                        </div>
              })
              }

            </div>
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

  
  /** This is the mid column. Uses React's state.releaseIdx */
  renderNewsRelChangesColumn: function() {
    const relIdx = this.state.releaseIdx
    const rel = mgbReleaseInfo.releases[relIdx]
    const gry = {color: "#888"}
    const blk = {color: "#000"}    
    
    return  <div className="ui list">
              { rel.changes.map( (c, idx) =>  {
                const sty = (this.state.changeIdx === idx) ? blk : gry
                return  <div className=" item" key={c.changeName} style={sty} onClick={this.handleChangeClicked.bind(this, idx)}>
                          { this.getIconForChangeType(c.type) }
                          <div className="content">
                            {c.changeName} 
                          </div>
                        </div>
              })
              }
            </div>
  },


  
  /** This is the right-hand column. Uses React's state.releaseIdx and state.changeIdx */
  renderNewsChangeDetailsColumn: function() {
    const relIdx = this.state.releaseIdx
    const rel = mgbReleaseInfo.releases[relIdx]
    const chg = rel.changes[this.state.changeIdx]
    
    return <div className="ui content">
            {chg.changeSummary}
          </div>
  }
})