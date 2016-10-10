import _ from 'lodash'
import React, { PropTypes } from 'react'
import MageGameCanvas from './MageGameCanvas'
import { Segment } from 'semantic-ui-react'

// MapActorGameEngine (MAGE)

// This is the top-level React wrapper for the MapActorGameEngine
// We actually USE react also to make it easier to render things
// like inventory UI etc. That would be miserable otherwise :)

// The prop fetchAssetByUri is a supplied function that can obtain a specified asset. 
//  It takes a single parameter, uri, and returns a Promise

const Preloader = props => <Segment inverted>Preloading {props.msg}</Segment>
const MapLoadFailed = props => <Segment color='red' inverted>{props.err}</Segment>
const _mkMapUri = (ownerName, mapName) =>  `/api/asset/map/${ownerName}/${mapName}`
const _mkActorUri = (ownerName, actorName) =>  `/api/asset/full/${ownerName}/${actorName}`
const _mkGraphicUri = (ownerName, actorName) =>  `/api/asset/full/${ownerName}/${actorName}`

let _tweenCount = 0

// Naughty but nice for now.
const _HACK = self => window.DG = self

export default class Mage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isPreloading:       'map',   // Null if not preloading. String if preloading. Supercedes all other state
      mapLoadError:       null,    // Can be a string
      mapData:            null,    // Should be an asset of kind 'actormap'.. not 'map'
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

  callDoBlit() 
  {
    if (this._mageCanvas && !this.props.isPaused)
      this._mageCanvas.doBlit(this.state.mapData, this.state.loadedActors, this.state.loadedGraphics, _tweenCount++) 
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
        console.log('Load Graphic: ' + aName)
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
      console.log('Loaded graphic: ', aName)
      _.remove(failedGraphics, aName)
      loadedGraphics[aName] = data
      loadedGraphics[aName]._image = new Image()
      loadedGraphics[aName]._image.onload = (e) => {
        console.log('loaded ImageData for '+aName)
      }
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
        console.log('Load Actor: ' + aName)
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
      console.log('Loaded actor: ', aName)
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
     ), n => n!=='')

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

  _startMapLoaded(mapData) { 
    const actorNames = _.filter(_.union(mapData.mapLayer[0], mapData.mapLayer[1], mapData.mapLayer[2]), a => (a && a!==''))
    console.log('Actors to load = ', actorNames.join(','))
    if (actorNames.length)
    {
      this.setState( { mapData } )
      this.loadRequiredActors(actorNames)
    }
    else
      this.setState( { isPreloading: null, mapLoadError: `Map '${this._mkFriendlyMapName()}' contains no actors` } )
  }

  _startMapLoadFailed(data) { 
    console.log(`MAPLOAD ERROR: '${data}'`)
    this.setState( { isPreloading: null, mapLoadError: `Could not load map '${this._mkFriendlyMapName()}'` } )
  }


  componentDidMount() {
    const { ownerName, startMapName, fetchAssetByUri } = this.props
    fetchAssetByUri(_mkMapUri(ownerName, startMapName))
      .then( data => this._startMapLoaded(JSON.parse(data)))
      .catch( data => this._startMapLoadFailed(data) )
    this._mounted = true
    this.callDoBlit()
  }

  componentWillUnmount() {
    this._mounted = false
  }

  mageRef(c) {
    this._mageCanvas = c
  }

  render() {
    const { isPreloading, mapLoadError, mapData } = this.state
    if (isPreloading)
      return <Preloader msg={isPreloading} />

    if (mapLoadError)
      return <MapLoadFailed err={mapLoadError} />

    return (
      <div>
        { mapData.maxLayers }
        <MageGameCanvas ref={(c) => this.mageRef(c) } cellsWide={mapData.metadata.width} cellsHigh={mapData.metadata.height}/>
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