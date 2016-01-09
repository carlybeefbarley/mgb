import React, { PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../../Icons/Icon.js';
import styles from '../assetCard.css';

@reactMixin.decorate(History)
export default class EditImage extends React.Component {
  static PropTypes = {
    asset: PropTypes.object
  }


  render() {

    let asset = this.props.asset;

    return <div>
      <p>Edit {asset.kind} '{asset.name}' BABY</p>
      <div class="ui segments">
        <div class="ui segment">
          <p>Top</p>
        </div>
        <div class="ui red segment">
          <p>Middle</p>
        </div>
        <div class="ui blue segment">
          <p>Middle</p>
        </div>
        <div class="ui green segment">
          <p>Middle</p>
        </div>
        <div class="ui yellow segment">
          <p>Bottom</p>
        </div>
      </div>
      </div>
  }
}
