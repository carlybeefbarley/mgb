import React from 'react'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import QLink from '/client/imports/routes/QLink'
import { Azzets } from '/imports/schemas'
import SmallDD from './SmallDD.js'


// TODO - change pattern to be getMeteorData so we fix the timing issues.
export default class DropArea extends React.Component {
  state = { text: '' }

  get data() {
    return this.props.value
  }

  componentDidMount() {
    this.isUnmounted = false
    
    if (this.props.value) {
      const parts = this.props.value.split(":")
      const name = parts.pop()
      const owner = parts.length > 0 ? parts.pop() : this.props.asset.dn_ownerName

      this.subscription = Meteor.subscribe("assets.public.owner.name", owner, name, {
        onReady: () => {
          if (this.isUnmounted)
            return          
          this.setState( { asset: this.getAsset() } )
        },
        onError: (e) => { console.log("DropArea - subscription did not become ready", e) }
      })
      // meteor subscriptions onReady might not get called - somehow buggish behavior
      // keep looping until we get an asset (:doh)
      // TODO: there MUST be better way
      let count = 0
      const onReady = () => {
        const a = this.getAsset()
        count++
        // TODO: react devs assume that isMounted is antipattern.. need to redo all this onReady magic
        if (this.isUnmounted)
          return
        
        if (!a && count < 100)
          window.setTimeout( onReady, 1000)
        else if (!this.state.asset)
          this.setState( { asset: a } )
      }
      onReady()
    }
  }

  componentWillUnmount() {
    this.isUnmounted = true
    this.subscription && this.subscription.stop()
  }

  handleDrop(e) {
    const asset = DragNDropHelper.getAssetFromEvent(e)
    if (!asset) {
      console.log("Drop - NO asset")
      return
    }

    if (asset.kind !== this.props.kind) {
      this.setState( { badAsset: asset, asset: null }, () => { this.saveChanges() })
      return
    }

    this.setState( { asset: asset, badAsset: null }, () => {
      this.subscription && this.subscription.stop()
      this.subscription = Meteor.subscribe("assets.public.owner.name", asset.dn_ownerName, asset.name, {
        onReady: () => { this.forceUpdate() }
      })
      this.saveChanges()
    })
  }

  saveChanges() {
    let name = this.state.asset ? this.state.asset.dn_ownerName + ":" + this.state.asset.name : ''

    if (name && this.props.asset.dn_ownerName === this.state.asset.dn_ownerName)
      name = this.state.asset.name

    this.props.onChange && this.props.onChange(name, this.state.asset)
  }

  getAsset() {
    if (this.state.asset)
      return this.state.asset
    
    if (this.props.value) {
      const parts = this.props.value.split(":")
      const name = parts.pop()
      const owner = parts.length > 0 ? parts.pop() : this.props.asset.dn_ownerName

      this.subscription = Meteor.subscribe("assets.public.owner.name", owner, name)
      const aa =  Azzets.find({dn_ownerName: owner, name: name}).fetch()

      if (aa && aa.length)
        return aa[0]
    }
    return null
  }

  createAssetView() {
    const asset = this.state.asset || this.getAsset() || this.state.badAsset;
    if (!asset)
      return
    
    const transform = this.getEffect(this.props.effect)
    // TODO: render effect
    return (
      <QLink to={`/u/${asset.dn_ownerName}/asset/${asset._id}`}>
        {asset.thumbnail && <img className='mgb-pixelated' style={{maxHeight: "50px", transform}} src={asset.thumbnail}/> }
        <div>{asset.name} {this.props.value && <i>({this.props.value})</i>}</div>
      </QLink>
    )
  }

  getEffect(effect) {
    if (!effect)
      return "none"
    
    const map = {
      rotate90: "rotate(90deg)",
      rotate180: "rotate(180deg)",
      rotate270: "rotate(270deg)",
      flipX: "scaleX(-1)",
      flipY: "scaleY(-1)"
    }
    return map[effect] || "none"
  }

  renderOptions() {
    const name = this.props.title || "Builtin samples"
    const options = this.props.options
    return (
      <div className="inline fields">
        <label>{name}</label>
        <SmallDD options={options} onchange={(val) => {
          this.props.value = val
          this.state.asset = null
          this.props.onChange && this.props.onChange(val)
        }} value={this.props.value} />
      </div>
    )
  }

  render() {
    const asset = this.getAsset()
    return (
      <div
        style={{width: "100%"}}
        className={'ui message accept-drop message' + (asset ? " positive" : "") + (this.state.badAsset ? " negative" : "")}
        onDragOver={DragNDropHelper.preventDefault}
        onDrop={this.handleDrop.bind(this)}
        >

        {!asset && !this.state.badAsset ? (this.props.value || `Drop Asset (${this.props.kind || "any"}) here!`) :
          <i className="floated right ui icon remove" onClick={()=>{
              this.props.value = ""
              this.setState(
                {asset: null, badAsset: null }, () => {
                  this.props.value = ""
                  this.saveChanges()
                }
              )
            }}
            style={{
              position: "absolute",
              right: "-5px",
              top: "3px",
              cursor: "pointer"
            }}></i>
        }
        {this.state.badAsset && <b>Invalid asset kind: expected [{this.props.kind}] got: [{this.state.badAsset.kind}]</b>}
        {this.createAssetView()}
        {this.props.options && this.renderOptions()}
      </div>
    )
  }
}
