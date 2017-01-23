import React from 'react'
import { Label, Segment, Button, Icon, Grid } from 'semantic-ui-react'

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
        <Grid stackable doubling columns='equal' style={{width: '100%', margin: 0}}>
          {this.renderTileset(from, to, this.genTilesetImage)}
        </Grid>
    )
  }
  
  genTilesetImage(index, isActive, tileset){
    const title = `${tileset.name.split(':')[1]} (${tileset.imagewidth}x${tileset.imageheight})`
    const imgRatio = tileset.imageheight / tileset.imagewidth
    // If not using flexbox justify-content (single column will not center)
    // const style = {minWidth: '64px', width: 'calc(50% - 1em)', position: 'relative', flexDirection: 'column', margin: '0.5em'}
    return (
      <Grid.Column
        title={title}
        className={"centered tilesetPreview" + (isActive ? " active" : '')}
        key={index}
        onClick={() => {
          this.props.selectTile
          const selectedTile = new SelectedTile()
          selectedTile.getGid(tileset)
          this.props.selectTile(selectedTile)
          console.log(selectedTile)
        }}
        style={{minWidth: '64px', width: 'calc(50% - 2em)', margin: '1em'}}
        >
        {
          <img
            className="mgb-pixelated"
            src={tileset.image} 
            width='64'
            height={imgRatio * 64}
            style={{verticalAlign: 'middle'}}
          />
        }
        <Label attached='bottom' style={{backgroundColor: '#303030', color: 'white', opacity: 0.7, textAlign: 'center'}}>
          {
            tileset.name.split(':')[1].length > 8
            ?
            (
              tileset.name.split(':')[1].length > 12
              ?
              <span style={{marginLeft: '-100%', marginRight: '-100%', textAlign: 'center'}}>{tileset.name.split(':')[1].slice(0, -2) + '..'}</span>
              :
              <span style={{marginLeft: '-100%', marginRight: '-100%', textAlign: 'center'}}>{tileset.name.split(':')[1]}</span>
            )
            :
            <span>{tileset.name.split(':')[1]}</span> 
          }
        </Label>
      </Grid.Column >
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
    const count = 0

    for (let i = from; i < to; i++) {
      let isValidForLayer = layer ? ActorHelper.checks[layer.name](tss[i]) : true
      if (isValidForLayer)
        count++
        tilesets.push( genTemplate.call(this, i, tss[i] === ts, tss[i]) )
    }
    // Dummy div for left-justified responsive grid
    if (to % 2 !== 0) 
      tilesets.push(<Grid.Column style={{minWidth: '64px', width: 'calc(50% - 2em)', margin: '1em'}} />)

    return tilesets
  }

  render(){
    return (
      <Segment id="mgbjr-MapTools-actors" style={{display: 'flex', height: '100%'}}>
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
              onDragOver={DragNDropHelper.preventDefault}
              style={{maxHeight: '100%', maxWidth: '100%', padding: 'auto', overflowY: 'scroll'}}
              >
              {this.renderActors(1)}
            </div>
            )
          }
      </Segment>
    )
  }
}