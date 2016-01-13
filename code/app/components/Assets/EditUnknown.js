import React, { PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {History} from 'react-router';

@reactMixin.decorate(History)
export default class EditUnknown extends React.Component {

  static PropTypes = {
    asset: PropTypes.object
  }

  render() {

    let asset = this.props.asset;

    return (
      <div className="ui segment inverted">
        <p>Edit {asset.kind} '{asset.name}' BABY</p>
        <a className="ui red label">Unrecognised Asset type '{this.props.asset.kind}' - unable to edit</a>
      </div>
  );
  }
}
