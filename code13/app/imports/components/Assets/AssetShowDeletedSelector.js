import React from 'react';

export default class AssetShowDeletedSelector extends React.Component {
//   propTypes:{
//     showDeletedFlag: React.PropTypes.string,          // "1"" or "0". If "1", show only deleted assets
// //    showPurgedFlag: React.PropTypes.bool,           // TODO: Probably only for super-admin. 
//     handleChangeFlag: React.PropTypes.func            // params = newShowDeletedFlag
//     }

  constructor(props) {
    super(props);
  }
  
  // React Callback: componentDidMount()
  componentDidMount() {
    $(".assetShowDeletedPopup").popup()
  }

  componentWillUnmount() {
    $(".assetShowDeletedPopup").popup('destroy')
  }

  handleChangeFlagClick()
  {
    // Flip between "0" and "1"
    return this.props.handleChangeFlag( this.props.showDeletedFlag === "1" ? "0" : "1" )
  }

  render() {
    let active = this.props.showDeletedFlag === "1"

    return (
            <a className={"assetShowDeletedPopup ui " + (active ? "red button" : "button")} 
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
