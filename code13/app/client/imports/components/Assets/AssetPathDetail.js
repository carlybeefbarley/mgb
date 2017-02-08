import React, { PropTypes } from 'react'
import { AssetKinds } from '/imports/schemas/assets'
import validate from '/imports/schemas/validate'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import { Icon, Popup, Grid } from 'semantic-ui-react'

  /** This used by  to render something like...
   *      [ VIEW|EDIT] Kind > AssetName
   */

const SaveStatus = ( { isUnconfirmedSave, hasUnsentSaves } ) => {
  let msg = [ 'all changes saved', 'AutoSave is enabled', 'Changes you make are automatically saved to the cloud']
  if (hasUnsentSaves)
    msg = ['Saving...', 'Your changes will AutoSave soon', 'Your changes will be sent to the server every few seconds']
  if (isUnconfirmedSave)
    msg = ['Saving...', 'AutoSaving your changes', 'Your changes have been sent to the server']

  return (
    <Popup 
      size='small' 
      inverted 
      positioning='bottom center'
      trigger={<small style={{ color: 'grey' }}>{msg[0]}</small>} 
      header={msg[1]} content={msg[2]} />
  )
}

const AssetKindExplainer = ( { kind, ownerName } ) => {
  const ak = AssetKinds[kind]
  return (
    <Popup
      trigger={(
       <QLink style={{color: ak.color }} to={`/u/${ownerName}/assets`} query={{kinds: kind}}>
        <Icon color={ak.color} name={ak.icon} />
      </QLink>
    )}
    size='small'
    inverted
    positioning='bottom left'
    header={`This is a '${ak.name}' Asset`}
    content={ak.description} />
  )
}

export default AssetPathDetail = React.createClass({

  propTypes: {
    canEdit:    PropTypes.bool.isRequired,              // True iff the user can edit this file
    ownerName:  PropTypes.string.isRequired,            // Asset.dn_ownerName (as a string)
    kind:       PropTypes.string.isRequired,            // Asset.kind (as a string)
    name:       PropTypes.string,                       // Asset.name (can be null)
    text:       PropTypes.string,                       // Asset.text - description text (can be null)
    isUnconfirmedSave: PropTypes.bool,                  // not present === saved.. for legacy data
    hasUnsentSaves:    PropTypes.bool.isRequired,       // if true, then some saves have not yet been sent for this asset, so reflect that in UI (orange label)
    handleNameChange:  PropTypes.func.isRequired,
    handleDescriptionChange: PropTypes.func.isRequired,
    handleSaveNowRequest:    PropTypes.func.isRequired, // Callback indicating User has said 'save now'
    isServerOnlineNow:       PropTypes.bool.isRequired  // Boolean - is the server online now. TODO: Remove if we don't use this
  },
  
  handleFieldChanged: function(data) {
    // data = { description: "New validated text comes here" }
    // Update your model from here    
    if (data.name)
      this.props.handleNameChange(data.name)
    if (data.text)
      this.props.handleDescriptionChange(data.text)
  },

  render() {
    const { name, kind, text, ownerName, canEdit, isUnconfirmedSave, hasUnsentSaves } = this.props
    const emptyAssetDescriptionText = canEdit ? '(no description)' : ''
    const untitledAssetString = canEdit ? "(Type asset name here)" : "(untitled)"

    return (
      <div>
        <Grid.Row>

          <AssetKindExplainer kind={kind} ownerName={ownerName}/>

          &emsp;

          <InlineEdit
            validate={validate.assetName}
            activeClassName="editing"
            text={name || untitledAssetString}
            paramName="name"
            change={this.handleFieldChanged}
            isDisabled={!canEdit} />
            
            &emsp;

          { canEdit && <SaveStatus isUnconfirmedSave={isUnconfirmedSave} hasUnsentSaves={hasUnsentSaves} /> }       
        </Grid.Row>
        
        <Grid.Row>
          <small>
            <div className="ui fluid input">
              <InlineEdit
                validate={validate.assetDescription}
                text={(text && text.length > 0) ? text : emptyAssetDescriptionText}
                style={{color: 'grey'}}
                paramName="text"
                change={this.handleFieldChanged}
                isDisabled={!canEdit}
                />
            </div>
          </small>
        </Grid.Row>
      </div>
    )
  }
})