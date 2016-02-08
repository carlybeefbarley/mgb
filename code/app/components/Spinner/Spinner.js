import React, { Component } from 'react';

export default class Spinner extends Component {

  render() {
    return (

      <div className="ui padded segment">
        <div className="horizontal divider"></div>
        <div className="ui active" style={{minHeight: "300px"}}>
          <div className="ui indeterminate text loader"></div>
        </div>
        <p></p>
      </div>
    );
  }
}
