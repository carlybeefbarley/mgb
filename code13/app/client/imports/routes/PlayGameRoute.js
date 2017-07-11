import _ from 'lodash'
import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'

import Spinner from '/client/imports/components/Nav/Spinner'
import ThingNotFound from '/client/imports/components/Controls/ThingNotFound'
import Helmet from 'react-helmet'

import { makeChannelName} from '/imports/schemas/chats'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'
import { utilShowChatPanelChannel, utilLinkToChatPanelChannel } from '/client/imports/routes/QLink'
import { isValidCodeGame, isValidActorMapGame } from '/imports/schemas/assets'

import { makeAssetInfoFromAsset } from '/imports/schemas/assets/assets-client'

import { Header, Icon, Label, Message, Popup, Segment } from 'semantic-ui-react'
import Mage from '/client/imports/components/MapActorGameEngine/Mage'
import { fetchAssetByUri } from '/client/imports/helpers/assetFetchers'
import QLink from '/client/imports/routes/QLink'
import SpecialGlobals from '/imports/SpecialGlobals'
import Toolbar from '/client/imports/components/Toolbar/Toolbar'
import AssetChatDetail from '/client/imports/components/Assets/AssetChatDetail'

import elementResizeDetectorMaker  from 'element-resize-detector'

import { getAssetHandlerWithContent2, makeCDNLink } from '/client/imports/helpers/assetFetchers'

import { TAB } from '/client/imports/Mobile/MobileNav'

import './playGame.css'

// TODO: The debounce / throttle needs to move to the server really
const _incrementPlayCount = _.debounce(
  assetId => { Meteor.call('job.gamePlayStats.playGame', assetId) },
  SpecialGlobals.gamePlay.playCountDebounceMs,
  { leading: true } // So the play count increases immediately
)

const _styleGameNavButtons = { float: 'right' }

const GameTypeDetail = ( { game, style } ) => {
  if (!game)
    return null

  const linkToAsset = `/u/${game.dn_ownerName}/asset/${game._id}`

  if (isValidCodeGame(game))
    return (
      <Popup
          size='small'
          position='bottom right'
          trigger={(
            <QLink to={linkToAsset} style={style}>
              <Label
                basic
                style={style}
                id="mgbjr-asset-edit-header-right-chat"
                size='small'
                icon={{ name: 'code', style: { marginRight: 0 } }}
                />
            </QLink>
          )}
          header='Code-based Game'
          content='This game is written in JavaScript. Click the icon above to open the game configuration file.'
          />
    )
  if (isValidActorMapGame)
    return (
      <Popup
        size='small'
        position='bottom right'
        trigger={(
          <QLink to={linkToAsset} style={style}>
            <Label
              basic
              style={style}
              id="mgbjr-asset-edit-header-right-chat"
              size='small'
              icon={{ name: 'map', color: 'blue', style: { marginRight: 0 } }}
              />
          </QLink>
        )}
        header='ActorMap-based Game'
        content='This game has no custom JavaScript code; instead it has been made using Actors and ActorMaps. Click the icon above to open the game configuration file.'
        />
  )
  return null
}

const RotateScreen = props => {
  const style = {}
  if('portrait' in props)
    style.transform = 'rotate(90deg)'


  return (
    <div className='rotate-screen' style={style}>
      <Icon name="mobile" className='shadow' />
      <Icon name="mobile" />
      <Icon name="repeat" className='share' />
    </div>
  )
}


class PlayCodeGame extends React.Component {
  constructor(...a){
    super(...a)
    this.state = {
      isFullScreen: false
    }
  }
  shouldComponentUpdate(newprops, newstate) {
    return newstate.isFullScreen !== this.state.isFullScreen
  }

  componentDidMount(){
    this.container = document.getElementById('locationPopup') /* mobile */ || document.getElementById('mgb-jr-main-container')
    if (!this.container)
      throw(new Error("Main container cannot be found."))

    this.adjustIframeSize()
    this.onresize = _.debounce( () => {
      this.adjustIframeSize()
    }, 16, {leading: false, trailing: true})

    this.erd = elementResizeDetectorMaker({
      strategy: "scroll" //<- For ultra performance.
    })
    this.erd.listenTo(this.container, this.onresize)
  }

  // cleanup
  componentWillUnmount(){
    this.erd.removeListener(this.container, this.onresize)

    this.exitFullScreen()

    /*
    window.removeEventListener('resize', this.onresize)
    clearTimeout(this.resizeTimeout)*/
  }

