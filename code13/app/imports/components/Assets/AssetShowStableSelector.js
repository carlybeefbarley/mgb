import React from 'react';
import ReactDOM from 'react-dom';


export default class AssetShowStableSelector extends React.Component {
  // propTypes:{
  //   showStableFlag: React.PropTypes.string,           // "1"" or "0". If "1", show only stable assets
  //   handleChangeFlag: React.PropTypes.func            // params = newShowStableFlag
  //   }

  constructor(props) {
    super(props);
  }
  
  // React Callback: componentDidMount()
  componentDidMount() {
    this.activateToolPopups();
  }

  activateToolPopups() {
    // See http://semantic-ui.com/modules/popup.html#/usage
    let $a = $(ReactDOM.findDOMNode(this))
    $a.popup()    // No need to look for class since it's the outer element
  }

  
  handleChangeFlagClick()
  {
    // Flip between "0" and "1"
    return this.props.handleChangeFlag( this.props.showStableFlag === "1" ? "0" : "1" )
  }

  render() {
    let active = this.props.showStableFlag === "1"
    return (
            <a className={"ui " + (active ? "green button" : "button")} 
                data-value="showStable"
                onClick={this.handleChangeFlagClick.bind(this)}
                data-position="bottom center"
                data-title="Show/hide unstable assets"
                data-content={ active ? 
                                        "Click here to show both 'stable' and 'unstable' assets" 
                                      : "Click here to only show stable assets"}>
              <i className="checkmark icon"></i>
            </a>
    );
  }

}
