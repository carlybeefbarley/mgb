import React, { PropTypes } from 'react';

import EditGraphic from './EditGraphic/EditGraphic.js';
import EditCode from './EditCode/EditCode.js';
import EditMap from './EditMap/EditMap.js';
import EditUnknown from './EditUnknown.js';

import {logActivity} from '../../schemas/activity';


export default class AssetEdit extends React.Component {
  // static PropTypes = {
  //   asset: PropTypes.object.isRequired
  //   canEdit" PropTypes.bool.isRequired
  //   currUser: PropTypes.object,
  //   editDeniedReminder: PropTypes.function
  //   activitySnapshots: PropTypes.array               // can be null whilst loading
  // }

  constructor(props) {
    super(props);
  }
  

  getEditorForAsset(asset) {
    switch (asset.kind) {
    case 'graphic':
      return <EditGraphic
                asset={asset}
                canEdit={this.props.canEdit}
                currUser={this.props.currUser}
                editDeniedReminder={this.props.editDeniedReminder}
                handleContentChange={this.handleContentChange.bind(this) }
                activitySnapshots={this.props.activitySnapshots}
                />
    case 'code':
      return <EditCode 
                asset={asset} 
                canEdit={this.props.canEdit}
                currUser={this.props.currUser}
                editDeniedReminder={this.props.editDeniedReminder}
                handleContentChange={this.handleContentChange.bind(this)}
                activitySnapshots={this.props.activitySnapshots}

                />
    case 'map':
      return <EditMap 
                asset={asset} 
                canEdit={this.props.canEdit}
                currUser={this.props.currUser}
                editDeniedReminder={this.props.editDeniedReminder}
                handleContentChange={this.handleContentChange.bind(this)}
                activitySnapshots={this.props.activitySnapshots}
                />
    default:
      return (<EditUnknown asset={asset}/>);
    }
  }

  handleContentChange(content2Object, thumbnail, changeText="content change")
  {
    let asset = this.props.asset;

    Meteor.call('Azzets.update', asset._id, this.props.canEdit, {content2: content2Object, thumbnail: thumbnail}, (err, res) => {
      if (err) {
        alert('error: ' + err.reason)
      }
    });
    
    logActivity("asset.edit", changeText, null, this.props.asset);
  }

  render() {
    if (!this.props.asset) 
      return <div>loading...</div>;

    let asset = this.props.asset;

    return this.getEditorForAsset(asset)
  }

}
