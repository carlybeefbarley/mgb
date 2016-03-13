import React from 'react';
import {Link} from 'react-router';

export default class AssetUrlGenerator extends React.Component {
  propTypes:{
    urlOptions: React.PropTypes.array     // array of { msg: ___, url: ___}
    }

  static defaultProps = {
    defaultName: 'Name...',
  };

  constructor(props) {
    super(props);
  }

  render() {
    // Build the list of 'Create New Asset' Menu choices
    let choices = this.props.urlOptions.map((opt) => {
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
  }

  handleAssetUrlClick(opt)
  {
  }
}
