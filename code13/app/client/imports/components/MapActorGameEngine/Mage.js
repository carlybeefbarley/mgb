import _ from 'lodash'
import React, { PropTypes } from 'react'
import MageGameCanvas from './MageGameCanvas'
import MagePlayGame from './MagePlayGame'

import { Segment, Button } from 'semantic-ui-react'

// MapActorGameEngine (MAGE)

// This is the top-level React wrapper for the MapActorGameEngine
// We actually USE react also to make it easier to render things
// like inventory UI etc. That would be miserable otherwise :)

// The prop fetchAssetByUri is a supplied function that can obtain a specified asset. 
//  It takes a single parameter, uri, and returns a Promise

const Preloader = props => <Segment inverted>Preloading {props.msg}</Segment>
const MapLoadFailed = props => <Segment color='red' inverted>{props.err}</Segment>

const _resolveOwner = (implicitOwnerName, assetName) => {
  const parts = assetName.split(':')
  const isImplicit = (parts.length === 1 || parts[0].includes('/'))
  return {
    ownerName: isImplicit ? implicitOwnerName : parts[0],
    assetName: isImplicit ? assetName : assetName.slice(parts[0].length + 1)
  }
}
const _mkMapUri = (ownerName, assetName) => { 
  const p = _resolveOwner(ownerName, assetName)
  return `/api/asset/map/${p.ownerName}/${p.assetName}`
}
const _mkActorUri = (ownerName, assetName) =>  {
  const p = _resolveOwner(ownerName, assetName)
  return `/api/asset/fullactor/${p.ownerName}/${p.assetName}`
}
const _mkGraphicUri = (ownerName, assetName) => {
  const p = _resolveOwner(ownerName, assetName)
  return `/api/asset/fullgraphic/${p.ownerName}/${p.assetName}`
} 


// Naughty but nice for now.
const _HACK = self => window.DG = self

export default class Mage extends React.Component {
  constructor(props) {
    super(props)
    // Non-react state
    this._tweenCount = 0                // Tweencount for game loops
    this._mageCanvas = null             // MageGameCanvas ref
    this._gamePlayer = null             // Will be an instance of MagePlayGame class
    this._transitioningToMapName = null

    // React state
    this.state = {
      isPreloading:       'map',   // Null if not preloading. String if preloading. Supercedes all other state
      mapLoadError:       null,    // Can be a string
      activeMap:          null,    // Should be an asset of kind='actormap'.. not kind='map'

      pendingMapLoads:    [],      // contains list of unique actorMap Names that have pending loads
      loadedMaps:         {},      // The loaded actor Data. Contains map of actorMapName -> actorMap
      failedMaps:         {},      // actorMaps that failed to load. Content is the error data

      pendingActorLoads:  [],      // contains list of unique actorNames that have pending loads
      loadedActors:       {},      // The loaded actor Data. Contains map of actorname -> actor
      failedActors:       {},      // Actors that failed to load. Content is the error data

      pendingGraphicLoads:[],      // contains list of unique Graphics Names that have pending loads
      loadedGraphics:     {},      // The loaded Graphics Data. Contains map of actorname -> actor
      failedGraphics:     {}       // Graphics that failed to load. Content is the error data
    }
    _HACK(this)
  }
  
  _mkFriendlyMapName() {
    return `${this.props.ownerName}.${this.props.startMapName}`
  }

  handlePlay()
  {
    if (!this._mageCanvas)
      return

    this._game = new MagePlayGame()
    this._game.startGame(
      this.state.activeMap, 
      this.state.loadedActors, 
      this.state.loadedGraphics, 
      newMapName => this._transitionToNextMap(newMapName),
      console.log, 
      console.log,
      window)
  }

  callDoBlit()
  {
    if (this._mageCanvas && !this.props.isPaused)
    {
      if (this._game) {
        const pendingLoads = this._countPendingLoads()
        if (this._transitioningToMapName && !pendingLoads)
        {
          const newMapData = this.state.loadedMaps[this._transitioningToMapName]
          this._game.transitionResourcesHaveLoaded(newMapData)
          this._transitioningToMapName = null
          this._tweenCount = 0
        }
        this._game.onTickGameDo()
      }
      if (!this._transitioningToMapName) {
        this._mageCanvas.doBlit(
          this.state.activeMap, 
          this.state.loadedActors, 
          this.state.loadedGraphics, 
          this._game ? this._game.activeActors : null,
          this._tweenCount++)
      }
    }
    if (this._mounted)
      window.requestAnimationFrame( () => this.callDoBlit() )
  }

