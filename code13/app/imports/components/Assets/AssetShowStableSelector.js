import React from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import {AssetKinds, AssetKindKeys} from '../../schemas/assets';


export default class AssetShowStableSelector extends React.Component {
  // propTypes:{
  //   showStableFlag: React.PropTypes.bool,            // If set, show only Stable assets
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

  
  handleChangeFlagClick(event, clue)
  {
    return this.props.handleChangeFlag( !this.props.showStableFlag )
  }

  render() {
    let stable = this.props.showStableFlag
    return (
            <a className={"ui " + (stable ? "green button" : "button")} 
                data-value="showStable"
                onClick={this.handleChangeFlagClick.bind(this)}
                data-position="bottom center"
                data-title="Show/hide unstable assets"
                data-content={ stable ? 
                                        "Click here to show both 'stable' and 'unstable' assets" 
                                      : "Click here to only show stable assets"}>
              <i className="checkmark icon"></i>
            </a>
    );
  }

}
