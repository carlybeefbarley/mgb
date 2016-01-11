import React, { PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../../Icons/Icon.js';

@reactMixin.decorate(History)
export default class EditUnknown extends React.Component {

  static PropTypes = {
    asset: PropTypes.object
  }

  render() {
    return <a className="ui red label">Unrecognised Asset type '{this.props.asset.kind}' - unable to edit</a>
  }
}
