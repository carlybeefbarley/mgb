import React from 'react';
import ReactDOM from 'react-dom';
import {Link} from 'react-router';
import {AssetKinds, AssetKindKeys} from '../../schemas/assets';


export default class AssetShowDeletedSelector extends React.Component {
  propTypes:{
    showDeletedFlag: React.PropTypes.bool,            // If set, show only deleted assets
//    showPurgedFlag: React.PropTypes.bool,           // TODO: Probably only for super-admin. 
    handleChangeFlag: React.PropTypes.func            // params = newShowDeletedFlag
    }

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
    return this.props.handleChangeFlag( !this.props.showDeletedFlag )
  }

  render() {
    return (
            <a className={"ui " + (this.props.showDeletedFlag ? "red button" : "button")} 
                data-value="showDeleted"
                onClick={this.handleChangeFlagClick.bind(this)}
                data-position="bottom center"
                data-title="Show/hide deleted assets"
                data-content="Click here to show/hide assets that have been deleted">
              <i className="trash icon"></i>
            </a>
    );
  }

}