  // Load any actors that we don't already have in state.actors or pendingActorLoads
  _loadRequiredGraphics(desiredGraphicNames)
  {
    const { fetchAssetByUri, ownerName } = this.props
    const { pendingGraphicLoads, loadedGraphics } = this.state
    _.each(desiredGraphicNames, aName => {
      if (!_.includes(pendingGraphicLoads, aName) && !_.includes(loadedGraphics, aName))
      {
        pendingGraphicLoads.push(aName)
        fetchAssetByUri(_mkGraphicUri(ownerName, aName))
          .then(  data => this._graphicLoadResult(aName, true, JSON.parse(data)) )
          .catch( data => this._graphicLoadResult(aName, false, data) )
      }
    })
    this.setState( { pendingGraphicLoads } )    // and maybe isPreloading? use a _mkIisPreloadingFn 
  }

  _graphicLoadResult(aName, isSuccess, data) {
    const { loadedGraphics, failedGraphics } = this.state
    const pendingGraphicLoads = _.pull(this.state.pendingGraphicLoads, aName)
    if (isSuccess)
    {
      _.remove(failedGraphics, aName)
      loadedGraphics[aName] = data
      loadedGraphics[aName]._image = new Image()
      loadedGraphics[aName]._image.onload = (e) => { console.log('loaded ImageData for '+aName, e) }
      loadedGraphics[aName]._image.src = data.content2.frameData[0]
    }
    else
      failedGraphics[aName] = data
    const newIsPreloadingValue = pendingGraphicLoads.length > 0 ? 'actors' : null ///  TODO - handle pending tiles
    this.setState( { pendingGraphicLoads, loadedGraphics, failedGraphics, isPreloading: newIsPreloadingValue } )    
  }

  // Load any actors that we don't already have in state.actors or pendingActorLoads
  loadRequiredActors(desiredActorNames)
  {
    const { fetchAssetByUri, ownerName } = this.props
    const { pendingActorLoads, loadedActors } = this.state
    _.each(desiredActorNames, aName => {
      if (!_.includes(pendingActorLoads, aName) && !_.includes(loadedActors, aName))
      {
        pendingActorLoads.push(aName)
        fetchAssetByUri(_mkActorUri(ownerName, aName))
          .then(  data => this._actorLoadResult(aName, true, JSON.parse(data)) )
          .catch( data => this._actorLoadResult(aName, false, data) )
      }
    })
    this.setState( { pendingActorLoads } )    // and maybe isPreloading? use a _mkIisPreloadingFn 
  }

  _actorLoadResult(aName, isSuccess, data) {
    const { loadedActors, failedActors } = this.state
    const pendingActorLoads = _.pull(this.state.pendingActorLoads, aName)
    if (isSuccess)
    {
      _.remove(failedActors, aName)
      loadedActors[aName] = data
      this._loadRequiredAssetsForActor(data.content2)
    }
    else
      failedActors[aName] = data
    const newIsPreloadingValue = pendingActorLoads.length > 0 ? 'actors' : null ///  TODO - handle pending tiles
    this.setState( { pendingActorLoads, loadedActors, failedActors, isPreloading: newIsPreloadingValue } )    
  }

  // An actor can also require other actors or tiles
  _loadRequiredAssetsForActor(actor)
  {
    // Load any referenced graphics
    const desiredGraphicNames = _.filter(_.union(
      [actor.databag.all.defaultGraphicName],           // TODO: warn if this is blank
      _.map(actor.animationTable, r => r.tileName)
      // any other Tiles mentioned in databags?  I don't think so..
     ), n => (n && n!==''))

    this._loadRequiredGraphics(desiredGraphicNames)

    // Load any referenced actors
    let desiredActorNames = []
    const _fixup = ( bagName, paramsList ) => {
      const paramsArray = paramsList.split(',')
      const bag = actor.databag[bagName]
      _.each(paramsArray, p => {
        if (bag && bag[p] && bag[p] !== '')
          desiredActorNames.push(bag[p])
      })
    }
    _fixup('allchar',   'shotActor')
    _fixup('item',      'equippedNewShotActor,equippedNewActorGraphics')
    _fixup('npc',       'takesObjectOnChoice1,dropsObjectOnChoice1')
    _fixup('npc',       'takesObjectOnChoice2,dropsObjectOnChoice2')
    _fixup('npc',       'takesObjectOnChoice2,dropsObjectOnChoice3')
    _fixup('itemOrNPC', 'dropsObjectWhenKilledName,dropsObjectWhenKilledName2')
    _fixup('itemOrNPC', 'dropsObjectRandomlyName,conditionsActor')
    _fixup('item',      'keyForThisDoor')

    desiredActorNames = _.uniq(desiredActorNames)  // dedupe
    this.loadRequiredActors(desiredActorNames)
  }

