import React, { Component, PropTypes } from 'react';
import ReactDOM  from 'react-dom';
import reactMixin from 'react-mixin';
import {AssetKinds, AssetKindKeys} from '../../schemas/assets';

export default class AssetKindChooser extends React.Component {

  static PropTypes = {
    allowMultiselect: PropTypes.bool
  }

  componentDidMount() {
    let selector = ReactDOM.findDOMNode(this.refs.mySelect);
    $(selector).dropdown();                   // Semantic-ui
  }

  render() {
    let options = AssetKindKeys.map((k) => {
      return <div className="item" data-value={k} key={k}>{AssetKinds[k].name}</div>
    });
    return (
      <div>
        <label htmlFor={ this.props.name } title="Asset Kind" >
          Asset Kind
        </label>

        <div ref="mySelect" className="ui dropdown fluid search multiple">
          <input type="hidden" name="gender"></input>
          <i className="dropdown icon"></i>
          <div className="default text">Asset Kind</div>
          <div className="menu">
            {options}
          </div>
        </div>
      </div>
    );
  }
}
