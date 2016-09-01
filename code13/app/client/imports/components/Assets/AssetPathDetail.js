import React, { PropTypes } from 'react'
import { AssetKinds } from '/imports/schemas/assets'
import validate from '/imports/schemas/validate'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'

  /** This used by  to render something like...
   *      Kind > AssetName
   * @param   a is the Asset (typically from this.data.asset)
   */

export default AssetPathDetail = React.createClass({

  propTypes: {
    canEdit:    PropTypes.bool.isRequired,
    ownerName:  PropTypes.string.isRequired,
    kind:       PropTypes.string.isRequired,
    name:       PropTypes.string,                       // Asset name (can be null)
    text:       PropTypes.string,                       // Asset description text (can be null)
    isUnconfirmedSave: PropTypes.bool,                  // not present == saved.. for legacy data
    hasUnsentSaves:    PropTypes.bool.isRequired,       // if true, then some saves have not yet been sent for this asset, so reflect that in UI (orange label)
    handleNameChange:  PropTypes.func.isRequired,
    handleDescriptionChange: PropTypes.func.isRequired
  },
  

  fieldChanged: function(data) {
    // data = { description: "New validated text comes here" }
    // Update your model from here    
    if (data.name)
      this.props.handleNameChange(data.name)
    if (data.text)
      this.props.handleDescriptionChange(data.text)
  },

  render() {
    const { name, kind, text, ownerName, canEdit, isUnconfirmedSave, hasUnsentSaves } = this.props
    const emptyAssetDescriptionText = "(no description)"
    const untitledAssetString = canEdit ? "(Type asset name here)" : "(untitled)"
    const labelBgColor = hasUnsentSaves ? "orange" : "green"
    const saveIconColor = isUnconfirmedSave ? "orange" : ""

    return (
      <div>
        <div className="ui row">
          {
            canEdit ? 
              (
                <div className={`ui small ${labelBgColor} icon label`} title="You can edit this asset. Your changes will be saved automatically to the server">
                  <i className={`ui ${saveIconColor} save icon`} />Edit
                </div>
              ) 
              : 
              (
                <div className="ui mgbReadOnlyReminder small red icon label" title="You only have read-access to this asset. You cannot make changes to it. (Project-member-write-access & clone-edit are not yet implemented. Sorry!  Soon...)">
                  <i className="ui unhide icon" />View
                </div>
              )        
          }
          &nbsp;&nbsp;
          <QLink to={`/u/${ownerName}/assets`} query={{kinds: kind}}>
            { AssetKinds.getName(kind) }
          </QLink>
          &nbsp;>&nbsp;
          <InlineEdit
            validate={validate.assetName}
            activeClassName="editing"
            text={name || untitledAssetString}
            paramName="name"
            change={this.fieldChanged}
            isDisabled={!canEdit} />            
        </div>
        
        <div className="ui row">
          <small>
            <div className="ui fluid input">
              <InlineEdit
                validate={validate.assetDescription}
                text={(text && text.length > 0) ? text : emptyAssetDescriptionText}
                paramName="text"
                change={this.fieldChanged}
                isDisabled={!canEdit}
                />
            </div>
          </small>
        </div>
      </div>
    )
  }
})