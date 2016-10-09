import React, { PropTypes } from 'react'
import MageGameCanvas from './MageGameCanvas'

// MapActorGameEngine (MAGE)

// This is the top-level React wrapper for the MapActorGameEngine
// We actually USE react also to make it easier to render things
// like inventory UI etc. That would be miserable otherwise :)

// The props fetchAssetFn is a supplied function that can obtain a specified asset. 
//  It takes a single parameter, request. The format of the request object is:
//        assetId:  id of asset to load.   If this is a >0 length string, this takes precedence over the alternative
//        assetFullName: of the form     assetname   or     ownername:assetname    this is not used if assetId is provided
//        onLoaded = 

export default class Mage extends React.Component {


  componentDidMount() {
//    const { ownerName, startMapName, isPaused } = this.props
  }


  componentWillUnmount() {
  }

  render() {
    return (
      <div ref={(c) => { this._baseDiv = c } }>
        <MageGameCanvas />
      </div>
    )
  }
}


Mage.propTypes = {
  ownerName:        PropTypes.string.isRequired,      // eg 'dgolds'
  startMapName:     PropTypes.string.isRequired,      // eg 'mechanix.start map'
  isPaused:         PropTypes.bool.isRequired,        // If true, game is paused... doh
  fetchAssetById:   PropTypes.func.isRequired,        // A function that can asynchronously load an asset by (assetid). returns a Promise
  fetchAssetByName: PropTypes.func.isRequired         // A function that can asynchronously load an asset by (username, assetname). returns a Promise
}