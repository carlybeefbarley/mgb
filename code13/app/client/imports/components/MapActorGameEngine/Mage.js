import _ from 'lodash'
import React, { PropTypes } from 'react'

import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

import MageGameCanvas from './MageGameCanvas'
import MageNpcDialog from './MageNpcDialog'
import MageInventoryDialog from './MageInventoryDialog'
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


export default class Mage extends React.Component {
  constructor(props) {
    super(props)

    registerDebugGlobal( 'mage', this, __filename, 'The active MapActorGameEngine instance')
    
    // Non-react state
    this._tweenCount = 0                // Tweencount for game loops
    this._mageCanvas = null             // MageGameCanvas ref
    this._gamePlayer = null             // Will be an instance of MagePlayGame class
    this._transitioningToMapName = null

    // React state
    this.state = {
      activeNpcDialog:        null,   // null or (see render() )
      isInventoryShowing:     null,
      isPlaying:              false,   
      isPreloading:           'map',   // Null if not preloading. String if preloading. Supercedes all other state
      mapLoadError:           null,    // Can be a string
      activeMap:              null,    // Should be an asset of kind='actormap'.. not kind='map'
    
      pendingMapLoads:        [],      // contains list of unique actorMap Names that have pending loads
      loadedMaps:             {},      // The loaded actor Data. Contains map of actorMapName -> actorMap
      failedMaps:             {},      // actorMaps that failed to load. Content is the error data
    
      pendingActorLoads:      [],      // contains list of unique actorNames that have pending loads
      loadedActors:           {},      // The loaded actor Data. Contains map of actorname -> actor
      failedActors:           {},      // Actors that failed to load. Content is the error data
    
      pendingGraphicLoads:    [],      // contains list of unique Graphics Names that have pending loads
      loadedGraphics:         {},      // The loaded Graphics Data. Contains map of actorname -> actor
      failedGraphics:         {}       // Graphics that failed to load. Content is the error data
    }
  }
  
  _mkFriendlyMapName() {
    return `${this.props.ownerName}.${this.props.startMapName}`
  }

  handleInventoryAction(action, item) {
    this._game && this._game.inventoryDialogActionHandler(action, item)
  }

  handleSetGameStatus(lineNum, text) {
    const line = lineNum ? this._statusLine1 : this._statusLine0
    line.innerText = text || ''
  }

  handleShowNpcDialog(npcDialogData) {  // can be null (meaning hide)
    this.setState( { activeNpcDialog: npcDialogData } )
  }

  handleSetInventoryVisibility(newVisibility) {
    this.setState( { isInventoryShowing: newVisibility } )
  }

  handleForceInventoryUpdate() {
    // This is a bit of a pain since the inventory object is in the _game object so can't be used as a prop.
    this.forceUpdate()      // Simple, brutal, effective.
  }

  handlePlay()
  {
    if (!this._mageCanvas)
      return

    if (this.props.playCountIncFn)
      this.props.playCountIncFn()

    this._game = new MagePlayGame()
    this._game.startGame(
      this.state.activeMap, 
      this.state.loadedActors, 
      this.state.loadedGraphics, 
      newMapName => this._transitionToNextMap(newMapName),
      (lineNum, txt) => this.handleSetGameStatus(lineNum, txt), 
      (npcDialogData) => this.handleShowNpcDialog(npcDialogData),
      (newViz) => this.handleSetInventoryVisibility(newViz),
      () => this.handleForceInventoryUpdate(),
      window)
    this.setState( { isPlaying : true })
  }

  handleStop()
  {
    if (!this._mageCanvas || !this._game)
      return

    this._game.endGame()
    this.setState( { 
      isPlaying:          false, 
      isInventoryShowing: false,
      activeNpcDialog:    null,
      activeMap:          this.state.loadedMaps[this.props.startMapName] 
    } )
  }

  callDoBlit()
  {
    if (this._mageCanvas && !this.props.isPaused)
    {
      const pendingLoads = this._countPendingLoads()

      if (!pendingLoads && this.state.activeMap && !this._game && this.props.hideButtons)
        this.handlePlay() // Hide Buttons implies autoplay      

      try
      {
        if (this._game) {
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
      catch (e)
      {
        console.error('Caught exception in callDoBlit() for MapActor Game loop ', e)
      }
    }
    if (this._mounted)
      window.requestAnimationFrame( () => this.callDoBlit() )
  }

  // Load any actors that we don't already have in state.actors or pendingActorLoads
  _loadRequiredGraphics(desiredGraphicNames, oName)
  {
    const { fetchAssetByUri} = this.props
    const ownerName = oName ? oName : this.props.ownerName

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
      loadedGraphics[aName]._image.onload = (e, err) => { 
        if (err) 
        {
          console.log('error loading ImageData for '+aName, err)
          debugger
        }
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
        pendingActorLoads.push(aName)
        const p = _resolveOwner(ownerName, aName)

        fetchAssetByUri(_mkActorUri(ownerName, aName))
          .then(  data => this._actorLoadResult(aName, p.ownerName, true, JSON.parse(data)) )
          .catch( data => this._actorLoadResult(aName, p.ownerName, false, data) )
      }
    })
    this.setState( { pendingActorLoads } )    // and maybe isPreloading? use a _mkIisPreloadingFn 
  }

  _actorLoadResult(aName, oName, isSuccess, data) {
    const { loadedActors, failedActors } = this.state
    const pendingActorLoads = _.pull(this.state.pendingActorLoads, aName)
    if (isSuccess)
    {
      _.remove(failedActors, aName)
      loadedActors[aName] = data
      this._loadRequiredAssetsForActor(data.content2, oName)
    }
    else
      failedActors[aName] = data
    const newIsPreloadingValue = this._countPendingLoads() > 0 ? 'actors' : null ///  TODO - handle pending tiles
    this.setState( { pendingActorLoads, loadedActors, failedActors, isPreloading: newIsPreloadingValue } )    
  }

