import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import QLink from '/client/imports/routes/QLink'
import { Azzets } from '/imports/schemas'
import SmallDD from './SmallDD.js'
import MgbActor from '/client/imports/components/MapActorGameEngine/MageMgbActor'

import Thumbnail from '/client/imports/components/Assets/Thumbnail'

// TODO: use observeAsset from assetFetchers instead of custom observer
// import { observeAsset } from "/client/imports/helpers/assetFetchers"
import { joyrideStore } from '/client/imports/stores'

// TODO - change pattern to be getMeteorData so we fix the timing issues.
export default class DropArea extends React.Component {
  state = { text: '' }

  static PropTypes = {
    kind: PropTypes.string.required, // asset kind which will accept this drop area
    value: PropTypes.string, // previously saved value
    ids: PropTypes.object, // map with [value] = asset._id - to track renamed assets
    asset: PropTypes.object, // Asset assigned to this dropArea
    onChange: PropTypes.function, // callback
    text: PropTypes.strings, // alternative text to display
    isModalView: PropTypes.bool,
  }

  static subscriptions = {} // key = owner:name / value subscription
  get data() {
    return this.props.value
  }

  componentDidMount() {
    this.isUnmounted = false

    if (this.props.value) {
      const parts = this.props.value.split(':')
      let name = parts.pop()
      if (/(#\d+)$/.test(name) && this.props.kind === 'graphic') name = name.split(' #')[0]
      const owner = parts.length > 0 ? parts.pop() : this.props.asset.dn_ownerName
      this.startSubscription(owner, name)
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true
    this.subscription && this.subscription.stop()
  }

  startSubscription = (owner, name, kind = this.props.kind) => {
    // no need for subscription here
    if (owner == '[builtin]') {
      return
    }

    if (this.subscription && !this.subscription.isStopped) {
      return
    }
    const key = `${owner}:${name}`
    // prevent inception
    const oldSub = DropArea.subscriptions[key]
    if (oldSub && !oldSub.isStopped) {
      this.subscription = oldSub
      const oldReady = this.subscription.onReady
      // keep stacking on ready
      this.subscription.onReady = () => {
        oldReady()
        this.setState({ asset: this.getAsset() })
      }
      return
    }

    // stop old subscription
    this.subscription && this.subscription.stop()
    // remove from stack just in case we are called from getMeteorData stack - which will auto stop sub
    window.setTimeout(() => {
      console.log('Subscription started', key)
      this.subscription = Meteor.subscribe(
        'assets.public.id.or.owner.name',
        this.props._id,
        owner,
        name,
        kind,
        {
          onStop: () => {
            delete DropArea.subscriptions[`${owner}:${name}`]
            this.subscription.isStopped = true
            console.log('Subscription stopped', key)
          },
          onReady: () => {
            // we are stopping subscription on unmount - is this still gets triggered
            if (this.isUnmounted) return
            this.subscription.onReady()
          },
          onError(e) {
            console.log('DropArea - subscription did not become ready', e)
          },
        },
      )

      this.subscription.onReady = () => {
        this.setState({ asset: this.getAsset() })
      }
    }, 0)
  }

  handleDrop = e => {
    const asset = DragNDropHelper.getAssetFromEvent(e)

    if (!asset) {
      console.log('Drop - NO asset')
      return
    }

    this.setAsset(asset)
  }

  saveChanges = () => {
    if (this.state.badAsset) {
      return
    }
    let name = this.state.asset ? this.state.asset.dn_ownerName + ':' + this.state.asset.name : ''

    /*
    if (name && this.props.asset && this.props.asset.dn_ownerName === this.state.asset.dn_ownerName)
      name = this.state.asset.name
    */

    this.props.onChange && this.props.onChange(name, this.state.asset)
  }

  handleRemove = () => {
    //this.props.value = ''
    this.setState({ asset: null, badAsset: null }, () => {
      //this.props.value = ''
      this.saveChanges()
    })
  }
  /**
   * Gets asset related to this drop area
   */
  getAsset = () => {
    if (this.state.asset) return this.state.asset

    if (this.props.value) {
      const parts = this.props.value.split(':')
      let name = parts.pop()
      if (/(#\d+)$/.test(name) && this.props.kind === 'graphic') name = name.split(' #')[0]

      const owner = parts.length > 0 ? parts.pop() : this.props.asset.dn_ownerName
      if (owner == '[builtin]') return

      // use or not to use isDeleted here ???????
      const selByName = { dn_ownerName: owner, name, kind: this.props.kind, isDeleted: false }
      const sel = this.props._id ? { _id: this.props._id, isDeleted: false } : selByName

      let assets = Azzets.find(sel).fetch()
      // if we cannot find by id - check by name
      if (assets.length === 0 && this.props._id) {
        assets = Azzets.find(selByName).fetch()
      } else if (assets.length > 1) console.warn('Multiple assets located for DropArea', assets)

      if (assets && assets.length) return assets[0]
    }
    return null
  }

  setAsset = asset => {
    if (asset.kind !== this.props.kind) {
      this.setState({ badAsset: asset, asset: null }, () => {
        this.saveChanges()
      })
      return
    }

    this.setState({ asset, badAsset: null }, () => {
      this.subscription && this.subscription.stop()
      // subscribe to new asset
      this.startSubscription(asset.dn_ownerName, asset.name, asset.kind)
      this.saveChanges()
    })
  }

  createAssetView = () => {
    const asset = this.state.asset || this.getAsset() || this.state.badAsset
    if (!asset) return

    const transform = this.getEffect(this.props.effect)
    const frame = this.getFrame(this.props.frame)
    const imgLink = frame === 0 ? Thumbnail.getLink(asset) : `/api/asset/png/${asset._id}?frame=${frame}`

    // TODO: render effect
    return (
      <QLink to={`/u/${asset.dn_ownerName}/asset/${asset._id}`}>
        <img className="mgb-pixelated" style={{ maxHeight: '50px', transform }} src={imgLink} />
        <div>
          {asset.name} {this.props.value && <i>({this.props.value})</i>}
        </div>
      </QLink>
    )
  }

  getEffect = effect => {
    if (!effect) return 'none'

    const map = {
      rotate90: 'rotate(90deg)',
      rotate180: 'rotate(180deg)',
      rotate270: 'rotate(270deg)',
      flipX: 'scaleX(-1)',
      flipY: 'scaleY(-1)',
    }
    return map[effect] || 'none'
  }

  getFrame = frame => {
    if (!frame) return 0

    return frame
  }

  handleOptionClick = val => {
    this.setState({ asset: null })
    const name = this.props.title || 'Builtin samples'

    // Play sound when selecting
    if (name === 'Builtin samples' && MgbActor.alCannedSoundsList.includes(val.split(':').pop())) {
      MgbActor.previewCannedSound(val)
    }
    this.props.onChange && this.props.onChange(val)
  }

  renderOptions = () => {
    const name = this.props.title || 'Builtin samples'
    const options = this.props.options
    return (
      <div className="inline fields">
        <label>{name}</label>
        <SmallDD options={options} onChange={this.handleOptionClick} value={this.props.value} />
      </div>
    )
  }

  renderModalView = () => {
    const asset = this.state.asset || this.getAsset() || this.state.badAsset
    if (!asset) return

    const frame = this.getFrame(this.props.frame)
    const imgLink = frame === 0 ? Thumbnail.getLink(asset) : `/api/asset/png/${asset._id}?frame=${frame}`

    return (
      <div style={{ verticalAlign: 'middle' }}>
        <img className="mgb-pixelated" style={{ maxHeight: '64px', float: 'left' }} src={imgLink} />
        <div style={{ marginLeft: '10px', float: 'left' }}>
          {asset.name} {this.props.value && <i>({this.props.value})</i>}
        </div>
      </div>
    )
  }

  render() {
    const asset = this.getAsset()

    if (this.props.isModalView) return this.renderModalView()

    return (
      <div
        /*TODO: this is bad id - e.g. actor has 3 sound options */
        id={`mgbjr-dropArea-${this.props.kind}`}
        style={{ width: '100%' }}
        className={
          'ui message accept-drop message' +
          (asset ? ' positive' : '') +
          (this.state.badAsset ? ' negative' : '')
        }
        onDragOver={DragNDropHelper.preventDefault}
        onDrop={e => {
          joyrideStore.completeTag(`mgbjr-CT-dropArea-${this.props.kind}`)
          this.handleDrop(e)
        }}
      >
        {!asset && !this.state.badAsset ? (
          this.props.text || this.props.value || `Drop Asset (${this.props.kind || 'any'}) here!`
        ) : (
          <i
            className="floated right ui icon remove"
            onClick={() => this.handleRemove()}
            style={{
              position: 'absolute',
              right: '-5px',
              top: '3px',
              cursor: 'pointer',
            }}
          />
        )}
        {this.state.badAsset && (
          <b>
            Invalid asset kind: expected [{this.props.kind}] got: [{this.state.badAsset.kind}]
          </b>
        )}
        {this.createAssetView()}
        {this.props.options && this.renderOptions()}
      </div>
    )
  }
}
