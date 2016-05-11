import React, { PropTypes } from 'react';

export default AssetActivityDetail = React.createClass({

  propTypes: {
    assetId: PropTypes.string.isRequired,        
    activities: PropTypes.array,                // Can be empty while being loaded          
    currUser: PropTypes.object                  // currently Logged In user (not always provided)
  },
  
  render() {
    // A list of ActivitySnapshots provided via getMeteorData(), including one by ourself probably
    let { activities } = this.props;
    if (!activities)
      return null;
      
    var currUserId = this.props.currUser ? this.props.currUser._id : "BY_SESSION:" + Meteor.default_connection._lastSessionId
    let othersActivities =  _.filter(activities, a => currUserId !== a.byUserId)                            
    let viewers = _.map(othersActivities, a => { 
      let detail2 = ""
      if (a.toAssetKind === "code")
        detail2 = ` at line ${a.passiveAction.position.line+1}`
      else if (a.toAssetKind === "graphic")
        detail2 = ` at frame #${a.passiveAction.selectedFrameIdx+1}`
      
      return <a className="item" key={a._id}>
              {a.byUserName}{detail2}
              </a>
    })
    
    let viewersCount = viewers.length   // Note this excludes ourselves

    return (
          <div className="ui compact menu">
            <div className="ui simple dropdown item">
              <i className="icon users"></i> Viewers<i className="dropdown icon"></i>
              <div className={"floating ui " + (viewersCount ? "orange" : "grey") +  " label"}>
                { viewersCount }
              </div>
              <div className="menu">
              { viewers }
              </div>
            </div>
          </div>
      );
  }

  
})