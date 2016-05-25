import React, {Component, PropTypes} from 'react';
import moment from 'moment';
import mgbReleaseInfo from './mgbReleaseInfo.js';

// Would be nice to do something like http://thejoyofux.tumblr.com/post/85707480676/the-wolf-of-trello-presenting-rew-features-in-a


export default WhatsNew = React.createClass({

  propTypes: {
    user: PropTypes.object,                 // Can be null 
    userSawNewsHandler: PropTypes.func      // Can be null
  },
  
  
  /** React callback - before render() is called */
  getInitialState: function() {
    return {
      releaseIdx: 0,       // Index into mgbReleaseInfo[] for currently viewed release
      changeIdx: 0         // Index into mgbReleaseInfo[] for currently viewed release
    }
  },
  
  
  latestRelTimestamp: function()
  {
    return mgbReleaseInfo.releases[0].timestamp
  },
  
  
  /** React callback - after render() first called */
  componentDidMount: function ()
  {
    $('.idea.icon')
      .popup({
        inline   : true,
        position : 'bottom left',
        on: "click",
        offset: -12,
        onVisible: (m,p) => { 
          this.props.userSawNewsHandler && this.props.userSawNewsHandler(this.latestRelTimestamp())
        }
      })
    ;
  },
  
  
  render: function() 
  {
    const popupStyle={
      top: "50px", 
      left: "1px", 
      bottom: "auto", 
      right: "auto", 
      minWidth: "734px", 
      minHeight: "200px",
      backgroundColor: "#ffffe0" 
    }
    const u = this.props.user  
    const hilite = ( u && u.profile && u.profile.latestNewsTimestampSeen !== this.latestRelTimestamp() )
                   ? "yellow" : ""

    return (
      <div className="ui item" key="dropdown">
        <i className={hilite + " idea icon"}></i>
        <div className="ui fluid popup transition hidden" style={popupStyle}>
          { this.renderNewsPopupStructure() }
        </div>
      </div>
    )
  },
  
  
  // Some sub-functions to render various bits of this control. 
  // They are called (directly, or indirectly) by render() above
  // They use   state.releaseIdx   to know what is being selected
  
  /** The 3 column structure for update info */  
  renderNewsPopupStructure: function() {
    return <div className="ui three column relaxed equal height divided grid">
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
                return  <div className="item" key={r.timestamp} style={sty} onClick={this.handleReleaseClicked.bind(this, idx)}>
                          <div className="content">
                            MGB2 v{r.id.ver} <small>{r.id.state + "#" + r.id.iteration}</small>
                          </div>
                        </div>
              })
              }

            </div>
  },
  
  
  handleReleaseClicked: function (releaseIdx)
  {
    this.setState( { "releaseIdx": releaseIdx} )
  },
  
  
  /** ct is a string from mgbReleaseInfo.releases[].changes[].type */
  getIconForChangeType: function(ct) {
    const iconNames = 
      { 
        "feature":     "green plus",
        "improvement": "grey plus",
        "bugfix":      "red bug" 
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
  },
  
  
  handleChangeClicked: function (changeIdx)
  {
    this.setState( { "changeIdx": changeIdx} )
  } 
  
})