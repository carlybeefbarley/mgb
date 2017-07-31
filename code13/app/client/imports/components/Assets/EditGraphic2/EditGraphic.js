import React, { Component, PropTypes } from 'react'
import { Header } from 'semantic-ui-react'

export default class EditGraphic extends Component {
  static propTypes = {
    /** The invoker of this component must ensure that there is a valid Asset object */
    asset: PropTypes.object.isRequired,

    /** The invoker provides */
    canEdit: PropTypes.bool.isRequired,

    /** Can be null/undefined. This is the currently Logged-in user (or null if not logged in) */
    currUser: PropTypes.object,

    /**
     * Perform deferred-save of content2 & thumbnail changes:
     * @param {*} content2Object
     * @param {*} thumbnail
     * @param {string} changeText
     */
    handleContentChange: PropTypes.func.isRequired,

    /** Perform IMMEDIATE save of newMetadata */
    handleMetadataChange: PropTypes.func.isRequired,

    /** Perform IMMEDIATE save of description change */
    handleDescriptionChange: PropTypes.func.isRequired,

    /** Give User a UI warning that they do not have write access to the current asset */
    editDeniedReminder: PropTypes.func.isRequired,

    /** Activity snapshots causes very heavy re-rendering */
    getActivitySnapshots: PropTypes.func.isRequired,

    /**
     * True if there are deferred saves yet to be sent.
     * HOWEVER, even if sent, then server accept + server ack/nack can be pending.
     * See asset.isUnconfirmedSave for the flag to indicate that 'changes are in flight' status
     */
    hasUnsentSaves: PropTypes.bool.isRequired,

    /**
     * Asset Editor call this to request a flush now (but it does not wait or have a callback).
     * An example of use for this: Flushing an ActorMap asset to play a game in the actorMap editor.
     */
    handleSaveNowRequest: PropTypes.func.isRequired,

    /** Available screen width in pixels for editor */
    availableWidth: PropTypes.number,

    /** Can be undefined. This is the raw _xed= param from url */
    useExperimentalEditors: PropTypes.string,
  }

  render() {
    return (
      <div>
        <Header>props</Header>
        <pre>
          <code>{JSON.stringify(this.props, null, 2)}</code>
        </pre>
        <Header>props</Header>
        <pre>
          <code>{JSON.stringify(this.props, null, 2)}</code>
        </pre>
      </div>
    )
  }
}
