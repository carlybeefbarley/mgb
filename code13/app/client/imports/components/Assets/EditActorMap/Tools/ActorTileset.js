import React from 'react'
import { Label, Segment, Grid, Icon } from 'semantic-ui-react'

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

  selectTileset(index, tileset) {
    this.props.clearActiveSelection()
    const selectedTile = new SelectedTile()
    const gid = selectedTile.getGid(tileset)
    this.props.selectTile(selectedTile)
    this.props.selectTileset(index)
  }

  removeTileset = () => {
    if (!this.props.activeTileset || this.props.activeTileset.firstgid < 100) { return } // Don't remove Events
    this.props.removeTileset(this.props.activeTileset)
    this.props.clearActiveSelection() 
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

  getTilePosInfo (e) {
    const ts = this.tileset
    // image has not been loaded
    if (!ts) {
      return
    }
    const pos = new SelectedTile()
    pos.updateFromMouse(e, ts, this.spacing)
    return pos
  }

 // Render functions for Actors
  renderActors(from = 0, to = this.props.tilesets.length){
    return (
        <Grid columns='equal' style={{width: '100%', margin: 0}}>
          {this.renderTileset(from, to, this.genTilesetImage)}
        </Grid>
    )
  }

  genTilesetImage(index, isActive, tileset){
    const title = `${tileset.name.split(':')[1]} (${tileset.imagewidth}x${tileset.imageheight})`
    const imgRatio = tileset.imageheight / tileset.imagewidth
    const width = tileset.imagewidth <= 64 ? 64 : 80

    return (
      <Grid.Column
        title={title}
        className={"tilesetPreview" + ( isActive ? " selectedTileset" : '')}
        key={index}
        onClick={() => {
          this.selectTileset(index, tileset)
        }}

        style={{
          minWidth: '80px', 
          width: 'calc(50% - 2em)', 
          margin: '1em', 
          padding: 0,
          paddingTop: 'auto',
          borderRadius: '.28571429rem', 
          border: 'none',
          boxShadow: '0 1px 3px 0 grey, 0 0 0 1px grey',
          opacity: 0.7
        }}
        >
        <img
          className="mgb-pixelated"
          src={tileset.image} 
          width={width}
          height={imgRatio * width}
          style={{verticalAlign: 'middle'}}
        />
        <Label attached='bottom' style={{backgroundColor: 'rgba(0, 0, 0, 0.75)', color: 'white', textAlign: 'center', padding: 0, verticalAlign: 'middle', maxHeight: '1.5em'}}>
          {
            tileset.name.split(':')[1].length > 8
            ?
            (
              tileset.name.split(':')[1].length > 12
              ?
              <p style={{marginLeft: '-100%', marginRight: '-100%', textAlign: 'center'}}>{tileset.name.split(':')[1].slice(0, -2) + '..'}</p>
              :
              <p style={{marginLeft: '-100%', marginRight: '-100%', textAlign: 'center'}}>{tileset.name.split(':')[1]}</p>
            )
            :
            <p>{tileset.name.split(':')[1]}</p> 
          }
        </Label>
      </Grid.Column >

    )
  }

  renderTileset(from = 0, to = this.props.tilesets.length, genTemplate = this.genTilesetList){
    const tss = this.props.tilesets
    let ts = this.tileset
    const tilesets = []
    let count = 0

    for (let i = from; i < to; i++) {
      if (ActorHelper.checks[this.props.getActiveLayerData().name](tss[i])) {
        tilesets.push( genTemplate.call(this, i, tss[i] === ts, tss[i]) )
        count++
      }
    }

    // Dummy div for left-justified two-column grid that resizes and centers when switched to single column for smaller widths
    if (count % 2 !== 0) {
      tilesets.push(<Grid.Column key={-1} style={{height: 0, minWidth: '80px', width: 'calc(50% - 2em)', margin: '0 1em 0 1em'}} />)
    }

    return tilesets
  }

  render(){
    const label = this.props.getActiveLayerData().name === 'Events' ? 'Actors' : `Actors For ${this.props.getActiveLayerData().name} Layer`

    return (
      <Segment id="mgbjr-MapTools-actors" style={{display: 'flex', height: '100%'}}>
        <Label attached='top'>
          {label}
          {
          this.props.getActiveLayerData().name !== "Events" && (this.props.tilesets && this.props.tilesets.length > 1) &&
          <Icon 
              size='large' 
              name='trash' 
              onClick={this.removeTileset}
              style={{position: 'absolute', top: '5px', right: '-5px', cursor: 'pointer'}}
          />
          }
        </Label>
        {
          !this.props.tilesets.length 
          ?
          <p className="title active" style={{"borderTop": "none", "paddingTop": 0}}>{_dragHelpMsg}</p>
          :
          (
          this.props.getActiveLayerData().name === "Events"
          ?
          <div >
          </div>
          :
          <div
            className='active content tilesets accept-drop'
            data-drop-text='Drop asset here to create TileSet'
            onDrop={this.onDropOnLayer.bind(this)}
            onDragOver={DragNDropHelper.preventDefault}
            style={{maxHeight: '100%', width: '100%', overflowY: 'scroll'}}
            >
            {this.renderActors()}
          </div>
          )
        }
      </Segment>
    )
  }
}