import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Message, Segment } from 'semantic-ui-react'

import EditUnknown from './EditUnknown'
import AssetCard from './AssetCard'
import Hotjar from '/client/imports/helpers/hotjar'
import Spinner from '/client/imports/components/Nav/Spinner'
import { joyrideStore } from '/client/imports/stores'
import { getKnownExtension } from '/client/imports/helpers/extensions'

// @stauzs - for Cordova you may need to have to do the imports like we used to.. im which case
// add an     el: ComponentName field to the list below and use the static imports we used to do
// before this new dynamic import() cuteness

// Any with an _xed suffix are only enabled when the URL includes _xed=(some non-nullstring)

const editElementsForKind = {
  graphic: { loader: () => import('./EditGraphic/EditGraphic') },
  graphic_xed: { loader: () => import('./EditGraphic2/EditGraphic') },
  tutorial: { loader: () => import('./EditCode/EditCode') },
  code: { loader: () => import('./EditCode/EditCode') },
  map: { loader: () => import('./EditMap/EditMap') },
  actormap: { loader: () => import('./EditActorMap/EditActorMap') },
  actor: { loader: () => import('./EditActor/EditActor') },
  assignment: { loader: () => import('./EditAssignment/EditAssignment') },
  sound: { loader: () => import('./EditAudio/EditSound/EditSound') },
  music: { loader: () => import('./EditAudio/EditMusic/EditMusic') },
  game: { loader: () => import('./EditAssignment/EditAssignment') },
  //assignment: { loader: () => import('./EditAssignment/EditAssignment') },
}

const _omitPropsForEditors = [
  // guntis -> need this for editGraphic fixed frames panel
  // 'availableWidth'     // No Editors currently do anything adaptive for size, so do not pass on
]

export default class AssetEdit extends React.Component {
  static propTypes = {
    // The following are ALL sent onto the child Asset Editors
    asset: PropTypes.object.isRequired, // The invoker of this component must ensure that there is a valid Asset object
    canEdit: PropTypes.bool.isRequired, // The invoker provides
    currUser: PropTypes.object, // Can be null/undefined. This is the currently Logged-in user (or null if not logged in)
    handleContentChange: PropTypes.func.isRequired, // Asset Editors call this to deferred-save content2 & thumbnail changes: deferContentChange(content2Object, thumbnail, changeText="content change")
    handleMetadataChange: PropTypes.func.isRequired, // Asset Editors call this to perform IMMEDIATE save of newMetadata
    handleDescriptionChange: PropTypes.func.isRequired, // Asset Editors call this to perform IMMEDIATE save of description change
    editDeniedReminder: PropTypes.func.isRequired, // Asset Editors call this to give User a UI warning that they do not have write access to the current asset
    getActivitySnapshots: PropTypes.func.isRequired, // Activity snapshots causes very heavy re-rendering
    hasUnsentSaves: PropTypes.bool.isRequired, // True if there are deferred saves yet to be sent. HOWEVER, even if sent, then server accept + server ack/nack can be pending - see asset.isUnconfirmedSave for the flag to indicate that 'changes are in flight' status
    handleSaveNowRequest: PropTypes.func.isRequired, // Asset Editor call this to request a flush now (but it does not wait or have a callback). An example of use for this: Flushing an ActorMap asset to play a game in the actorMap editor

    availableWidth: PropTypes.number, // Available screen width in pixels for editor
    useExperimentalEditors: PropTypes.string, // Can be undefined. This is the raw _xed= param from url

    // The following are NOT sent onto the child Asset Editors. See _omitPropsForEditors above
    // NONE AT THIS TIME
  }

  componentDidMount() {
    joyrideStore.completeTag(`mgbjr-CT-openAssetEditor-${this.props.asset.kind}`)

    // console.log(this.props.asset.kind)
    // trigger hotjar heatmap
    // for music and graphic editor setTimeout (because larger content2 size and loads slower)
    setTimeout(() => Hotjar('trigger', 'editor-' + this.props.asset.kind, this.props.currUser), 200)
  }

  render() {
    const { asset, currUser, availableWidth, useExperimentalEditors } = this.props

    let dynamicEditorCompKey = `${asset.kind}`
    if (useExperimentalEditors && _.has(editElementsForKind, dynamicEditorCompKey + '_xed'))
      dynamicEditorCompKey += '_xed'

    // Fancy dynamic module loader enables in Meteor 1.5. Woot
    var loadable = editElementsForKind[dynamicEditorCompKey]
    if (loadable.el === undefined) {
      loadable.el = null
      loadable.loader().then(imp => {
        loadable.el = imp.default
        this.forceUpdate()
      })
    }
    if (loadable.el === null) return <Spinner loadingMsg={`Loading ${dynamicEditorCompKey} editor...`} />

    const Element = loadable.el || EditUnknown
    const isTooSmall = availableWidth < 500

    // this is special case for the EditCode which can handle asset differently depending on extension
    // basically this forces new instance of EditCode if asset type (by extension) has been changed (on asset rename)
    const key = asset._id + getKnownExtension(asset.name)

    return (
      <div style={{ minWidth: '250px' }}>
        {isTooSmall && (
          <Segment basic>
            <Message
              warning
              icon="compress"
              header="Device too narrow"
              content="Showing Asset summary instead of Editor"
            />
            <AssetCard
              asset={asset}
              currUser={currUser}
              fluid
              canEdit={false}
              showEditButton={false}
              renderView="l"
            />
          </Segment>
        )}
        {/* We must keep this in the DOM since it has state we don't want to lose during a temporary resize */}
        <div style={isTooSmall ? { display: 'none' } : undefined}>
          <Element {..._.omit(this.props, _omitPropsForEditors)} key={key} />
        </div>
      </div>
    )
  }
}
