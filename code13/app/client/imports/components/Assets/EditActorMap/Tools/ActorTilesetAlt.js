import React from 'react'
import SelectedTile from '../../Common/Map/Tools/SelectedTile.js'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import _ from 'lodash'


export default class ActorTilesetAlt extends React.Component {
  // getter - returns active tileset
  get tileset(){
    return this.props.tilesets[this.props.activeTileset]
  }

  renderActors(from = 0, to = this.props.tilesets.length){
    return (
      <div className="ui">
        <div className="content tilesetPreviewModal">
          {this.renderTileset(from, to, this.genTilesetImage)}
        </div>
      </div>
    )
  }
  genTilesetImage(index, isActive, tileset){
    const title = `${tileset.name} ${tileset.imagewidth}x${tileset.imageheight}`
    return (
      <div
        title={title}
        className={"tilesetPreview" + (isActive ? " active" : '')}
        key={index}
        onClick={() => {
          const selectedTile = new SelectedTile()
          selectedTile.getGid(tileset)
          this.props.selectTile(selectedTile)
        }}
        >
        <img src={tileset.image}/>
        <span className="tilesetPreviewTitle">{tileset.name}</span>
      </div>
    )
  }

  onDropOnLayer (e) {
    const asset = DragNDropHelper.getAssetFromEvent(e)
    joyrideCompleteTag(`mgbjr-CT-MapTools-actors-drop`)
    if (!asset)
      return

    // TODO: create nice popup
    if (asset.kind !== "actor") {
      showToast("TD: Only Actors are supported in ActorMap ", 'warning')
      return
    }

    const name = asset.dn_ownerName +":"+ asset.name
    if (_.some(this.props.tilesets, { name: name } ) )
    {
      showToast(`TD: This Map already contains Asset '${name}'`, 'warning')
      return
    }

    this.props.startLoading()
    const tileset = {
      columns:      1,
      firstgid:     0,
      image:        '',
      imageheight:  0,
      imagewidth:   0,
      margin:       0,
      name:         name,
      spacing:      0,
      tilecount:    1,
      tileheight:   32,
      tilewidth:    32
    }
    const nextId = Infinity
    const map = { [name] : tileset }
    ActorHelper.loadActor(name, map, nextId, {}, null, () => {
      this.props.addActor(map[name])
    })
  }

  renderTileset(from = 0, to = this.props.tilesets.length, genTemplate = this.genTilesetList){
    const tss = this.props.tilesets
    let ts = this.tileset
    const tilesets = []
    for (let i = from; i < to; i++) {
      tilesets.push( genTemplate.call(this, i, tss[i] === ts, tss[i]) )
    }
    return tilesets
  }
  render(){
    return <div
      style={{backgroundColor: "pink"}}
      className='active content tilesets accept-drop'
      data-drop-text='Drop asset here to create TileSet'
      onDrop={this.onDropOnLayer.bind(this)}
      onDragOver={DragNDropHelper.preventDefault}
      >{this.renderActors()}</div>
  }
}