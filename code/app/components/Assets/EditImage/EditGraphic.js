import React, { PropTypes } from 'react';
import reactMixin from 'react-mixin';
import {History} from 'react-router';
import Icon from '../../Icons/Icon.js';

@reactMixin.decorate(History)
export default class EditGraphic extends React.Component {
  static PropTypes = {
    asset: PropTypes.object
  }


  componentDidMount() {
    $(this.refs.mySidebar).sidebar( {
      transition: 'push',
      context: $(this.refs.parentOfSidebar)
    });

}

  handleToggleSidebar()
  {
    debugger;
    $(this.refs.mySidebar).sidebar('toggle');
  }


  render() {

    let asset = this.props.asset;

    return (
      <div>
      <div ref="parentOfSidebar" className="ui segment inverted">
          <p onClick={this.handleToggleSidebar.bind(this)}>
            <i className="home icon"/>
            Edit {asset.kind} '{asset.name}'
          </p>

          <div ref="mySidebar" className="ui left vertical inverted icon labeled very  thin sidebar menu visible">
            <a className="item">
              <i className="home icon"></i>
              Home
            </a>
            <a className="item">
              <i className="block layout icon"></i>
              Shape
            </a>
            <a className="item">
              <i className="smile icon"></i>
              Stamps
            </a>
          </div>

          <div className="ui segments pushable">
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
      </div>
    )
  }
}
