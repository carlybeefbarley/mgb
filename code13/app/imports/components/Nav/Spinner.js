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
    // Spinner will show after 400ms, so it flickers less in most cases
    this.spinnerTimeoutId = setTimeout( () => { this.setState( {hiddenInitially: false})}, 400)
  }

  componentWillUnmount()
  {
    if (this.spinnerTimeoutId)
      clearTimeout(this.spinnerTimeoutId)
  }

  render() {
    const hide = this.state.hiddenInitially
    return ( hide ? null :  
      <div className="ui basic segment" style={{minHeight: "15em"}}>
        <div className={`ui ${hide ? "" : "active"} inverted dimmer`} >
          <div className="ui text indeterminate loader">Loading</div>
        </div>
        <p></p>
      </div>
    );
  }
}