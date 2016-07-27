import _ from 'lodash';
import React, { PropTypes } from 'react';

export default class EditUnknown extends React.Component {

  // static PropTypes = {
  //   asset: PropTypes.object
  // }

  render() {

    let asset = this.props.asset;

    return (
      <div className="ui segment inverted">
        <p>Edit {asset.kind} '{asset.name}'</p>
        <a className="ui red label">Editor for Asset type '{this.props.asset.kind}' is not yet implemented</a>
      </div>
  );
  }
}
