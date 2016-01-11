import React, { PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../../Icons/Icon.js';

@reactMixin.decorate(History)
export default class EditGraphic extends React.Component {
  static PropTypes = {
    asset: PropTypes.object
  }


  render() {

    let asset = this.props.asset;

    return (
      <div className="ui segment inverted">
        <p>Edit {asset.kind} '{asset.name}' BABY</p>
        <div className="ui segments">
          <div className="ui segment">
            <p>The</p>
          </div>
          <div className="ui red segment">
            <p>Fancy</p>
          </div>
          <div className="ui blue segment">
            <p>Editor</p>
          </div>
          <div className="ui green segment">
            <p>Will</p>
          </div>
          <div className="ui yellow segment">
            <p>Go</p>
          </div>
          <div className="ui orange segment">
            <p>Here</p>
          </div>
        </div>
      </div>
    )
  }
}