  /**
   * Adjusts iframe - to fit in the current window
   * */
  adjustIframeSize() {
    // fullscreen - don't adjust anything
    // TODO: debug case without ref...
    if (!this.refs.iframe)
      return

    const container = this.container

    const style = this.refs.wrapper.style
    const outerBox = this.state.isFullScreen
      ? {width: window.innerWidth, height: window.innerHeight}
      : container.getBoundingClientRect()
    const box = this.refs.wrapper.getBoundingClientRect()



    let gameWidth = outerBox.width - box.left * 2
    let gameHeight = outerBox.height - box.top


    // this happens when iframe is in fullscreen mode
    // TODO: this looks more like an fullscreen API browser specific exploit
    // TODO: find a better way to scale game into fullScreen mode
    if(gameWidth < 0 || gameHeight < 0) {
      gameWidth = this.refs.iframe.offsetWidth
      gameHeight = this.refs.iframe.offsetHeight
    }

    style.height = gameHeight + 'px'
    style.width = gameWidth + 'px'
    style.textAlign = "left"

    const {width, height} = this.props.metadata
    const setScale = () => {
      const sx = gameWidth / width
      const sy = gameHeight / height
      const scale = Math.min(sx, sy)
      // this happens when iframe is in fullscreen mode
      if(scale < 0)
        return

      this.refs.iframe.style.transform = 'scale(' + scale + ')'
      if(scale < 1) {
        const shift = (gameWidth - width * scale) * 0.5
        if(shift > 0)
          this.refs.iframe.style.marginLeft = shift + 'px'
        else {
          this.refs.iframe.style.marginLeft = 0
        }
      }
    }

    //if (width > gameWidth || height > gameHeight)
      setScale()

    if (this.props.metadata.allowFullScreen){
      this.fsListener = () => {
        // this means that iframe is in fullscreen mode!!!
        if (this.refs.iframe.offsetHeight === window.innerHeight) {
          //this.refs.iframe.style.transform = 'scale(1)'
        }
        else {
          //setScale()
          this.exitFullScreen()
        }
      }


      this.refs.iframe.onwebkitfullscreenchange = this.fsListener
      this.refs.iframe.onmozfullscreenchange = this.fsListener
      this.refs.iframe.onmsfullscreenchange = this.fsListener
    }
  }

  /**
   * Restarts on game (reloads iframe)
   * */
  restart() {
    if (this.refs.iframe) {
      // jquery only for cross browser support
      $(this.refs.iframe).attr("src", this.refs.iframe.src)
      this.props.incrementPlayCountCb()
    }
  }

  /**
   * Enables fullscreen on game's iframe
   * */
  fullscreen() {
      this.setFsManually()
  }

  setFsManually(){
    /*
    Don't open iframe in the fullScreen on mobile - we are already fully sized
    const rfs = this.refs.iframe.requestFullScreen
      || this.refs.iframe.webkitRequestFullScreen
      || this.refs.iframe.mozRequestFullScreen
      || this.refs.iframe.msRequestFullScreen

    if(rfs)
      rfs.call(this.refs.iframe)*/

    this.setState({isFullScreen: true}, () => {
      document.body.classList.add('fullscreen')
      this.adjustIframeSize()
    })
  }

  exitFullScreen = () => {
    this.setState({isFullScreen: false}, () => {
      document.body.classList.remove('fullscreen')
      this.adjustIframeSize()
    })
  }
  /**
   * Checks if we can offer fullscreen functionality
   * */
  canDoFullScreen() {
    return this.props.metadata.allowFullScreen
  }

  createConfig() {
    const toolbarConfig = {
      buttons: [
        {
          name: 'restart',
          label: 'Restart Game',
          icon: 'refresh',
          tooltip: 'Restart game',
          disabled: false,
          level: 1
//          shortcut: 'Alt+R'   // Restart keypress can't be done reliably because game can take focus. Fix #958 because this is nice-to-have but confusing
        }
      ]
    }

    if (this.canDoFullScreen()) {
      toolbarConfig.buttons.push({
        name: 'fullscreen',
        label: 'Fullscreen',
        icon: 'television',
        tooltip: 'Run game in Fullscreen',
        disabled: false,
        level: 1
//          shortcut: 'Alt+F'   // Full-screen keypress can't be done reliably because game can take focus. Fix #958 because this is nice-to-have but confusing
      })
    }

    return toolbarConfig
  }