  // An actor can also require other actors or tiles
  _loadRequiredAssetsForActor(actor, oName)
  {
    // Load any referenced graphics
    const desiredGraphicNames = _.filter(_.union(
      [actor.databag.all.defaultGraphicName],           // TODO: warn if this is blank
      _.map(actor.animationTable, r => r.tileName)
      // any other Tiles mentioned in databags?  I don't think so..
     ), n => (n && n!==''))

    this._loadRequiredGraphics(desiredGraphicNames, oName)

    // Add names of any referenced actors to list of desiredActors
    let desiredActorNames = []
    const _addReferencedActors = ( bagName, paramsList ) => {
      const paramsArray = paramsList.split(',')
      const bag = actor.databag[bagName]
      _.each(paramsArray, p => {
        if (bag && bag[p] && bag[p] !== '')
          desiredActorNames.push(bag[p])
      })
    }
    _addReferencedActors('allchar',   'shotActor')
    _addReferencedActors('item',      'equippedNewShotActor,equippedNewActorGraphics')
    _addReferencedActors('npc',       'takesObjectOnChoice1,dropsObjectOnChoice1')
    _addReferencedActors('npc',       'takesObjectOnChoice2,dropsObjectOnChoice2')
    _addReferencedActors('npc',       'takesObjectOnChoice2,dropsObjectOnChoice3')
    _addReferencedActors('itemOrNPC', 'dropsObjectWhenKilledName,dropsObjectWhenKilledName2')
    _addReferencedActors('itemOrNPC', 'dropsObjectRandomlyName,conditionsActor')
    _addReferencedActors('item',      'keyForThisDoor')

    desiredActorNames = _.uniq(desiredActorNames)  // dedupe the list
    this.loadRequiredActors(desiredActorNames, oName)
  }

  _countPendingLoads() { 
    return this.state.pendingActorLoads.length + this.state.pendingMapLoads.length + this.state.pendingGraphicLoads.length
  }

  _startMapLoaded(activeMap) { 
    const { startMapName } = this.props    
    if (!this.state.loadedMaps[startMapName])
      this.state.loadedMaps[startMapName] = activeMap    // Store it for next time
    const actorNames = _.filter(_.union(activeMap.mapLayer[0], activeMap.mapLayer[1], activeMap.mapLayer[2]), a => (a && a!==''))
    if (actorNames.length)
    {
      this.setState( { activeMap, loadedMaps: this.state.loadedMaps } )
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
    const mapData = this.state.loadedMaps[startMapName]
    if (mapData)
      this._startMapLoaded(mapData)
    else
    {
      fetchAssetByUri(_mkMapUri(ownerName, startMapName))
        .then( data => this._startMapLoaded(JSON.parse(data)))
        .catch( data => this._startMapLoadFailed(data) )
    }  
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
    this.callDoBlit()           //  Starts the game+render loop
  }

  componentWillUnmount() { 
    this.handleStop()           //  Clean up game engine state - particularly key handlers
    this._mounted = false       //  This will implicitly stop the callDoBlit() game+render loop
  }

  render() {
    const { isPreloading, mapLoadError, activeMap, isPlaying, activeNpcDialog, isInventoryShowing } = this.state
    if (isPreloading)
      return <Preloader msg={isPreloading} />

    if (mapLoadError)
      return <MapLoadFailed err={mapLoadError} />

    return (
      <div>
        { !this.props.hideButtons &&
          <div style={{marginBottom: "5px"}}>
            <Button disabled={isPlaying} icon='play' content='play' onClick={() => this.handlePlay()}/>
            <Button disabled={!isPlaying} icon='stop' content='stop' onClick={() => this.handleStop()}/>
          </div>
        }

        <MageGameCanvas
            ref={c => { this._mageCanvas = c } } 
            cellsWide={ activeMap.metadata.width }
            cellsHigh={ activeMap.metadata.height }/>
        { !!activeNpcDialog && 
            <MageNpcDialog
                ref={c => { this._npcDialog = c } }
                message={activeNpcDialog.message}
                choices={activeNpcDialog.choicesArray}
                graphics={this.state.loadedGraphics}
                leftActor={activeNpcDialog.leftActor}
                activeActor={activeNpcDialog.activeActor}
                responseCallbackFn={choiceNum => { activeNpcDialog.responseCallbackFn(choiceNum) }} />
        }
        { !!isInventoryShowing && 
          <MageInventoryDialog
            inventory={this._game.inventory}
            graphics={this.state.loadedGraphics}
            itemActionFn={(action, item) => this.handleInventoryAction(action, item)} />
        }
        <br />
        <span ref={ c => { this._statusLine0 = c } }></span>
        <br />
        <span ref={ c => { this._statusLine1 = c } }></span>
        <br />
      </div>
    )
  }
}

Mage.propTypes = {
  ownerName:        PropTypes.string.isRequired,      // eg 'dgolds'
  startMapName:     PropTypes.string.isRequired,      // eg 'mechanix.start map'
  isPaused:         PropTypes.bool.isRequired,        // If true, game is paused... doh
  fetchAssetByUri:  PropTypes.func.isRequired,        // A function that can asynchronously load an asset by (assetid). returns a Promise
  hideButtons:      PropTypes.bool,                   // If true, then don't show the standard buttons. This implies autoplay..
  playCountIncFn:   PropTypes.func                    // If provided, call it back (no params) to increment the play count. The function will handle debounce and other stuff
}

// TODO: showNpcMessage({message:"Use the arrow keys to move/push and 'Enter' to shoot (if allowed)", leftActor:playerActor})