  _countPendingLoads() { 
    return this.state.pendingActorLoads.length + this.state.pendingMapLoads.length + this.state.pendingGraphicLoads.length
  }

  _startMapLoaded(activeMap) { 
    const actorNames = _.filter(_.union(activeMap.mapLayer[0], activeMap.mapLayer[1], activeMap.mapLayer[2]), a => (a && a!==''))
    if (actorNames.length)
    {
      this.setState( { activeMap } )
      this.loadRequiredActors(actorNames)
    }
    else
      this.setState( { isPreloading: null, mapLoadError: `Map '${this._mkFriendlyMapName()}' contains no actors` } )
  }

  _startMapLoadFailed(data) { 
    console.log(`MAPLOAD ERROR: '${data}'`)
    this.setState( { isPreloading: null, mapLoadError: `Could not load map '${this._mkFriendlyMapName()}'` } )
  }

  _loadStartMap() {
    const { ownerName, startMapName, fetchAssetByUri } = this.props
    fetchAssetByUri(_mkMapUri(ownerName, startMapName))
      .then( data => this._startMapLoaded(JSON.parse(data)))
      .catch( data => this._startMapLoadFailed(data) )
  }

  _transitionToNextMap(nextMapName) {
    this._transitioningToMapName = nextMapName

    const { fetchAssetByUri, ownerName } = this.props
    const { pendingMapLoads, loadedMaps } = this.state
    if (!_.includes(pendingMapLoads, nextMapName) && !_.includes(loadedMaps, nextMapName))
    {
      pendingMapLoads.push(nextMapName)
      fetchAssetByUri(_mkMapUri(ownerName, nextMapName))
        .then(  data => this._transitionMapLoadResult(nextMapName, true, JSON.parse(data)) )
        .catch( data => this._transitionMapLoadResult(nextMapName, false, data) )
    }
    this.setState( { pendingMapLoads } )    // and maybe isPreloading? use a _mkIisPreloadingFn 
  }

  _transitionMapLoadResult(nextMapName, isSuccess, data) {
    const { loadedMaps, failedMaps } = this.state
    const pendingMapLoads = _.pull(this.state.pendingMapLoads, nextMapName)
    if (isSuccess)
    {
      _.remove(failedMaps, nextMapName)
      loadedMaps[nextMapName] = data
      this._startMapLoaded(data)
    }
    else 
    {
      failedMaps[nextMapName] = data
debugger  // TODO - stop game, no map.
    }
    const newIsPreloadingValue = pendingMapLoads.length > 0 ? 'actors' : null ///  TODO - handle pending tiles
    this.setState( { pendingMapLoads, loadedMaps, failedMaps, isPreloading: newIsPreloadingValue } )    
  }

  componentDidMount() {
    this._mounted = true
    this._loadStartMap()
    this.callDoBlit()
  }

  componentWillUnmount() { 
    this._mounted = false
  }

  render() {
    const { isPreloading, mapLoadError, activeMap } = this.state
    if (isPreloading)
      return <Preloader msg={isPreloading} />

    if (mapLoadError)
      return <MapLoadFailed err={mapLoadError} />

    return (
      <div>
      <Button icon='play' content='play' onClick={() => this.handlePlay()} />
      <br />
        <MageGameCanvas
            ref={c => {this._mageCanvas = c} } 
            cellsWide={ activeMap.metadata.width }
            cellsHigh={ activeMap.metadata.height }/>
      </div>
    )
  }
}

Mage.propTypes = {
  ownerName:        PropTypes.string.isRequired,      // eg 'dgolds'
  startMapName:     PropTypes.string.isRequired,      // eg 'mechanix.start map'
  isPaused:         PropTypes.bool.isRequired,        // If true, game is paused... doh
  fetchAssetByUri:  PropTypes.func.isRequired         // A function that can asynchronously load an asset by (assetid). returns a Promise
}

// TODO: showNpcMessage({message:"Use the arrow keys to move/push and 'Enter' to shoot (if allowed)", leftActor:playerActor})