  render() {
    const { metadata, owner} = this.props
    const _codeName = metadata.startCode


    let width = metadata.width ? metadata.width + 'px' : '100%' // fallback for older games
    let height = metadata.height ? metadata.height + 'px' : '100%' // fallback for older games

    if (!_codeName || _codeName === '')
      return <ThingNotFound type='CodeGame' id='""'/>

    const origin = window.location.origin || window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '')
    const colonPlace = _codeName.search(':')
    const [ ownerName, codeName ] = colonPlace == -1 ? [owner.profile.name, _codeName] : [_codeName.slice(0, colonPlace), _codeName.slice(colonPlace + 1)]

    // recover on missing asset
    const src = makeCDNLink(
                  metadata._ids && metadata._ids.startCode
                    ? `/api/asset/code/bundle/cdn/${metadata._ids.startCode}/${ownerName}/${codeName}?origin=${origin}`
                    : `/api/asset/code/bundle/cdn/${ownerName}/${codeName}?origin=${origin}`, null, true
                )

    return (
      <div>
        <Toolbar
          actions={this}
          name="PlayCodeGame"
          config={this.createConfig()}
          />
        <div ref='wrapper' style={
          this.state.isFullScreen
            ? {overflow: 'hidden', textAlign: 'center', position: "fixed", left: 0, right: 0, top: 0, bottom: '-3.5em', backgroundColor: '#000'}
            : {overflow: 'hidden', textAlign: 'center'} }>
          <iframe
            key={ 0 }
            ref="iframe"
            id="iFrame1"
            style={{ minWidth: width, minHeight: height, borderStyle: 'none', transformOrigin: '0 0' }}
            sandbox='allow-modals allow-same-origin allow-scripts allow-popups allow-pointer-lock'
            src={src}
            >
          </iframe>
        </div>
        { this.state.isFullScreen &&
          <Icon name="sidebar" size="big" className="burger"
                color="white"
                style={{
                  position: 'absolute', right: 0, top: 0, color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: '0.1em'
                }}
                onClick={this.exitFullScreen}
          />
        }
      </div>
    )
  }
}

//         src='/api/asset/code/bundle/AXhwYgg93roEsLCBJ'>

const PlayMageGame = ({ _mapName, owner, incrementPlayCountCb, availableWidth }) => {
  if (!_mapName || _mapName === '')
    return <ThingNotFound type='ActorGame' id='""'/>

  const colonPlace = _mapName.search(':')
  const [ ownerName, mapName ] = colonPlace == -1 ? [owner.profile.name, _mapName] : [_mapName.slice(0, colonPlace), _mapName.slice(colonPlace + 1)]

  return (
    <Mage
      availableWidth={availableWidth}
      ownerName={ownerName}
      startMapName={mapName}
      isPaused={false}
      playCountIncFn={incrementPlayCountCb}
      fetchAssetByUri={ uri => fetchAssetByUri(uri) }
      />
  )
}

const PlayGame = ({ game, user, incrementPlayCountCb, availableWidth }) => {
  if (!game.metadata)
    return (
      <Message
          warning
          content='This GameConfig Asset does not contain a game definition. Someone should edit it and fix that'/>
    )

  const helmet = (
    <Helmet
      title={`MGB: Play '${game.name}'`}
      titleTemplate="%s"
      meta={[
          {"name": "My Game Builder", "content": ""}
      ]} />
  )

  // landscape
  if(window.innerHeight < window.innerWidth) {
    if (!game.metadata.allowLandscape && game.metadata.allowPortrait)
      return <RotateScreen ladscape />
  }
  // portrait
  if(window.innerWidth < window.innerHeight) {
    if (!game.metadata.allowPortrait && game.metadata.allowLandscape)
      return <RotateScreen portrait />
  }

  switch (game.metadata.gameType) {
    case 'codeGame':
      if (!game.metadata.startCode || game.metadata.startCode === '')
        return (
          <Message
              warning
              content='This GameConfig Asset does not contain a link to the starting actorMap. Someone should edit it and fix that'/>
      )
      return (
        <div>
          { helmet }
          <PlayCodeGame metadata={game.metadata} owner={user} incrementPlayCountCb={incrementPlayCountCb}/>
        </div>
      )
    case 'actorGame':
      if (!game.metadata.startActorMap || game.metadata.startActorMap === '')
        return (
          <Message
              warning
              content='This GameConfig Asset does not contain a link to the starting Game Code file. Someone should edit it and fix that'/>
      )
      return (
        <div>
          { helmet }
          <PlayMageGame _mapName={game.metadata.startActorMap} owner={user} incrementPlayCountCb={incrementPlayCountCb} availableWidth={availableWidth}/>
        </div>
      )
    default:
      return (
        <Message
            warning
            content='This GameConfig Asset does not contain a game type definition. Someone should edit it and fix that'/>
      )
  }
}


