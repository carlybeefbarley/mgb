import React, { Component } from 'react';

export default class Spinner extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hiddenInitially: true               // Used for delayed display
    }
  }

  componentDidMount()
  {
    // Spinner will show after half a second, so it flickers less in most cases
    setTimeout( () => { this.setState( {hiddenInitially: false})}, 500)
  }

  render() {
    return (
      <div className="ui segment" style={{minHeight: "15em"}}>
        <div className={`ui ${this.state.hiddenInitially ? "" : "active"} inverted dimmer`} >
          <div className="ui text indeterminate loader">Loading</div>
        </div>
        <p></p>
      </div>
    );
  }
}
