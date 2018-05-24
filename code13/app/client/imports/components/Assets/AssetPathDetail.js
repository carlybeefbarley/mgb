import PropTypes from 'prop-types'
import React from 'react'
import { AssetKinds } from '/imports/schemas/assets'
import validate from '/imports/schemas/validate'
import InlineEdit from '/client/imports/components/Controls/InlineEdit'
import QLink from '/client/imports/routes/QLink'
import { Icon, Popup, Grid } from 'semantic-ui-react'
import moment from 'moment'

/** This used by  to render something like...
   *      [ VIEW|EDIT] Kind > AssetName
   */

const SaveStatus = ({ lastUpdated, isUnconfirmedSave, hasUnsentSaves }) => {
  let msg = [
    'all changes saved',
    'AutoSave is enabled',
    'Changes you make are automatically saved to the cloud',
  ]
  if (hasUnsentSaves)
    msg = [
      'Saving...',
      'Your changes will AutoSave soon',
      'Your changes will be sent to the server every few seconds',
    ]
  if (isUnconfirmedSave)
    msg = ['Saving...', 'AutoSaving your changes', 'Your changes have been sent to the server']

  return (
    <Popup
      size="tiny"
      inverted
      position="bottom left"
      trigger={
        <small
          style={{ color: 'grey' }}
          id={!hasUnsentSaves && !isUnconfirmedSave ? 'mgbjr-changes-saved' : 'mgbjr-saving-changes'}
        >
          {msg[0]}
        </small>
      }
    >
      <Popup.Header>{msg[1]}</Popup.Header>
      <Popup.Content>
        <div>{msg[2]}</div>
        <small style={{ color: 'grey', float: 'right' }}>Last updated {moment(lastUpdated).fromNow()}</small>
      </Popup.Content>
    </Popup>
  )
}

const AssetKindExplainer = ({ kind, ownerName }) => {
  const ak = AssetKinds[kind]
  return (
    <Popup
      trigger={
        <QLink style={{ color: ak.color }} to={`/u/${ownerName}/assets`} query={{ kinds: kind }}>
          <Icon color={ak.color} name={ak.icon} />
        </QLink>
      }
      size="tiny"
      inverted
      position="bottom left"
      header={`This is a '${ak.name}' Asset`}
      content={ak.description}
    />
  )
}

const AssetPathDetail = React.createClass({
  propTypes: {
    canEdit: PropTypes.bool.isRequired, // True iff the user can edit this file
    ownerName: PropTypes.string.isRequired, // Asset.dn_ownerName (as a string)
    kind: PropTypes.string.isRequired, // Asset.kind (as a string)
    name: PropTypes.string, // Asset.name (can be null)
    text: PropTypes.string, // Asset.text - description text (can be null)
    isUnconfirmedSave: PropTypes.bool, // not present === saved.. for legacy data
    hasUnsentSaves: PropTypes.bool.isRequired, // if true, then some saves have not yet been sent for this asset, so reflect that in UI (orange label)
    handleNameChange: PropTypes.func.isRequired,
    lastUpdated: PropTypes.instanceOf(Date),
    handleDescriptionChange: PropTypes.func.isRequired,
    handleSaveNowRequest: PropTypes.func.isRequired, // Callback indicating User has said 'save now'
  },

  handleFieldChanged(data) {
    // data = { description: "New validated text comes here" }
    // Update your model from here
    if (data.name) this.props.handleNameChange(data.name)
    if (data.text) this.props.handleDescriptionChange(data.text)
  },

  render() {
    const {
      name,
      kind,
      text,
      ownerName,
      canEdit,
      isUnconfirmedSave,
      hasUnsentSaves,
      lastUpdated,
    } = this.props
    const emptyAssetDescriptionText = canEdit ? '(no description)' : ''
    const untitledAssetString = canEdit ? '(Type asset name here)' : '(untitled)'

    return (
      <Grid.Column width="8" id="mgbjr-asset-edit-header-left">
        <Grid.Row>
          <AssetKindExplainer kind={kind} ownerName={ownerName} />

          <InlineEdit
            style={{ marginLeft: '0.7em', marginRight: '1em' }}
            validate={validate.assetName}
            activeClassName="editing"
            text={name || untitledAssetString}
            paramName="name"
            change={this.handleFieldChanged}
            isDisabled={!canEdit}
          />

          {canEdit && (
            <SaveStatus
              lastUpdated={lastUpdated}
              isUnconfirmedSave={isUnconfirmedSave}
              hasUnsentSaves={hasUnsentSaves}
            />
          )}
        </Grid.Row>

        <Grid.Row>
          <small>
            <div className="ui fluid input">
              <InlineEdit
                validate={validate.assetDescription}
                text={text && text.length > 0 ? text : emptyAssetDescriptionText}
                style={{ color: 'grey' }}
                paramName="text"
                change={this.handleFieldChanged}
                isDisabled={!canEdit}
              />
            </div>
          </small>
        </Grid.Row>
      </Grid.Column>
    )
  },
})

export default AssetPathDetail