export default PlayGameRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    params:           PropTypes.object,      // params.assetId is the ASSET id
    user:             PropTypes.object,
    hazUnreadAssetChat: PropTypes.bool,
    // currUser:         PropTypes.object,
    // currUserProjects: PropTypes.array,       // Both Owned and memberOf. Check ownerName / ownerId fields to know which
    // isSuperAdmin:     PropTypes.bool,
    // ownsProfile:      PropTypes.bool,        // true IFF user is valid and asset owner is currently logged in user
    handleSetCurrentlyEditingAssetInfo: PropTypes.func    // We should call this to set/clear current asset kind
  },

  getMeteorData: function () {
    const { params } = this.props
    const { assetId } = params
    const assetHandler = this.assetHandler = getAssetHandlerWithContent2(assetId, () => {
      if (this.assetHandler)
        this.forceUpdate()
    })

    if (this.assetHandler)
    {
      const { handleSetCurrentlyEditingAssetInfo } = this.props
      const { asset } = this.assetHandler
      if (asset && handleSetCurrentlyEditingAssetInfo)
      {
        const assetInfo = makeAssetInfoFromAsset( asset, 'Play' )
        handleSetCurrentlyEditingAssetInfo( assetInfo )
      }
    }

    return {
      get asset(){
        return assetHandler.asset
      },
      get loading(){
        return !assetHandler.isReady
      }
    }
  },

  incrementPlayCount: function () {
    const game = this.data.asset      // One Asset provided via getMeteorData()
    if (game && game._id)
      _incrementPlayCount(game._id)
  },

  //
  checkForImplicitIncrementPlayCount() {
    const game = this.data.asset      // One Asset provided via getMeteorData()
    if (game && game._id && game.metadata.gameType === 'codeGame' && !this.autoUpdateHasBeenHandled) {
      this.incrementPlayCount()
      this.autoUpdateHasBeenHandled = true
    }
  },

  componentDidMount: function () {
    this.checkForImplicitIncrementPlayCount()
  },

  componentWillUnmount: function () {
    if (this.assetHandler) {
      this.assetHandler.stop()
      this.assetHandler = null
      // Clear Asset kind status for parent App
      if (this.props.handleSetCurrentlyEditingAssetInfo)
        this.props.handleSetCurrentlyEditingAssetInfo( {} )
    }
  },
  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  componentDidUpdate () {
    this.checkForImplicitIncrementPlayCount()
  },

  handleChatClick() {
    const channelName = makeChannelName( { scopeGroupName: 'Asset', scopeId: this.props.params.assetId } )
    joyrideCompleteTag('mgbjr-CT-asset-play-game-show-chat')
    utilShowChatPanelChannel(this.context.urlLocation, channelName)
  },
  makeLinkToChat(){
    return makeChannelName( { scopeGroupName: 'Asset', scopeId: this.props.params.assetId } )
  },

  render: function () {
    if (this.data.loading)
      return <Spinner />

    if (!this.data.asset)
      return <ThingNotFound type='GameConfig Asset' id={params.assetId}/>
    const { params, user, hazUnreadAssetChat } = this.props
    const game = this.data.asset      // One Asset provided via getMeteorData()

    return (
      <Segment basic padded style={{ paddingTop: 0, paddingBottom: 0}}>
          <Header as='span'>
            <QLink to={`/u/${game.dn_ownerName}/asset/${game._id}`}>
              <Icon name='game'/>{game.name}
            </QLink>
          </Header>
        <small>&emsp;{((game.metadata && game.metadata.playCount) || 0) + ' Plays'}</small>
        <AssetChatDetail
          style={_styleGameNavButtons}
          hasUnreads={hazUnreadAssetChat}
          handleClick={this.handleChatClick}
          query={{_fp: this.makeLinkToChat()}}
          tab={TAB.CHAT}
        />
        <GameTypeDetail game={game} style={_styleGameNavButtons} />
        <PlayGame game={game} user={user} incrementPlayCountCb={this.incrementPlayCount} availableWidth={this.props.availableWidth} />
      </Segment>
    )
  }
})
