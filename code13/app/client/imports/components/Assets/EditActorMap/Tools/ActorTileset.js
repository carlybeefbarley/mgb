import React from 'react'
import { Label, Segment, Grid, Button, Icon } from 'semantic-ui-react'

import { showToast } from '/client/imports/routes/App'
import SelectedTile from '../../Common/Map/Tools/SelectedTile.js'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper.js'
import ActorHelper from '../../Common/Map/Helpers/ActorHelper.js'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import _ from 'lodash'


export default class ActorTileset extends React.Component {
  // getter - returns active tileset
  get tileset(){
    return this.props.tilesets[this.props.activeTileset]
  }

  renderActors(from = 0, to = this.props.tilesets.length){
    return (
      <div className="ui">
      {/*
        <Button icon 
          onClick={this.props.removeTileset(this.props.activeTileset)}
          style={{float:'right', margin:'0'}}>
          <Icon name='trash' />
        </Button>
      */}
        <div 
        className="content tilesetPreviewModal" 
        style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap'}}>
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
        <span className="tilesetPreviewTitle" style={{float:'left', clear:'left'}}>{tileset.name.split(':')[1]}</span>
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
    const layer = this.props.getActiveLayerData()

    for (let i = from; i < to; i++) {
      let isValidForLayer = layer ? ActorHelper.checks[layer.name](tss[i]) : true
      if (isValidForLayer)
        tilesets.push( genTemplate.call(this, i, tss[i] === ts, tss[i]) )
    }

    return tilesets
  }

  render(){
    return (
      <Segment id="mgbjr-MapTools-actors" style={{boxSizing: 'inherit', display: 'block', height: '100%', margin: 0}}>
        <Label attached='top'>Actors For {this.props.getActiveLayerData().name} Layer </Label>
          {
            !this.props.tilesets.length 
            ?
            <p className="title active" style={{"borderTop": "none", "paddingTop": 0}}>{_dragHelpMsg}</p>
            :
            (
            this.props.getActiveLayerData().name === "Events"
            ?
            <div className="actor-disabled-hint">
               <p className="title active" style={{"borderTop": "none", "paddingTop": 0}}>You cannot use Actors in the Events layer. Use the Events Tool instead.</p>
            </div>
            :
            <div
              className='active content tilesets accept-drop'
              data-drop-text='Drop asset here to create TileSet'
              onDrop={this.onDropOnLayer.bind(this)}
              onDragOver={DragNDropHelper.preventDefault}>
                {this.renderActors(1)}
            </div>
            )
          }
      </Segment>
    )
  }
}