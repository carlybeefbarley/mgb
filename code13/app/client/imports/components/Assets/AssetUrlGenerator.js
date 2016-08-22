import _ from 'lodash';
import React, {PropTypes} from 'react';
import {Link} from 'react-router';

export default AssetUrlGenerator = React.createClass({
  propTypes: {
    asset: PropTypes.object
  },
    
  //             <AssetUrlGenerator urlOptions={ [ { "msg":"PNG", "url":"/api/asset/png/"+this.props.asset._id } ] } />


  // These should match what is in RestApi.addRoute() calls
  generateUrlOptions: function(asset)
  {
    let retval = []
    switch (asset.kind) {
      case 'graphic':
        retval.push( { "msg":"PNG by ID", "url":"/api/asset/png/"+asset._id } )
        break;
      case 'code':
        retval.push( { "msg":"code by ID", "url":"/api/asset/code/"+asset._id } )
        break;
      case 'map':
        retval.push( { "msg":"map by ID", "url":"/api/asset/json/"+asset._id })
        break;
      case 'sound':
        retval.push( { "msg":"sound by ID", "url":"/api/asset/sound/"+asset._id+"/sound.mp3" })
        break;
      case 'music':
        retval.push( { "msg":"music by ID", "url":"/api/asset/music/"+asset._id+"/music.mp3" })
        break;
      default:
        break;
    }
    return retval
  },


  render: function() {
    // Build the list of 'Create New Asset' Menu choices
    let urlOptions = this.generateUrlOptions(this.props.asset)
    
    let choices = urlOptions.map((opt) => {
      return   <a className="item" href={opt.url} target="_blank" data-value={opt.url} key={opt.msg} onClick={this.handleAssetUrlClick.bind(this,opt)}>
                 {opt.msg} link: {opt.url}
               </a>
    });

    // Create the       | Download | ---- |    UI
    return (
        <div className="ui simple dropdown item">
          <i className="cloud download icon"></i>
          <div className="menu">
            {choices}
          </div>
        </div>
    );
  },

  handleAssetUrlClick(opt)
  {
  }
})
