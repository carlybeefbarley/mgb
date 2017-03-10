"use strict"
var update = require('react-addons-update')

import _ from 'lodash'
import React, { PropTypes } from 'react'
import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import TutorialMentor from './TutorialEditHelpers'

import Toolbar from '/client/imports/components/Toolbar/Toolbar.js'
import { showToast, addJoyrideSteps, joyrideDebugEnable } from '/client/imports/routes/App'
import { joyrideCompleteTag } from '/client/imports/Joyride/Joyride'

import moment from 'moment'
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js'
import { templateCode } from './templates/TemplateCode.js'
import { templateTutorial } from './templates/TemplateTutorial.js'
import { js_beautify } from 'js-beautify'
import CodeMirror from '../../CodeMirror/CodeMirrorComponent.js'
import ConsoleMessageViewer from './ConsoleMessageViewer.js'
import SourceTools from './SourceTools.js'
import CodeFlower from './CodeFlowerModded.js'
import GameScreen from './GameScreen.js'
import CodeChallenges from './CodeChallenges.js'
import CodeTutorials from './CodeTutorials.js'
import makeBundle from '/imports/helpers/codeBundle'
import { makeCDNLink, mgbAjax } from '/client/imports/helpers/assetFetchers'

import Thumbnail from '/client/imports/components/Assets/Thumbnail'

import getCDNWorker from '/client/imports/helpers/CDNWorker'
// import tlint from 'tern-lint'
import validJSName from '/client/imports/helpers/validJSName'

// **GLOBAL*** Tern JS - See comment below...
import scoped_tern from "tern"
window.tern = scoped_tern   // 'tern' symbol needs to be GLOBAL due to some legacy non-module stuff in tern-phaser

// Tern 'definition files'
// import "tern/lib/def"     // Do I need? since I'm doing it differently in next 2 lines...
// import Defs_ecma5 from "./tern/Defs/ecma5.json"
// import Defs_browser from './tern/Defs/browser.json'

import JsonDocsFinder from './tern/Defs/JsonDocsFinder.js'

import InstallMgbTernExtensions from './tern/MgbTernExtensions.js'
import "codemirror/addon/tern/tern"
import "codemirror/addon/comment/comment"

import FunctionDescription from './tern/FunctionDescription.js'
import ExpressionDescription from './tern/ExpressionDescription.js'
import RefsAndDefDescription from './tern/RefsAndDefDescription.js'
import TokenDescription from './tern/TokenDescription.js'
import ImportHelperPanel from './tern/ImportHelperPanel.js'

import DebugASTview from './tern/DebugASTview.js'

import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

import SpecialGlobals from '/imports/SpecialGlobals'

const THUMBNAIL_WIDTH = SpecialGlobals.thumbnail.width
const THUMBNAIL_HEIGHT = SpecialGlobals.thumbnail.height

import { isPathChallenge, isPathCodeTutorial } from '/imports/Skills/SkillNodes/SkillNodes.js'

let showDebugAST = false    // Handy thing while doing TERN dev work


// NOTE, if we deliver phaser.min.js from another domain, then it will
// limit the error handler's knowledge of that code - see 'Notes' on
// https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
//   BAD:  return "//cdn.jsdelivr.net/phaser/" + phaserVerNNN + "/phaser.min.js"


// we are delaying heavy jobs for this amount of time (in ms) .. e.g. when user types - there is no need to re-analyze all content on every key press
// reasonable value would be equal to average user typing speed (chars / second) * 1000
const CHANGES_DELAY_TIMEOUT = SpecialGlobals.editCode.typingSpeed

const _infoPaneModes = [
  { col1: 'ten',     col2: 'six'   },
  { col1: 'sixteen', col2:  null   },
  { col1: 'six',     col2: 'ten'   },
  { col1: 'eight',   col2: 'eight' },
]


// Code asset - Data format:
//
// content2.src                     // String with source code

export default class EditCode extends React.Component {
  // static PropTypes = {
  //   asset: PropTypes.object.isRequired
  //   canEdit: PropTypes.bool.isRequired
  //   editDeniedReminder: PropTypes.function
  //   handleContentChange: PropTypes.function.isRequired
  //   activitySnapshots: PropTypes.array               // can be null whilst loading
  // }

  constructor(props, context) {
    super(props)
    registerDebugGlobal( 'editCode', this, __filename, 'Active Instance of Code editor')

    this.fontSizeSettingIndex = undefined
    // save jshint reference - so we can kill it later
    this.jshintWorker = null

    this.userSkills = context.skills

    this.state = {
      _preventRenders: false,        // We use this as a way to batch updates.
      consoleMessages: [],
      gameRenderIterationKey: 0,
      isPlaying: false,
      previewAssetIdsArray: [],        // Array of { id: assetIdString, kind: assetKindString } e.g. { id: "asdxzi87q", kind: "graphic" }

      infoPaneMode: 0,                // See _infoPaneModes
      documentIsEmpty: true,          // until loaded

      // tern-related stuff:
      functionHelp: undefined,
      functionArgPos: -1,
      atCursorTypeRequestResponse: {},
      atCursorRefRequestResponse: {},
      atCursorDefRequestResponse: {},

      // Only for Tutorial Assets
      parsedTutorialData: null,   // null for not valid, or an object set by srcUpdate_AnalyzeTutorial()

      // handling game screen
      isPopup: false
    }

    this.hintWidgets = []
    this.errorMessageCache = {}
    // assume that new code will have errors - it will be reset on first error checking
    this.hasErrors = true

    // is this component is still active?
    this.isActive = true

    // store last saved value to prevent unnecessary updates and fancy behavior
    this.lastSavedValue = ""

    this.cursorHistory = {
      undo: [],
      redo: []
    }

    this.includeLocalImport = this.includeLocalImport.bind(this)
    this.includeExternalImport = this.includeExternalImport.bind(this)
  }


  handleJsBeautify() {
    let newValue = js_beautify(this._currentCodemirrorValue, { indent_size: 2, brace_style: 'expand' })
    this.codeMirror.setValue(newValue)
    this._currentCodemirrorValue = newValue
    let newC2 = {src: newValue}
    this.handleContentChange(newC2, null, `Beautify code`)
  }

  quickSave(){
    let newC2 = {src: this.codeMirror.getValue()}
    this.handleContentChange(newC2, null, `Save code`)
  }
  warnNoWriteAccess() {
    showToast("You don't have write access to this Asset", 'error')
  }

  componentDidMount() {
    const codeMirrorUpdateHints = this.codeMirrorUpdateHints
    // Debounce the codeMirrorUpdateHints() function
    this.codeMirrorUpdateHints = _.debounce(this.codeMirrorUpdateHints, 100, true)

    this.updateUserScripts()
    // previous debounce eats up changes
    this.codeMirrorUpdateHintsChanged = _.debounce(() => {
      codeMirrorUpdateHints.call(this, true)
    }, 100, true)

    this.listeners = {}
    this.listeners.joyrideCodeAction = event => {

      if (this.props.canEdit)
      {
        const newValue = this._currentCodemirrorValue + event.detail
        this.codeMirror.setValue(newValue)
        this._currentCodemirrorValue = newValue
        let newC2 = { src: newValue }
        this.handleContentChange(newC2, null, `Tutorial appended code`)
      }
      else
        this.warnNoWriteAccess()
    }


    window.addEventListener('mgbjr-stepAction-appendCode', this.listeners.joyrideCodeAction)

    this.listeners.joyrideHighlightCode = event => {
      this.highlightLines(parseInt(event.data.from, 10), parseInt(event.data.to))
    }
    window.addEventListener('mgbjr-highlight-code', this.listeners.joyrideHighlightCode)

    // Semantic-UI item setup (Accordion etc)
    $('.ui.accordion').accordion({exclusive: false, selector: {trigger: '.title .explicittrigger'}})

    this.startTernServer()
    // CodeMirror setup
    const textareaNode = this.refs.textarea
    let codemirrorOptions = {
      mode: (this.props.asset.kind === 'tutorial') ? 'application/json' : 'jsx',
      //json: this.props.asset.kind === 'tutorial',
      inputStyle: "textarea", // contentEditable is another option - but input on tablet then sux
      // change theme for read only?
      theme: "eclipse",
      styleActiveLine: true,
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 2,
      // to change at runtime: cm.setOption("readOnly", !this.props.canEdit)
      readOnly: !this.props.canEdit,    // Note, not reactive, so be aware of that if we do dynamic permissions in future.
      foldGutter: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      viewportMargin: 10,

      /*hintOptions: {
       completeSingle: false    //    See https://codemirror.net/doc/manual.html -> completeSingle
       },*/

      gutters: [
        "CodeMirror-lint-markers",
        "CodeMirror-linenumbers",
        "CodeMirror-foldgutter",
        "mgb-cm-user-markers"
      ],
      extraKeys: {
        "Alt-F": "findPersistent",
        "'.'": cm => {
          return this.codeEditPassAndHint(cm)
        },
        "Ctrl-Space": (cm) => {
          return this.codeEditShowHint(cm)
        },
        "Ctrl-I": (cm) => {
          this.ternServer.showType(cm)
        },
        "Ctrl-D": (cm) => {
          this.ternServer.showDocs(cm)
        },
        "Alt-J": (cm) => {
          this.ternServer.jumpToDef(cm)
        },
        "Ctrl-B": (cm) => {
          this.handleJsBeautify(cm)
        },
        "Ctrl-Q": (cm) => {
          this.ternServer.rename(cm)
        },
        "Ctrl-S": (cm) => {
          this.ternServer.selectName(cm)
        },
        "Ctrl-O": (cm) => {
          cm.foldCode(cm.getCursor())
        },
        "Ctrl-/": (cm) => {
          cm.execCommand("toggleComment")
        },
        "Alt-.": cm => this.goToDef(),
        "Alt-,": cm => this.goBack()
      },
      //lint: true,   // TODO - use eslint instead? Something like jssc?
      autofocus: true,
      highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true }
    }

    this.codeMirror = CodeMirror.fromTextArea(textareaNode, codemirrorOptions)
    // allow toolbar keyboard shortcuts from codemirror text area
    codemirrorOptions.inputStyle == 'textarea' && this.codeMirror.display.input.textarea.classList.add('allow-toolbar-shortcuts')

    this.updateDocName()
    this.doFullUpdateOnContentChange()

    this.codeMirror.on('change', this.codemirrorValueChanged.bind(this))
    this.codeMirror.on('cursorActivity', this.codeMirrorOnCursorActivity.bind(this, false))
    this.codeMirror.on('dragover', this.handleDragOver.bind(this))
    this.codeMirror.on('drop', this.handleDropAsset.bind(this))


    this.codeMirror.on('mousedown', this.handleDocumentClick.bind(this))
    this.codeMirror.on('keyup', (cm, e) => {
      if(e.ctrlKey && e.altKey) e.preventDefault()
      if(!this.props.canEdit) {
        if (e.ctrlKey || e.altKey || e.which == 17 /* CTRL key*/) {
          return
        }

        this.props.editDeniedReminder()
      }
    })

    this._currentCodemirrorValue = this.props.asset.content2.src || ''

    this.codeMirrorUpdateHintsChanged()

    this.codeMirror.getWrapperElement().addEventListener('wheel', this.handleMouseWheel.bind(this))

    this.codeMirror.setSize("100%", "500px")

    // Resize Handler - a bit complicated since we want to use to end of page
    // TODO: Fix this properly using flexbox/stretched so the content elements stretch to take remaining space.
    //       NOTE that the parent elements have the wrong heights because of a bunch of cascading h=100% styles. D'oh.
    var ed = this.codeMirror
    this.edResizeHandler = e => {
      const $sPane = $(".CodeMirror")
      const edHeight = window.innerHeight - ( 16 + $sPane.offset().top )
      ed.setSize("100%", `${edHeight}px`)
      $(".mgbAccordionScroller").css("max-height", `${window.innerHeight-16}px`)
      $(".mgbAccordionScroller").css("overflow-y", "scroll")
    }
    $(window).on("resize", this.edResizeHandler)
    this.edResizeHandler()
    this.updateDocName()
    this.doHandleFontSizeDelta(0, { force: true } )

    this.isActive = true

    this.cursorHistory = {
      undo: [],
      redo: []
    }

    this.highlightedLines = []
  }


  startTernServer() {
    // Tern setup
    var myTernConfig = {
      // in worker mode it's not possible to add defs and doc_comment plugin also can't add parsed defs
      // TODO: find workaround and uncomment
      useWorker: true,
      // load defs at runtime
      defs: [], //[Defs_ecma5, Defs_browser, Defs_lodash, Defs_phaser, Defs_sample],
      completionTip: function (curData) {
        // we get called for the CURRENTLY highlighted entry in the autocomplete list.
        // We are provided fields like
        //   name, type     ... pretty reliably
        //   doc, url       ... sometimes (depending on dataset)
        const doc = curData.doc ? curData.doc : ''
        return doc + (doc ? "\n\n" + curData.type : "")
      },
      workerDeps: [
        makeCDNLink("/lib/acorn/acorn.js"),
        makeCDNLink("/lib/acorn/acorn_loose.js"),
        makeCDNLink("/lib/acorn/walk.js"),
        makeCDNLink("/lib/tern/lib/signal.js"),
        makeCDNLink("/lib/tern/lib/tern.js"),
        makeCDNLink("/lib/tern/lib/def.js"),
        makeCDNLink("/lib/tern/lib/infer.js"),
        makeCDNLink("/lib/tern/lib/comment.js"),
        makeCDNLink("/lib/tern/plugin/modules.js"),
        makeCDNLink("/lib/tern/plugin/es_modules.js"),
        makeCDNLink("/lib/tern/plugin/doc_comment.js")
        //"/lib/tern/plugin/lint.js"
      ],
      plugins: {
        // modules: true, //we are injecting files directly - no need for additional module + it have
        comment: true,
        es_modules: true,
        /*lint: {
           rules:{
             ES6Modules: {
              severity: "none"
             }
           }
         },*/
        doc_comment: {
          strong: true
        }
      },
      workerScript: "/lib/workers/TernWorker.js"
      /*,
       responseFilter: function (doc, query, request, error, data) {
       // Woah - capture all the responses from the TernServer
       console.log("REQ", request, "  DATA", data)
       return data
       }*/
      // typeTip: function(..) this would be a function that creates a DOM element to render the typeTip
    }
    this.ternServer = new CodeMirror.TernServer(myTernConfig)
    if (!this.ternServer.server.addDefs) {
      this.ternServer.server.addDefs = (defs) => {
        // async - can be unmounted already
        this.ternServer && this.ternServer.worker.postMessage({
          type: "addDefs",
          defs: defs
        })
      }
    }
    // overwrite default function - so we can use replace
    this.ternServer.server.addFile = (name, text, replace) => {
      this.ternServer.worker.postMessage({type: "add", name, text, replace})
    }
    this.ternServer.server.getAstFlowerTree = (options, callback, filename = this.props.asset.name) => {
      if (!options.filename) {
        options.filename = filename
      }
      const getAstFlowerTree = (e) => {
        if (e.data.type != "flower")
          return
        this.ternServer.worker.removeEventListener("message", getAstFlowerTree)
        callback(e.data.data)
      }
      this.ternServer.worker.addEventListener("message", getAstFlowerTree)
      this.ternServer.worker.postMessage({
        type: "getAstFlowerTree",
        filename: options.filename,
        local: options.local
      })
    }

    this.tools = new SourceTools(this.ternServer, this.props.asset._id, this.props.asset.dn_ownerName)
    this.tools.onError(errors => {
      this.showError(errors)
    })

    this.tools.loadCommonDefs()
    InstallMgbTernExtensions(tern)
  }
  // update file name - to correctly report 'part of'
  updateDocName() {
    // don't update doc name until all required assets are loaded.
    // tern won't update itself after loading new import - without changes to active document
    if (this.state.astReady && this.lastName !== this.props.asset.name) {
      const doc = this.codeMirror.getDoc()
      if (this.ternServer && doc) {
        this.ternServer.delDoc(doc)
        this.ternServer.addDoc(this.props.asset.name, doc)
        this.lastName = this.props.asset.name
      }
    }
  }

  codeMirrorOnCursorActivity() {
    // Indirecting this to help with debugging and maybe some future optimizations
    this.codeMirrorUpdateHints(false)
  }

  componentWillUnmount() {
    $(window).off("resize", this.edResizeHandler)
    window.removeEventListener('mgbjr-stepAction-appendCode', this.listeners.joyrideCodeAction)
    window.removeEventListener('mgbjr-highlight-code', this.listeners.joyrideHighlightCode)

    // TODO: Destroy CodeMirror editor instance?

    this.terminateWorkers()

    if (this.changeTimeout) {
      window.clearTimeout(this.changeTimeout)
      this.changeTimeoutFn()
    }
    this.isActive = false
    this.cursorHistory = null
    this.highlightedLines = null
  }

  terminateWorkers() {
    this.jshintWorker && this.jshintWorker.terminate()
    this.jshintWorker = null

    // this also will terminate worker (if in worker mode)
    this.ternServer && this.ternServer.destroy()
    this.ternServer = null

    this.tools && this.tools.destroy()
  }
  // used only for debugging purposes
  restartWorkers() {
    // terminate all old workers
    this.terminateWorkers()
    // tern will start tool - and tools will start separate babel worker
    this.startTernServer()

    // jshint will start automatically on code changes

    // update all tools to current state
    this.doFullUpdateOnContentChange()
  }
  codeEditShowHint(cm) {
    // we could use specific keywords for tutorial
    if(this.props.asset.kind === "tutorial"){
      return TutorialMentor.showHint(cm, CodeMirror)
    }
    else if (this.props.canEdit && this.state.currentToken){
      if(this.state.currentToken.type == "comment")
        return CodeMirror.Pass
      if(this.state.currentToken.type == "string"){
        return this.showUserAssetHint(cm, CodeMirror, this.state.currentToken)
      }
      return this.ternServer.complete(cm)
    }
    return CodeMirror.Pass
  }

  // autocomplete options type: [{text: '', desc: ''}, ...]
  showCustomCMHint(cm, autocompleteOptions, keywordSubstring = 0){
    let tooltip = null
    // TODO: optimize - reuse tooltip
    const createTooltip = () => {
      const node = document.createElement("div")
      // same class as for JS tooltips
      node.className = "CodeMirror-Tern-tooltip CodeMirror-Tern-hint-doc"
      return node
    }
    const removeTooltip = () => {
      if(tooltip && tooltip.parentNode){
        tooltip.parentNode.removeChild(tooltip)
      }
    }

    const hintObj = {
      // hint will be called on every change
      hint: () => {

        const cursor = cm.getCursor()
        const token = cm.getTokenAt(cursor, true)
        const keyword = token.string.substring(1 + keywordSubstring, token.string.length - 1)

        // filter our list
        const list = autocompleteOptions.filter(a => {
          return !keyword || a.text.toLowerCase().startsWith(keyword.toLowerCase())
        })
        const from = Object.assign({}, cursor)
        from.ch = token.start + 1 + keywordSubstring  // keep quote

        const to = Object.assign({}, from)
        to.ch = token.end - 1 // keep quote

        list.sort((a, b) => {
          return a.text < b.text ? -1 : 1
        })
        const hints = {
          list, from, to,
          // completeSingle seems that is not working ?
          completeSingle: false
        }

        CodeMirror.on(hints, "select", (completion, element) => {
          // remove old tooltip
          removeTooltip()
          if(completion.desc){
            tooltip = createTooltip()
            tooltip.innerHTML = completion.desc
            // li < ul < body - by default
            element.parentNode.parentNode.appendChild(tooltip)
            const box = element.getBoundingClientRect()
            const ulbox = element.parentNode.getBoundingClientRect()

            tooltip.style.left = ulbox.left + ulbox.width + "px"
            tooltip.style.top = box.top + "px"
          }
        })
        CodeMirror.on(hints, "close", () => {
          removeTooltip()
          CodeMirror.off(hints, "close")
          CodeMirror.off(hints, "select")
          CodeMirror.on(hints, "shown")
        })
        return hints
      }
    }

    return cm.showHint(hintObj)
  }

  showUserAssetHint(cm, CodeMirror, token){
    // strip quotes
    const keyword = token.string.substring(1, token.string.length - 1)
    // this combo starts to repeat too often
    if(keyword && keyword.startsWith('/') && !keyword.startsWith('//')){
      const parts = keyword.split(':')
      // get hints for own assets
      if(parts.length == 1){
        //if(keyword.length < 2){
          this.showCustomCMHint(cm, this.state.userScripts, 1)
        //  return
        //}

        // we already know all user scripts - update only
        this.updateUserScripts()
        /*mgbAjax(`/api/assets/code/${Meteor.user().username}/?query=${keyword.substring(1)}`, (err, listStr) => {
          if (err)
            return
          this.showCustomCMHint(cm, JSON.parse(listStr), 1)
        })*/
      }
      // check if user exists at all? parts[0] - is username
      else if(parts.length == 2){
        const user = parts.shift()
        mgbAjax(`/api/assets/code/${user}/?query=${parts.shift()}`, (err, listStr) => {
          if(err)
            return
          this.showCustomCMHint(cm, JSON.parse(listStr), user.length + 1)
        })
      }
    }
    return CodeMirror.Pass
  }

  updateUserScripts(cb){
    if(Meteor.user()) {
      mgbAjax(`/api/assets/code/${Meteor.user().username}/?query=`, (err, listStr) => {
        // async call
        if(!this.isActive){
          return
        }
        if (err)
          return

        try {
          this.setState({"userScripts": JSON.parse(listStr)})
        }
        catch (e) {}
        cb && cb()
      })
    }
  }

  codeEditPassAndHint(cm) {
    if (this.props.canEdit)
      if (this.acTimeout) {
        window.clearTimeout(this.acTimeout)
        this.acTimeout = 0
      }
    this.acTimeout = setTimeout(() => {
      if (this.changeTimeout)
        return
      this.codeEditShowHint(cm)
    }, 1000)      // Pop up a helper after a second
// this.ternServer.getHint(cm, function (hint)
// {
// console.log("HINT",hint)
// })
    return CodeMirror.Pass       // Allow the typed character to be part of the document
  }

  // this method is triggered very very often due to activity snapshot
  componentWillReceiveProps(nextProps) {
    const newVal = nextProps.asset.content2.src
    if (this.codeMirror && newVal !== undefined && this._currentCodemirrorValue !== newVal && this.lastSavedValue != newVal) {
      // user is typing - intensively working with document - don't update until it finishes ( update will trigger automatically on finish )
      if (this.changeTimeout) {
        return
      }
      let currentCursor = this.codeMirror.getCursor()
      this.codeMirror.setValue(newVal)
      this.setState({needsBundle: nextProps.asset.content2.needsBundle})
      this._currentCodemirrorValue = newVal       // This needs to be done here or we will loop around forever
      this.codeMirror.setCursor(currentCursor)    // Note that this will trigger the source Analysis stuff also.. and can update activitySnapshots. TODO(@dgolds) look at inhibiting the latter
      // force update source tools related files
      this.doFullUpdateOnContentChange()
    }
  }

  // opts can be    force = true ... force a font change even if delta =0
  doHandleFontSizeDelta(delta, opts = {} ) {   // delta should be -1 or +1
    const fontSizes = [
      {fontSize: '8.5px', lineHeight: '10px'},    //  0
      {fontSize: '9px',   lineHeight: '11px'},    //  1
      {fontSize: '9px',   lineHeight: '12px'},    //  2
      {fontSize: '10px',  lineHeight: '12px'},    //  3
      {fontSize: '10px',  lineHeight: '13px'},    //  4
      {fontSize: '10px',  lineHeight: '14px'},    //  5
      {fontSize: '11px',  lineHeight: '15px'},    //  6
      {fontSize: '12px',  lineHeight: '16px'},    //  7
      {fontSize: '13px',  lineHeight: '17px'},    //  8
      {fontSize: '14px',  lineHeight: '19px'},    //  9
      {fontSize: '15px',  lineHeight: '19px'},    // 10
      {fontSize: '16px',  lineHeight: '20px'}     // 11
    ]

    if (this.fontSizeSettingIndex === undefined)
      this.fontSizeSettingIndex = 8

    // Changing font size - http://codemirror.977696.n3.nabble.com/Changing-font-quot-on-the-go-quot-td4026016.html
    let editor = this.codeMirror
    let validDelta = 0

    if (delta > 0 && this.fontSizeSettingIndex > 0)
      validDelta = -1
    else if (delta < 0 && this.fontSizeSettingIndex < fontSizes.length - 1)
      validDelta = 1

    if (Math.abs(validDelta) !== 0 || opts.force)   // Watch out for stupid -0 and NaN
    {
      this.fontSizeSettingIndex += validDelta
      var nfs = fontSizes[this.fontSizeSettingIndex]    // nfs:new font size
      editor.getWrapperElement().style["font-size"] = nfs.fontSize
      editor.getWrapperElement().style["line-height"] = nfs.lineHeight
      editor.refresh()
    }
  }

  // delta should be -1 or +1
  doHandleCommentFadeDelta(delta) {
    // 0. Set default Alpha now if it hasn't been set already
    if (this.CommentAlphaSetting === undefined)
      this.CommentAlphaSetting = 100   // Default is 100% Opacity

    // 1. Calculate new Alpha
    let alpha = this.CommentAlphaSetting
    alpha -= (delta * 10)              // 10% increments/decrements
    alpha = Math.min(alpha, 100)       // Keep between 100
    alpha = Math.max(alpha, 10)        // and 10
    this.CommentAlphaSetting = alpha

    // 2. Apply new Alpha using CSS magic
    let customCSSid = "idOfCustomMgbCSSforComments"
    let $sty = $(`#${customCSSid}`)
    $sty && $sty.remove()
    $('head').append(`<style id="${customCSSid}">.cm-comment { opacity: ${alpha / 100} }</style>`)
  }

  // Drag and Drop of Asset onto code area
  handleDragOver(cm, event) {


    if (this.props.canEdit) {
      DragNDropHelper.preventDefault(event)
      // change cursor style to indicate drop???
      cm.focus()
      // move cursor to exact drop location
      const cur = cm.getCursor()
      const coords = cm.coordsChar({left: event.clientX, top: event.clientY}, "window")
      cur.ch = coords.ch
      cur.line = coords.line
      // workaround - force codemirror to really update cursor - when moving happens on the same line
      if(cur.line == coords.line){
        cm.setCursor({line: 0, ch: 0})
      }

      cm.setCursor(coords)
    }
  }

  handleDropAsset(cm, event) {
    // TODO: check if this is phaser game.. do something other if phaser is not included
    if (this.props.canEdit)
    {
      const draggedAsset = DragNDropHelper.getAssetFromEvent(event)
      let url = null
      let code = null
      if (draggedAsset)
      {
        switch (draggedAsset.kind) {
        case 'graphic':
          url = `/api/asset/png/${draggedAsset._id}`
          code = `// Load ${draggedAsset.kind} Asset '${draggedAsset.name}' in PhaserJS:\n     game.load.image( '${draggedAsset.name}', '${url}' )`
          break
        case 'map':
          url = `/api/asset/map/${draggedAsset._id}`
          code = `// Load ${draggedAsset.kind} Asset '${draggedAsset.name}' in PhaserJS:\n     game.load.tilemap( '${draggedAsset.name}', '${url}' )`
          break
        case 'sound':
        case 'music':
          url = `/api/asset/${draggedAsset.kind}/${draggedAsset._id}/${draggedAsset.kind}.mp3`
          code = `// Load ${draggedAsset.kind} Asset '${draggedAsset.name}' in PhaserJS:\n     game.load.audio( '${draggedAsset.name}', '${url}' )`
          break
        case 'code':
          if (this.props.asset.dn_ownerName === draggedAsset.dn_ownerName)
            code = this.createImportString(draggedAsset.name)
          else
            code = `import ${validJSName(draggedAsset.name)} from './${draggedAsset.dn_ownerName}:${draggedAsset.name}'`

          break
        default:
          code = draggedAsset._id
        }
      }

      if (code)
      {
        event.preventDefault()
        this.codeMirror.replaceSelection( '\n' + code + '\n')
      }
    }
    else
      event.preventDefault()  // ReadOnly
  }

  // Alt-Shift Mousewheel will change the editor font Size
  handleMouseWheel(event) {
    // We only handle alt-shift + wheel or alt-wheel. Anything else is system behavior (scrolling etc)
    if (event.altKey === false)
      return

    event.preventDefault()     // No default scroll behavior in the cases we handle (alt-)

    // WheelDelta system is to handle MacOS that has frequent small deltas,
    // rather than windows wheels which typically have +/- 120
    this.mgb_wheelDeltaAccumulator = (this.mgb_wheelDeltaAccumulator || 0) + event.wheelDelta
    let wd = this.mgb_wheelDeltaAccumulator    // shorthand

    if (Math.abs(wd) > 60) {
      let delta = Math.sign(wd)
      if (event.shiftKey)
        this.doHandleFontSizeDelta(delta)
      else
        this.doHandleCommentFadeDelta(delta)
      this.mgb_wheelDeltaAccumulator = 0
    }
  }

  // TODO(@stauzs): add deeper analysis - would be really nice to - allow to change asset on include ??
  handleDocumentClick(cm, event) {
    const pos = cm.coordsChar({left: event.clientX, top: event.clientY})
    // click on the gutter
    if(pos.xRel < 0){
      return
    }
    const currentCursor = _.cloneDeep(this.codeMirror.getCursor())
    this.cursorHistory.undo.push(currentCursor)

    // do we really need to reset redo steps??? - test it
    this.cursorHistory.redo.length = 0
    if(this.cursorHistory.undo.length > SpecialGlobals.editCode.maxLengthOfCursorHistory){
      this.cursorHistory.undo.shift()
    }

    if (event.ctrlKey) {
      const token = cm.getTokenAt(pos, true)
      this.codeMirror.setCursor(pos)
      this.cursorHistory.undo.push(pos)
      this.ternServer.jumpToDef(cm)

      // disable multi select ?
      event.preventDefault() // if you don't want the cursor to move here.
    }
  }

  goToDef(){
    const currentCursor = _.cloneDeep(this.codeMirror.getCursor())
    this.cursorHistory.undo.push(currentCursor)

    this.ternServer.jumpToDef(this.codeMirror)
  }
  goBack(){
    const pos = this.cursorHistory.undo.pop()
    this.cursorHistory.redo.push(_.cloneDeep(this.codeMirror.getCursor()))

    this.codeMirror.setCursor(pos)
    //this.ternServer.jumpBack(this.codeMirror)
    this.codeMirror.focus()
  }
  goForward(){
    const currentCursor = _.cloneDeep(this.codeMirror.getCursor())
    this.cursorHistory.undo.push(currentCursor)

    const pos = this.cursorHistory.redo.pop()
    pos && this.codeMirror.setCursor(pos)
    //this.ternServer.jumpBack(this.codeMirror)
    this.codeMirror.focus()
  }

  _getMgbAssetIdsInLine(lineText) {
    //  let re = /api\/asset\/([a-z]+)\/([A-Za-z0-9]+)/g
    // TODO: split regexp for each case
    // load.mgbMap - as create takes in key (it may or may not be id) - not sure about this
    let re = /api\/asset\/([a-z]+)\/([A-Za-z0-9]+)|(load\.mgbMap)\s*\(\s*["'`]([A-Za-z0-9]+)["'`]\s*(,\s*["'`]\.\/([A-Za-z0-9\/]+)["'`])*\s*\)/g
    let matches = []
    let match
    while (match = re.exec(lineText) ) {
      // single arg fn
      if (match[3] === "load.mgbMap") {
        if (match[5])// second arg
          matches.push({id: match[6], kind: "map", refType: ""}) // :user/:name
        else
          matches.push({id: match[4], kind: "map", refType: "ID#"})
      }
      else
        matches.push({id: match[2], kind: match[1], refType: ""}) // :user/:name
    }
    return _.uniqBy(matches, 'id')
  }

  /** Just show the Clean Sheet helpers if there is no code */
  srcUpdate_CleanSheetCase() {
    this.setState({documentIsEmpty: this._currentCodemirrorValue.length === 0})
    if(this._currentCodemirrorValue.length === 0){
      joyrideCompleteTag('mgbjr-CT-EditCode-editor-clean')
    }
  }

  srcUpdate_AnalyzeTutorial() {
    const pj = TutorialMentor.parseJson(this._currentCodemirrorValue)
    this.setState( { parsedTutorialData: pj } )
  }

  /** Look for any MGB asset strings in current line or selection */
  srcUpdate_LookForMgbAssets() {
    // Extract Asset IDs in current line for 'Current line help' view
    let thisLine = this.codeMirror.getSelection(';')
    if (!thisLine || thisLine.length === 0) {
      const thisLineNum = this.codeMirror.getCursor().line
      thisLine = this.codeMirror.getLine(thisLineNum)
    }
    const AssetIdsAndKinds = this._getMgbAssetIdsInLine(thisLine)
    this.setState({previewAssetIdsArray: AssetIdsAndKinds})
  }

  /** Runs JSHINT on the user's code and show any relevant issues as widgets
   * directly below that code in CodeMirror. This was adapted from the demo code
   * at https://codemirror.net/demo/widget.html
   */
  srcUpdate_ShowJSHintWidgetsForCurrentLine(fSourceMayHaveChanged = false) {
    //return // TODO make this user-selectable
    const editor = this.codeMirror
    const currentLineNumber = editor.getCursor().line + 1     // +1 since user code is 1...

    const info = editor.getScrollInfo()
    const after = editor.charCoords({line: currentLineNumber, ch: 0}, "local").top
    if (info.top + info.clientHeight < after)
      editor.scrollTo(null, after - info.clientHeight + 3)
  }

  runJSHintWorker(code, cb) {
    if (this.props.asset.kind === "tutorial")
      return

    // terminate old busy worker - as jshint can take a lot time on huge scripts
    if (this.jshintWorker && this.jshintWorker.isBusy) {
      this.jshintWorker.terminate()
      this.jshintWorker = null
    }

    if (!this.jshintWorker) {
      // TODO: now should be easy to change hinting library - as separate worker - make as end user preference?
      this.jshintWorker = getCDNWorker("/lib/workers/JSHintWorker.js")
    }

    const conf = {
      browser: true,
      esversion: 6,
      asi: true,
      // globalstrict: true,
      // strict: "implied",
      undef: true,
      unused: true,
      loopfunc: true,
      // otherwise jshint will complain about some of these globals
      predef: {
        "alert": false,// why alert is not defined?
        //"require": false,
        //"exports": false,
        "Phaser": false,
        "PIXI": false,
        "console": false,
        "_": false
      }
    }

    this.jshintWorker.isBusy = true
    this.jshintWorker.onmessage = (e) => {
      this.jshintWorker.isBusy = false
      this.showErrors(e.data[0], true)
      cb && cb(e.data[0])
    }
    this.jshintWorker.postMessage([code, conf])
  }

  showErrors(errors, clear) {
    // TODO: allow user to change error level? Warning / Error?
    if (clear) {
      this.codeMirror.clearGutter("CodeMirror-lint-markers")
      this.errorMessageCache = {}
    }

    for (var i = 0; i < errors.length; ++i)
      this.showError(errors[i], clear)
  }

  showError(err, clear) {
    if (!err) return
    const msgs = this.errorMessageCache
    // get line
    if (!err.line || !clear) {
      const doc = this.codeMirror.getValue().split("\n")
      err.line = _.findIndex(doc, v => v.indexOf(err.evidence) > -1) + 1
    }
    const msg = msgs[err.line] ? msgs[err.line] : document.createElement("div")
    const errorText = " " + err.reason

    if (!msgs[err.line]) {
      msgs[err.line] = msg
      msg.icon = msg.appendChild(document.createElement("div"))
      if (err.code.substring(0, 1) == "W") {
        msg.icon.className = "CodeMirror-lint-marker-warning"
      }
      else {
        msg.icon.className = "CodeMirror-lint-marker-error"
      }
      msg.container = msg.appendChild(document.createElement("div"))
      msg.container.className = "lint-error-text"
    }
    else if (!msg.multi) {
      msg.multi = msg.icon.appendChild(document.createElement("div"))
      msg.multi.className = "CodeMirror-lint-marker-multiple"
    }

    // override warning icon to Error
    if (err.code.substring(0, 1) == "E") {
      msg.icon.className = "CodeMirror-lint-marker-error"
    }

    // don't show multiple messages with same text
    const index = _.findIndex(
        msg.container.children,
        child => child.childNodes[1].nodeValue == errorText
      )
    if(index > -1) return


    const text = msg.container.appendChild(document.createElement("div"))
    const ico = text.appendChild(document.createElement("div"))
    if (err.code.substring(0, 1) == "W") {
      ico.className = "CodeMirror-lint-marker-warning"
    }
    else {
      ico.className = "CodeMirror-lint-marker-error"
    }

    text.appendChild(document.createTextNode(errorText))

    msg.className = "lint-error"
    this.codeMirror.setGutterMarker(err.line - 1, "CodeMirror-lint-markers", msg)

    /*
     var evidence = msg.appendChild(document.createElement("span"))
     evidence.className = "lint-error-text evidence"
     evidence.appendChild(document.createTextNode(err.evidence))
     */
  }

  srcUpdate_GetInfoForCurrentFunction() {
    let ternServer = this.ternServer
    let editor = this.codeMirror
    if(!ternServer || !editor){
      return
    }
    let currentCursorPos = editor.getCursor()
    // we need to force internal tern cache to clean up - move cursor to 0,0 and then back
    // TODO: (stauzs) debug this in free time
    let {line, char} = currentCursorPos
    currentCursorPos.line = 0
    currentCursorPos.char = 0

    // get token at 0,0
    editor.getTokenAt(currentCursorPos, true)
    currentCursorPos.line = line
    currentCursorPos.char = char


    // get token at current pos
    let currentToken = editor.getTokenAt(currentCursorPos, true)

    // I stole the following approach from
    // node_modules/codemirror/addon/tern/tern.js -> updateArgHints so I could get ArgPos
    // which is otherwise not stored/exposed
    var argPos = -1
    if (!editor.somethingSelected()) {
      var state = currentToken.state
      var inner = CodeMirror.innerMode(editor.getMode(), state)
      if (inner.mode.name === "javascript") {
        var lex = inner.state.lexical
        if (lex.info === "call") {
          argPos = lex.pos || 0
          lex.pos = argPos
        }
      }
    }
    // this hint tooltip is still off when cursor is in the comment.. e.g.
    // fn(
    //  arg1, // comment about arg1
    //  arg2
    // )
    ternServer && ternServer.updateArgHints(this.codeMirror)

    var functionTypeInfo = null
    const _setState = (functionTypeInfo) => {
      if (functionTypeInfo) {
        JsonDocsFinder.getApiDocsAsync({
            frameworkName: functionTypeInfo.origin,
            //frameworkVersion: "x.x.x",
            symbolType: "method",
            symbol: functionTypeInfo.name || functionTypeInfo.exprName   // Tern can't always provide a 'name', for example when guessing
          },
          (originalRequest, result) => {
            // This callback will always be called, but could be sync or async
            this.setState({
              "helpDocJsonMethodInfo": result.data,
              "functionHelp": functionTypeInfo ? ternServer.cachedArgHints : {},
              "functionArgPos": argPos,
              "functionTypeInfo": functionTypeInfo || {},
              currentToken: currentToken
            })   // MIGHT BE SYNC OR ASYNC. THIS MATTERS. Maybe find a better way to handle this down in a component?
          })
      }
      else {
        this.setState({
          "functionHelp": functionTypeInfo ? ternServer.cachedArgHints : {},
          "functionArgPos": argPos,
          "helpDocJsonMethodInfo": null,
          "functionTypeInfo": functionTypeInfo || {},
          currentToken: currentToken
        })
      }
    }

    if (argPos !== -1) {
      ternServer.request(editor, "type",  (error, data) => {
        // async call - component may be unmounted already
        if(!this.isActive)
          return
        functionTypeInfo = error ? { error } : data
        _setState(functionTypeInfo)
      }, currentCursorPos)     // TODO - We need CodeMirror 5.13.5 so this will work
    }
    else
      _setState()
  }

  srcUpdate_GetRelevantTypeInfo() {
    let ternServer = this.ternServer
    let editor = this.codeMirror
    if(!ternServer || !editor){
      return
    }
    let position = editor.getCursor()
    let query = {
      type: "type",
      depth: 0
      //preferFunction: true
    }

    ternServer.request(editor, query, (error, data) => {
      // async call - component may be unmounted already
      if(!this.isActive)
        return
      if (error)
        this.setState({atCursorTypeRequestResponse: {"error": error}})
      else {
        if (data.type == data.name) {
          query.depth = 1
          ternServer.request(editor, query, (error, data) => {
            // async call - component may be unmounted already
            if(!this.isActive)
              return
            if (error)
              this.setState({atCursorTypeRequestResponse: {"error": error}})
            else {
              this.setState({atCursorTypeRequestResponse: {data}})
            }
          }, position)
        }
        else
          this.setState({atCursorTypeRequestResponse: {data}})
      }
    }, position)
  }

  srcUpdate_GetRefs() {
    let ternServer = this.ternServer
    let editor = this.codeMirror
    if(!ternServer || !editor){
      return
    }
    let position = editor.getCursor()

    ternServer.request(editor, "refs", (error, data) => {
      // async call - component may be unmounted already
      if(!this.isActive)
        return
      if (error)
        this.setState({atCursorRefRequestResponse: {"error": error}})
      else
        this.setState({atCursorRefRequestResponse: {data}})
    }, position)
  }

  srcUpdate_GetDef() {
    let ternServer = this.ternServer
    let editor = this.codeMirror
    if(!ternServer || !editor){
      return
    }
    let position = editor.getCursor()

    ternServer.request(editor, "definition", (error, data) => {
      // async call - component may be unmounted already
      if(!this.isActive)
        return
      if (error)
        this.setState({atCursorDefRequestResponse: {"error": error}})
      else {
        data.definitionText = (data.origin === this.props.asset.name && data.start) ? editor.getLine(data.start.line).trim() : null
        this.setState({atCursorDefRequestResponse: {data}})
      }
    }, position)
  }

  // srcUpdate_getProperties()
  // {
  /// This doesn't seem super useful. It's just an array of completion strings, no extra data
  //   let ternServer=this.ternServer
  //   let editor = this.codeMirror
  //   let position = editor.getCursor()
  //   var self = this

  //   ternServer.request(editor, "properties", function(error, data) {
  //     if (error)
  //       self.setState( { atCursorPropertiesRequestResponse: { "error": error } } )
  //     else
  //     {

  //       //data.definitionText = (data.origin === "[doc]" && data.start) ? editor.getLine(data.start.line).trim() : null
  //       self.setState( { atCursorPropertiesRequestResponse: { data } } )
  //     }
  //   }, position)
  // }


  srcUpdate_getMemberParent() {
    if (showDebugAST) {
      let ternServer = this.ternServer
      let editor = this.codeMirror
      if(!ternServer || !editor){
        return
      }
      let position = editor.getCursor()

      var query = {type: "mgbGetMemberParent"}

      ternServer.request(editor, query, (error, data) => {
        // async call - component may be unmounted already
        if(!this.isActive)
          return
        if (error)
          this.setState({atCursorMemberParentRequestResponse: {"error": error}})
        else {
          this.setState({atCursorMemberParentRequestResponse: {data}})
        }
      }, position)
    }
  }


  cm_updateActivityMarkers() {
    var ed = this.codeMirror
    ed.clearGutter("mgb-cm-user-markers")

    let acts = this.props.getActivitySnapshots()
    _.each(acts, act => {
      var currUserId = this.props.currUser ? this.props.currUser._id : "BY_SESSION:" + Meteor.default_connection._lastSessionId
      if (currUserId !== act.byUserId) {
        let marker = document.createElement("div")
        marker.style.color = "#822"
        const ago = moment(act.timestamp).fromNow()                   // TODO: Make reactive
        marker.title = "Being viewed by " + act.byUserName + ", " + ago
        let c = act.byUserName[0]
        marker.innerHTML = (c === "<" || !c) ? "?" : c
        ed.setGutterMarker(act.passiveAction.position.line, "mgb-cm-user-markers", marker)
      }
    })
  }

  // This gets called by CodeMirror when there is CursorActivity
  // This gets _.debounced in componentDidMount() and split into 2 parts +haveChanges
  codeMirrorUpdateHints(fSourceMayHaveChanged = false) {
    // Update the activity snapshot if the code line has changed
    // TODO: Batch this so it only fires when line# is changed
    if(!this.isActive){
      return
    }
    const editor = this.codeMirror
    const position = editor.getCursor()
    const { asset } = this.props
    const passiveAction = {
      position: position
    }
    snapshotActivity(asset, passiveAction)


    this.setState({_preventRenders: true})

    try {
      // TODO: update Read only???
      // TODO: Batch the async setState() calls also.
      this.srcUpdate_CleanSheetCase()
      this.srcUpdate_LookForMgbAssets()
      this.srcUpdate_ShowJSHintWidgetsForCurrentLine(fSourceMayHaveChanged)
      if (asset.kind === 'code')
      {
        this.srcUpdate_GetInfoForCurrentFunction()
        this.srcUpdate_GetRelevantTypeInfo()
        this.srcUpdate_GetRefs()
        this.srcUpdate_GetDef()
        this.srcUpdate_getMemberParent()
      }
      if (asset.kind === 'tutorial')
      {
        this.srcUpdate_AnalyzeTutorial()
      }
      // TODO:  See atInterestingExpression() and findContext() which are
      // called by TernServer.jumpToDef().. LOOK AT THESE.. USEFUL?
    }
    finally {
      this.setState({_preventRenders: false})
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(nextState._preventRenders || this.state.creatingBundle)
  }

  codemirrorValueChanged(doc, change) {
    // Ignore SetValue so we don't bounce changes from server back up to server
    if (change.origin !== "setValue") {
      const newValue = doc.getValue()
      this._currentCodemirrorValue = newValue
      let newC2 = {src: newValue}
      this.handleContentChange(newC2, null, "Edit code")
      this.codeMirrorUpdateHintsChanged(true)
    }
  }

  componentDidUpdate() {
    this.cm_updateActivityMarkers()
    this.updateDocName()
      const asset = this.props.asset
    // enable auto bundle by default
    if(asset.content2.needsBundle === void(0)){
      // disable code bundling for challenges
      if(!asset.skillPath){
        this.toggleBundling()
      }
    }
  }

  _consoleClearAllMessages() {
    this.setState({consoleMessages: []})
  }

  _consoleAdd(data) {
    // Using immutability helpers as described on https://facebook.github.io/react/docs/update.html
    let newMessages = update(this.state.consoleMessages, {$push: [data]}).slice(-10)
    this.setState({consoleMessages: newMessages})
    // todo -  all the fancy stuff in https://github.com/WebKit/webkit/blob/master/Source/WebInspectorUI/UserInterface/Views/ConsoleMessageView.js
  }

  _handle_iFrameMessageReceiver(event) {
    // there is no ref for empty code
    if (this.refs.gameScreen)   // TODO: This maybe a code smell that we (a) are getting a bunch more mesage noise than we expect (e.g. Meteor.immediate) and (b) that we should maybe register/deregister this handler more carefully
      this.refs.gameScreen.handleMessage(event)
  }

  handleScreenshotIFrame() {
    if (this.state.isPlaying)
      this._postMessageToIFrame({
        mgbCommand: 'screenshotCanvas',
        recommendedHeight: THUMBNAIL_HEIGHT            // See AssetCard for this size
      })
  }

  setAstThumbnail() {
    /*this.tools.getAST((list) => {
      /*
        list will contain objects with the following structure :
        {
          name,
          code,
          ast, // tern ast - can be empty e.g. for phaser - as phaser uses defs file
          tokens // tokens exported from babel ast ( there is no easy way to extract full babel ast from worker )
        }
      */

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    this.ternServer.server.getAstFlowerTree({
      local: false
    }, (tree) => {

      const w = $(this.refs.codeflower).width()
      const flower = new CodeFlower("#codeflower", w, w / canvas.width * THUMBNAIL_HEIGHT)

      flower.update(tree)

      // wait for animations...
      window.setTimeout(() => {
        // TODO: move this to codeFlower.. flower.toImage(callback)
        this.refs.codeflower.firstChild.setAttribute("xmlns","http://www.w3.org/2000/svg")

        const data = this.refs.codeflower.innerHTML

        const DOMURL = window.URL || window.webkitURL || window

        const img = new Image()
        const svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'})
        const url = DOMURL.createObjectURL(svg)

        img.onload = () => {
          ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
          this.props.asset.thumbnail = canvas.toDataURL('image/png')
          this.handleContentChange(null, this.props.asset.thumbnail, "update thumbnail")

          DOMURL.revokeObjectURL(url)
        }
        img.src = url
      }, 1000)
    })
  }

  drawAstFlower() {
    this.ternServer.server.getAstFlowerTree((tree) => {

      const w = $(this.refs.codeflower).width()
      const flower = new CodeFlower("#codeflower", w, w / THUMBNAIL_WIDTH * THUMBNAIL_HEIGHT)
      flower.update(tree)
      this.setState({
        astFlowerReady: true
      })
    })
  }

  drawAstFlowerForThumbnail() {
    this.ternServer.server.getAstFlowerTree({
        local: true
      }, (tree) => {
      const w = $(this.refs.codeflower).width()
      const flower = new CodeFlower("#codeflower", w, w / THUMBNAIL_WIDTH * THUMBNAIL_HEIGHT, {
        showNames: false,
        onclick: (node) => {
          // make node stay in place
          node.fixed = true

          const cm = this.codeMirror
          let char = 0
          const pos = {
            ch: 0,
            line: 0
          }
          if (!node.start) {
            cm.setCursor(pos)
            cm.focus()
            return
          }
          // we need to get line ch from char position
          cm.eachLine((line) => {
            if (node.start >= char && node.start < char + line.text.length) {
              pos.ch = node.start - char
              return true
            }
            pos.line++
            char += (line.text.length + 1)
          })
          cm.setCursor(pos)
          cm.focus()
        }
      })
      flower.update(tree)
      this.setState({
        astFlowerReady: true
      })
    })
  }

  drawAstFlowerFull() {
    this.ternServer.server.getAstFlowerTree({

    }, (tree) => {
      const w = $(this.refs.codeflower).width()
      const flower = new CodeFlower("#codeflower", w, w / THUMBNAIL_WIDTH * THUMBNAIL_HEIGHT, {
        showNames: true
      })
      flower.update(tree)
      this.setState({
        astFlowerReady: true
      })
    })
  }

  saveAstThumbnail() {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT
    ctx.fillStyle = 'rgba(153,204,153,0.2)'
    ctx.fillRect(0,0,canvas.width, canvas.height)

    this.refs.codeflower.firstChild.setAttribute("xmlns","http://www.w3.org/2000/svg")
    const data = this.refs.codeflower.innerHTML
    const DOMURL = window.URL || window.webkitURL || window

    const img = new Image()
    const svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'})
    const url = DOMURL.createObjectURL(svg)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
      this.props.asset.thumbnail = canvas.toDataURL('image/png')
      this.handleContentChange(null, this.props.asset.thumbnail, "update thumbnail")

      DOMURL.revokeObjectURL(url)
    }
    img.src = url
  }

  postToIFrame(cmd, data) {
    if (this.state.isPlaying) {
      data.mgbCommand = cmd
      this._postMessageToIFrame(data)
    }
  }

  _postMessageToIFrame(messageObject) {
    // there is no ref for empty code
    this.refs.gameScreen && this.refs.gameScreen.postMessage(messageObject)
    // this.iFrameWindow.contentWindow.postMessage(messageObject, "*")
  }

  /** Start the code running! */
  handleRun() {
    this._consoleClearAllMessages()
    if (!this.bound_handle_iFrameMessageReceiver)
      this.bound_handle_iFrameMessageReceiver = this._handle_iFrameMessageReceiver.bind(this)
    window.addEventListener('message', this.bound_handle_iFrameMessageReceiver)

    const { asset } = this.props

    this.setState({isPlaying: true})

    this.tools.collectSources((collectedSources) => {
      const startRun = () => {
        if (this.refs.gameScreen && this.refs.gameScreen.isIframeReady()) {
          this._postMessageToIFrame({
            mgbCommand: 'startRun',
            sourcesToRun: collectedSources,
            asset_id: asset._id,
            filename: asset.name || ""
          })
        }
        else{
          // ask iframe to tell parent that it is ready.. fix for very slow connections
          this._postMessageToIFrame({
            mgbCommand: 'approveIsReady'
          })
          window.setTimeout(startRun, 100)
        }
      }
      startRun()

    })



    const idx = Math.floor($('#mgbjr-EditCode-codeRunner').index() / 2)  //  because title + content for one entry
    // auto-close accordion above so there's space.
    for(let i=idx - 1; i > -1; i--){
      $('.ui.accordion').accordion('close', i)
    }
    // Make sure that it's really visible.. and also
    $('.ui.accordion').accordion('open', idx )
  }


  handleStop() {
    this.setState({
      gameRenderIterationKey: this.state.gameRenderIterationKey + 1, // or this.iFrameWindow.contentWindow.location.reload() ?
      isPlaying: false
    })
    window.removeEventListener('message', this.bound_handle_iFrameMessageReceiver)
  }
  handleFullScreen(id) {
    if (this.props.canEdit) {
      const urlToOpen = "about:blank"; //window.location.origin + '/api/blank' //- to work with pushState without reload
      let child = window.open(urlToOpen, "Bundle")
      child.document.write(
        `<h1>Creating bundle</h1>
<p>Please wait - the latest version of your game is being bundled and loaded</p>`
      )
      this.createBundle(() => {
        // clear previous data - and everything else
        if (!child.document) {
          child = window.open(urlToOpen, "Bundle")
        }
        const delayReloadIfSaving = () => {
          if(this.props.hasUnsentSaves || this.props.asset.isUnconfirmedSave)
            window.setTimeout(delayReloadIfSaving, 100)
          else {
            //child.history.pushState(null, "Bundle", `/api/asset/code/bundle/${id}`)
            child.location = `/api/asset/code/bundle/${id}`
          }
        }

        delayReloadIfSaving()
      })

    }
    else {
      window.open(`/api/asset/code/bundle/${id}`, "Bundle")
    }
  }
  createBundle(cb) {
    if(this.props.asset.kind == "tutorial"){
      return
    }
    if (this.state.creatingBundle) {
      cb && cb()
      return
    }
    if (this.props.canEdit) {
      this.setState({
        creatingBundle: true
      })
      this.tools.createBundle((bundle, notChanged) => {
        if(!notChanged){
          const value = this.codeMirror.getValue()
          const newC2 = {src: value, bundle: bundle, needsBundle: this.props.asset.content2.needsBundle}
          // make sure we have bundle before every save
          this.handleContentChangeAsync(newC2, null, `Store code bundle`)
        }
        if(this.isActive) {
          this.setState({
            creatingBundle: false
          })
        }
        cb && cb()
      })
    }
    else{
      cb && cb()
    }
  }

  handleGamePopup() {
    this.setState( { isPopup: !this.state.isPopup } )
  }

  pasteSampleCode(item) {   // item is one of the templateCodeChoices[] elements
    let newValue = item.code
    this.codeMirror.setValue(newValue)
    this._currentCodemirrorValue = newValue
    let newC2 = {src: newValue}
    this.handleContentChange(newC2, null, `Template code: ${item.label}`)
    const label = item.label.replace(/ /g, '-')
    joyrideCompleteTag('mgbjr-CT-EditCode-templates-'+label+'-invoke')
  }

  // Note that either c2 or thumbnail could be null/undefined.
  handleContentChange(c2, thumbnail, reason) {
    if(!c2){
      this.props.handleContentChange(c2, thumbnail, reason)
      return
    }
    c2.needsBundle = this.props.asset.content2.needsBundle
    //props trigger forceUpdate - so delay changes a little bit - on very fast changes
    if (this.changeTimeout) {
      window.clearTimeout(this.changeTimeout)
    }
    this.changeTimeoutFn = () => {
      // prevent asset changes to older one because of user activity forced update
      // sencond handle change will overwrite deferred save
      if(this.props.asset.kind == "tutorial") {
        this.changeTimeout = 0
        this.lastSavedValue = c2.src
        this.props.handleContentChange(c2, thumbnail, reason)
        return
      }
      this.doFullUpdateOnContentChange((errors) => {
        // it's not possible to create useful bundle with errors in the code - just save
        if(errors.length || !this.props.asset.content2.needsBundle){
          this.changeTimeout = 0
          this.lastSavedValue = c2.src
          this.props.handleContentChange(c2, thumbnail, reason)
        }
        else{
          // createBundle is calling handleContentChangeAsync after completion
          this.createBundle(() => {
            this.changeTimeout = 0
          })
        }
      })
    }

    this.changeTimeout = window.setTimeout(this.changeTimeoutFn, CHANGES_DELAY_TIMEOUT)
  }
  // this can be called even after component unmount.. or another asset has been loaded
  // make sure we don't overwrite another source
  handleContentChangeAsync(c2, thumbnail, reason) {
    // is this safe to use it here?
    if(this.isActive){
      this.lastSavedValue = c2.src
      this.props.handleContentChange(c2, thumbnail, reason)
    }
    else{
      console.log("Discarding bundle to prevent overwrite")
    }

  }
  // this is very heavy function - use with care
  // callback gets one argument - array with critical errors
  doFullUpdateOnContentChange( cb ) {
    // operation() is a way to prevent CodeMirror updates until the function completes
    // However, it is still synchronous - this isn't an async callback
    this.codeMirror.operation(() => {
      const val = this.codeMirror.getValue()
      this.runJSHintWorker(val, (errors) => {
        const critical = errors.filter(e => e.code.substr(0, 1) === "E")
        this.hasErrors = !!critical.length
        if (this.tools) {
          this.tools.collectAndTranspile(val, this.props.asset.name, () => {
            this.setState({
              astReady: true
            })
            // this will force to update mentor info - even if cursor wasn't moving
            // used in the case when we have pulled defs or new code in to tern server
            this.codeMirrorOnCursorActivity()
            cb && cb(critical)
          }, true)
        }
        else{
          cb && cb(critical)
        }
      })

    })
  }

  gotoLineHandler(line, file) {
    let pos = {line: line - 1, ch: 0}
    this.codeMirror.scrollIntoView(pos, 100)  //100 pixels margin
    this.codeMirror.setCursor(pos)

  }

  /** This is useful when working with Tern stuff..
   * It is Enabled by setting showDebugAST at top of this file
   */
  renderDebugAST() {
    if (showDebugAST && this.state.atCursorMemberParentRequestResponse)
      return <DebugASTview atCursorMemberParentRequestResponse={this.state.atCursorMemberParentRequestResponse}/>
  }

  toolZoomIn() {
    this.doHandleFontSizeDelta(-1)
  }

  toolZoomOut() {
    this.doHandleFontSizeDelta(1)
  }

  toolCommentFade() {
    this.doHandleCommentFadeDelta(1)
  }

  toolCommentUnFade() {
    this.doHandleCommentFadeDelta(-1)
  }

  toolToggleInfoPane() {
    const i = this.state.infoPaneMode
    const newMode = (i+1) % _infoPaneModes.length

    const oldMode = _infoPaneModes[this.state.infoPaneMode]
    const curMode = _infoPaneModes[newMode]
    // if(!_infoPaneModes[newMode].col2) this.handleStop()
    //
    if(this.state.isPlaying && (!oldMode.col2 || !curMode.col2) ){
      this.handleStop()
      this.handleRun()
    }

    this.setState( { infoPaneMode: newMode } )
  }

  generateToolbarConfig() {

    const config = {
      // level: 2,    // default level -- This is now in expectedToolbars.getDefaultLevel

      buttons: [
        { name: 'separator' },
        {
          name:  'toolToggleInfoPane',
          label: 'Info Panels',
          icon:  'resize horizontal',
          tooltip: 'Resize Info Pane',
          disabled: false,
          level:    1,
          shortcut: 'Ctrl+I'
        },
        { name: 'separator' },
        {
          name: 'goBack',
          icon: 'arrow left',
          level:    2,
          label: 'Go Back',
          tooltip: 'This action will move cursor to the previous location',
          disabled: !this.cursorHistory.undo.length,
          shortcut: 'Ctrl+Alt+LEFT'
        },
        {
          name: 'goForward',
          icon: 'arrow right',
          label: 'Go Forward',
          level:    2,
          tooltip: 'This action will move cursor to the next location',
          disabled: !this.cursorHistory.redo.length,
          shortcut: 'Ctrl+Alt+RIGHT'
        },
        { name: 'separator' },
        {
          name:  'toolZoomOut',
          label: 'Small Font',
          icon:  'zoom out',
          tooltip: 'Smaller Text',
          disabled: false,
          level:    2,
          shortcut: 'Ctrl+P'
        },
        {
          name:  'toolZoomIn',
          label: 'Large font',
          icon:  'zoom in',
          tooltip: 'Larger text',
          disabled: false,
          level:    2,
          shortcut: 'Ctrl+L'
        },
        { name: 'separator' },
        {
          name:  'handleJsBeautify',
          label: 'Beautify Code',
          icon:  'leaf',
          tooltip: 'Beautify: Auto-format your code',
          disabled: false,
          level:    3,
          shortcut: 'Ctrl+B'
        },
        { name: 'separator' },
        {
          name:  'toggleFold',
          label: this.mgb_code_folded ? 'Expand all nodes' : 'Fold all nodes',
          icon:  this.mgb_code_folded ? 'expand' : 'compress',
          tooltip: this.mgb_code_folded ? 'Unfold all nodes in the code' : 'Fold all nodes in the code',
          disabled: false,
          level:    3,
          shortcut: 'Ctrl+Shift+\\'
        },
        { name: 'separator' }
      ]
    }

    if (this.props.asset.kind === 'tutorial')
    {
      config.buttons.unshift( {
        name:     'stopTutorial',
        label:    'Stop Tutorial',
        icon:     'stop',
        tooltip:  'Stop Tutorial',
        disabled: false,
        level:    1
        // shortcut: 'Ctrl+T'
      })
      config.buttons.unshift( {
        name:     'tryTutorial',
        label:    'Try Tutorial',
        icon:     'student',
        tooltip:  'Try Tutorial',
        disabled: false,
        level:    1,
        shortcut: 'Ctrl+T'
      })
    }
    else    // code...
    {
      config.buttons.unshift( {
        name:     'handleStop',
        label:    'Stop Running',
        icon:     'stop',
        tooltip:  'Stop Running',
        disabled: !this.state.isPlaying,
        level:    1,
        shortcut: 'Ctrl+ENTER'
      })
      config.buttons.unshift( {
        name:     'handleRun',
        label:    'Run code',
        icon:     'play',
        tooltip:  'Run Code',
        disabled: this.state.isPlaying,
        level:    1,
        shortcut: 'Ctrl+ENTER'
      })
      config.buttons.push( {
        name:  'toolCommentFade',
        label: 'Fade Comments',
        icon:  'grey sticky note',
        tooltip: 'Fade Comments so you can focus on code',
        disabled: false,
        level:    3,
        shortcut: 'Ctrl+Alt+F'
      })
      config.buttons.push( {
        name:  'toolCommentUnFade',
        label: 'UnFade Comments',
        icon:  'sticky note',
        tooltip: 'UnFade comments so you can see them again',
        disabled: false,
        level:    3,
        shortcut: 'Ctrl+Alt+Shift+F'
      })
      config.buttons.push({ name: 'separator' })
      config.buttons.push( {
        name:  'toggleBundling',
        label: 'Auto Bundle code',
        icon:  'travel',
        tooltip: 'Before saving will merge all imports into single file',
        disabled: false,
        active: this.props.asset.content2.needsBundle,
        level:    3,
        shortcut: 'Ctrl+Alt+Shift+B'
      })

    }
    return config
  }

  toggleFold(){
    const cm = this.codeMirror

    cm.operation(() => {
      for (var l = cm.firstLine(); l <= cm.lastLine(); ++l)
        cm.foldCode({line: l, ch: 0}, null, this.mgb_code_folded ? 'unfold' : 'fold')

      this.mgb_code_folded = !this.mgb_code_folded
      this.setState({
        mgb_code_folded: this.mgb_code_folded
      })
    })

  }

  toggleBundling() {
    this.props.asset.content2.needsBundle = !this.props.asset.content2.needsBundle
    this.handleContentChange(this.props.asset.content2, null, "enableBundling")
    this.setState({needsBundle: this.props.asset.content2.needsBundle})
  }

  insertTextAtCursor(text) {
    if (!this.props.canEdit)
    {
      this.warnNoWriteAccess()
      return
    }
    const editor = this.codeMirror
    var doc = editor.getDoc()
    var cursor = doc.getCursor()
    doc.replaceRange(text, cursor)
  }

  tryTutorial() {
    const pj = TutorialMentor.parseJson(this._currentCodemirrorValue)

    if (pj.errorHintString)
    {
      showToast('JSON Parse error: ' + pj.errorHintString, 'error')
      if ( pj.errorCharIdx >=0 )
      {
        const editor = this.codeMirror
        editor.setCursor(editor.posFromIndex(pj.errorCharIdx))
        editor.focus()
      }
    }

    if (pj.data)
    {
      if (!_.has(pj.data, 'steps'))
        showToast("Tutorials must have a steps: [] array value", 'error')
      else
      {
        joyrideDebugEnable(true)
        addJoyrideSteps( pj.data.steps, { replace: true, origAssetId: { ownerName: this.props.asset.dn_ownerName, id: this.props.asset._id } } )
      }
    }
  }

  stopTutorial() {
    joyrideDebugEnable(false)
    addJoyrideSteps( [], { replace: true } )
  }

  createImportString(val){
    return `import ${validJSName(val)} from '/${val}'\n`
  }

  includeLocalImport(val){
    const imp = this.createImportString(val) + this.codeMirror.getValue()

    this.codeMirror.setValue(imp)
    this.handleContentChange({src: imp})
  }

  includeExternalImport(val){
    const imp = `import ${val.name} from '${val.import}'\n` + this.codeMirror.getValue()

    this.codeMirror.setValue(imp)
    this.handleContentChange({src: imp})
  }

  // TODO: add some sort of message to highlighted lines????
  highlightLines(from, to){
    // make from 1 -> 0 so it's not confusing
    from--
    if(to == void(0) || isNaN(to))
      to = from
    else
      to--

    if(from < 0){
      this.highlightedLines.forEach((lh) => {
        this.codeMirror.removeLineClass(lh, 'background', 'highlight')
      })
    }

    for(let i=from; i<=to; i++){
      const lh = this.codeMirror.getLineHandle(i)
      // reached end of the file
      if(!lh)
        return
      this.codeMirror.addLineClass(lh, 'background', 'highlight')
      this.highlightedLines.push(lh)
    }
    // scroll to first highlighted line
    if(from > -1)
      this.scrollToLine(from)
  }

  scrollToLine(line){
    this.codeMirror.setCursor(line, 0)
    var t = this.codeMirror.charCoords({line, ch: 0}, "local").top
    var middleHeight = this.codeMirror.getScrollerElement().offsetHeight / 2
    this.codeMirror.scrollTo(null, t - middleHeight - 5)
  }

  getStringReferences(){
    const token = this.state.currentToken
    const advices = []
    // TODO.. something useful with token.state?
    if(token && token.type == 'string' && this.state.userScripts && this.state.userScripts.length > 0){
      let string = token.string.substring(1, token.string.length -1)
      if(string.startsWith('/') && !string.startsWith('//')){
        string = string.substring(1)
        const parts = string.split(":")
        if(parts.length === 1){
          const script = this.state.userScripts.find(a => a.text == string)
          if(script){
            advices.push(
                <a className="ui fluid label" key={script.id} style={{marginBottom: "2px"}} href={`/assetEdit/${script.id}`} target='_blank'>
                  <small style={{fontSize: '85%'}}>this string references <strong>your</strong> code asset:
                    <code>{string}</code></small>
                  <Thumbnail assetId={script.id} expires={60} constrainHeight='60px'/>
                  <small>{script.desc}</small>
                </a>
            )
          }
        }
        // TODO: get link to asset
        else if(parts.length === 2){
          advices.push(
            <a className="ui fluid label" key={advices.length} style={{marginBottom: "2px"}} href={`/assetEdit/code/${parts.join('/')}`} target='_blank'>
              <small style={{fontSize: '85%'}}>this string references <strong>{parts[0]}</strong> code asset:
                <code>{parts[1]}</code></small>
              <Thumbnail assetId={parts.join('/')} expires={60} constrainHeight='60px'/>
            </a>
          )
        }
      }
    }
    return advices
  }

  getPrevToken(callback, cursor = null){
    const cur = cursor || Object.assign({}, this.codeMirror.getCursor())
    // TODO: maybe get correct last char of line instead for forcing random number?
    cur.ch = 100
    if(cur.line){
      cur.line--
      if(callback(this.codeMirror.getTokenAt(cur)))
        this.getPrevToken(callback, cur)
    }
  }
  getNextToken(callback, tokenIn, cursor = null){
    const cur = cursor || Object.assign({}, this.codeMirror.getCursor())
    const token = tokenIn || this.codeMirror.getTokenAt(cur)

    // TODO: maybe get correct last char of line instead for forcing random number?
    const line = this.codeMirror.getLine(cur.line)
    if(line === void(0))
      return

    if(cur.ch > line.length){
      cur.ch = 0
      cur.line++
    }
    else
      cur.ch = (tokenIn ? tokenIn.end : cur.ch) + 1
    const nextToken = this.codeMirror.getTokenAt(cur)
    // is this same token?
    if(nextToken.start == token.start && nextToken.end == token.end){
      this.getNextToken(callback, nextToken, cur)
    }
    else{
      if(callback(nextToken)){
        this.getNextToken(callback, nextToken, cur)
      }
    }
  }


  render() {
    const { asset, canEdit } = this.props

    if (!asset)
      return null

    const templateKind = asset.kind === 'tutorial' ? templateTutorial : templateCode
    const templateCodeChoices = templateKind.map(item => {
      const label = item.label.replace(/ /g, '-')
      return (
        <a className="item" id={"mgbjr-EditCode-template-"+label} key={item.label} onClick={this.pasteSampleCode.bind(this,item)}>
          <div className="ui green horizontal label">{item.label}</div>
          {item.description}
        </a>
      )
    })

    this.codeMirror && this.codeMirror.setOption("readOnly", !this.props.canEdit)

    // preview ID and String references doing very similar things. Refactor?
    const previewIdThings = this.state.previewAssetIdsArray.map(assetInfo => {
      return (
        <a className="ui fluid label" key={assetInfo.id} style={{marginBottom: "2px"}} href={`/assetEdit/${assetInfo.id}`} target='_blank'>
          <Thumbnail assetId={assetInfo.id} expires={60} constrainHeight='60px'/>
          URL references MGB <strong>{assetInfo.kind}</strong> asset {assetInfo.refType} {assetInfo.id}
        </a>
      )
    })
    const stringReferences = this.getStringReferences()



    const infoPaneOpts = _infoPaneModes[this.state.infoPaneMode]

    const tbConfig = this.generateToolbarConfig()

    let docEmpty = this.state.documentIsEmpty
    let isPlaying = this.state.isPlaying

    // const RunCodeIFrameStyle = {
    //   transform: "scale(0.5)",
    //   transformOrigin: "0 0",
    //   overflow: "hidden"
    // }


    const gameScreen = <GameScreen
        key="gameScreen"
        ref="gameScreen"
        isPopup = {this.state.isPopup || !infoPaneOpts.col2}
        isPlaying = {this.state.isPlaying}
        asset = {this.props.asset}
        consoleAdd = {this._consoleAdd.bind(this)}
        gameRenderIterationKey = {this.state.gameRenderIterationKey}
        handleContentChange = {this.handleContentChange.bind(this)}
        handleStop = {this.handleStop.bind(this)}
      />

    let isChallenge = false
    let isCodeTutorial = false
    if (asset.skillPath && asset.kind === 'code') {
      if (isPathChallenge(asset.skillPath))
        isChallenge = true
      else if (isPathCodeTutorial(asset.skillPath))
        isCodeTutorial = true
    }

    return (
      <div className="ui grid">
        { this.state.creatingBundle && <div className="loading-notification">Bundling source code...</div> }
        <div className={infoPaneOpts.col1 + ' wide column'} style={{ paddingTop: 0, paddingBottom: 0 }}>

          <div className="row" style={{marginBottom: "6px"}}>
            {<Toolbar actions={this} config={tbConfig} name="EditCode" ref="toolbar" />}
          </div>
            <div className={'accept-drop' + (this.props.canEdit ? '' : ' read-only')}
                 onDrop={(e) => { this.handleDropAsset(this.codeMirror, e) } }
                 onDragOver={ (e) => {this.handleDragOver(this.codeMirror, e) } }
              >
              <textarea ref="textarea"
                      className="allow-toolbar-shortcuts"
                      defaultValue={asset.content2.src}
                      autoComplete="off"
                      placeholder="Start typing code here..."/>
            </div>
        </div>

        {
        <div className={infoPaneOpts.col2 + ' wide column'} style={{paddingTop: 0, paddingBottom: 0, display: infoPaneOpts.col2 ? "block" : "none"}}>

          <div className="mgbAccordionScroller" style={{minHeight: '385px'}}>
            <div className="ui fluid styled accordion">

              { !docEmpty && asset.kind === 'tutorial' &&
                // Current Line/Selection helper (header)
                <div className="active title">
                  <span className="explicittrigger" style={{ whiteSpace: 'nowrap'}} >
                    <i className='dropdown icon' />Tutorial Mentor
                  </span>
                </div>
              }
              { !docEmpty && asset.kind === 'tutorial' &&     // TUTORIAL Current Line/Selection helper (body)
                <div className="active content">
                  <TutorialMentor
                      tryTutorial={() => this.tryTutorial()}
                      stopTutorial={() => this.stopTutorial()}
                      parsedTutorialData={this.state.parsedTutorialData}
                      insertCodeCallback={ canEdit ? (newCodeStr => this.insertTextAtCursor(newCodeStr) ) : null }/>

                  { previewIdThings && previewIdThings.length > 0 &&
                    <div className="ui divided selection list">
                      {previewIdThings}
                    </div>
                  }

                  { stringReferences && stringReferences.length > 0 &&
                  <div className="ui divided selection list">
                    {stringReferences}
                  </div>
                  }
                </div>
              }

              { isChallenge &&
                <div className={"title active"}
                id="mgbjr-EditCode-codeChallenges">
                  <span className="explicittrigger" style={{ whiteSpace: 'nowrap'}} >
                    <i className='dropdown icon' />Code Challenges
                  </span>
                </div>
              }

              { isChallenge &&
                <CodeChallenges
                  active      =   { asset.skillPath ? true : false}
                  skillPath   =   { asset.skillPath }
                  codeMirror  =   { this.codeMirror }
                  currUser    =   { this.props.currUser }
                  userSkills  =   { this.userSkills }
                />
              }

              { isCodeTutorial &&
                <div className={"title active"}
                id="mgbjr-EditCode-codeTutorials">
                  <span className="explicittrigger" style={{ whiteSpace: 'nowrap'}} >
                    <i className='dropdown icon' />Code Tutorials
                  </span>
                </div>
              }

              { isCodeTutorial &&
                <CodeTutorials
                  active      =     { asset.skillPath ? true : false}
                  skillPath   =     { asset.skillPath }
                  codeMirror  =     { this.codeMirror }
                  currUser    =     { this.props.currUser }
                  userSkills  =     { this.userSkills }
                  quickSave   =     { this.quickSave.bind(this) }
                  highlightLines =  { this.highlightLines.bind(this) }
                  assetId     =     { asset._id }
                />
              }

              { !docEmpty && asset.kind === 'code' &&
                // Current Line/Selection helper (header)
                <div id="mgbjr-EditCode-codeMentor" className={"title " + (asset.skillPath ? "" : "active") }>
                  <span className="explicittrigger" style={{ whiteSpace: 'nowrap'}} >
                    <i className='dropdown icon' />Code Mentor
                  </span>
                </div>
              }
              { !docEmpty && asset.kind === 'code' &&
                // Current Line/Selection helper (body)
                <div className={"content " + (asset.skillPath ? "" : "active")} >
                  <TokenDescription
                    currentToken={this.state.currentToken}
                    getPrevToken={cb => this.getPrevToken(cb)}
                    getNextToken={cb => this.getNextToken(cb)}
                    />
                  { this.state.astReady &&
                  <ImportHelperPanel
                    scripts={this.state.userScripts}
                    includeLocalImport={this.includeLocalImport}
                    includeExternalImport={this.includeExternalImport}
                    knownImports={this.tools.collectImportsForFile(this.props.asset.name)}
                    /> }
                  <FunctionDescription
                    functionHelp={this.state.functionHelp}
                    functionArgPos={this.state.functionArgPos}
                    functionTypeInfo={this.state.functionTypeInfo}
                    helpDocJsonMethodInfo={this.state.helpDocJsonMethodInfo}/>

                  <ExpressionDescription
                    expressionTypeInfo={this.state.atCursorTypeRequestResponse.data}/>

                  <RefsAndDefDescription
                    refsInfo={this.state.atCursorRefRequestResponse.data}
                    defInfo={this.state.atCursorDefRequestResponse.data}
                    expressionTypeInfo={this.state.atCursorTypeRequestResponse.data}/>

                  { this.renderDebugAST() }

                  { previewIdThings && previewIdThings.length > 0 &&
                    <div className="ui divided selection list">
                      {previewIdThings}
                    </div>
                  }

                  { stringReferences && stringReferences.length > 0 &&
                  <div className="ui divided selection list">
                    {stringReferences}
                  </div>
                  }
                </div>
              }

              { docEmpty && !asset.isCompleted &&
                // Clean sheet helper!
                <div className="active title">
                    <span className="explicittrigger" style={{ whiteSpace: 'nowrap'}} >
                      <i className='dropdown icon' />Code Starter
                    </span>
                </div>
              }
              { docEmpty && !asset.isCompleted &&
                <div className="active content">
                  An Empty Page! If you like, you can click one of the following buttons to paste some useful template code into your
                  empty file
                  <div className="ui divided selection list">
                    {templateCodeChoices}
                  </div>
                  ...or, if you think you know what you are doing, just start hacking away!
                </div>
              }
              { docEmpty && this.state.astReady && !asset.isCompleted &&
                // Quick import for empty doc
              <div className="title">
                    <span className="explicittrigger" style={{ whiteSpace: 'nowrap'}} >
                      <i className='dropdown icon' />Quick Import
                    </span>
              </div>
              }
              { docEmpty && this.state.astReady && !asset.isCompleted &&
              <div className="content">
                <ImportHelperPanel
                  scripts={this.state.userScripts}
                  includeLocalImport={this.includeLocalImport}
                  includeExternalImport={this.includeExternalImport}
                  knownImports={this.tools.collectImportsForFile(this.props.asset.name)}
                  />
                </div>
                }
              { !docEmpty && asset.kind === 'code' &&
                // Code run/stop (header)
                <div className="title" id="mgbjr-EditCode-codeRunner">
                  <span className="explicittrigger" style={{ whiteSpace: 'nowrap'}} >
                    <i className='dropdown icon' />Code Runner
                  </span>
                </div>
              }
              { !docEmpty && asset.kind === 'code' &&
                // Code run/stop (body)
                <div className="content">

                  <span style={{float: "right", marginTop: "-28px", position: "relative"}}>

                    { isPlaying && this.props.canEdit &&
                      <a className={"ui tiny icon button"} onClick={this.handleScreenshotIFrame.bind(this)}
                        title='This will set the Asset preview Thumbnail image to be a screenshot of the first <canvas> element in the page, *IF* your code has created one...'>
                        <i className='save icon' />
                      </a>
                    }
                    { !isPlaying &&
                      <a  className='ui tiny icon button'
                          title='Click here to start the program running'
                          id="mgb-EditCode-start-button"
                          onClick={this.handleRun.bind(this)}>
                        <i className='play icon' />&emsp;Run
                      </a>
                    }
                    { isPlaying &&
                      <a  className='ui tiny icon button'
                          title='Click here to stop the running program'
                          id="mgb-EditCode-stop-button"
                          onClick={this.handleStop.bind(this)}>
                        <i className={"stop icon"}></i>&emsp;Stop
                      </a>
                    }
                    {
                      isPlaying &&
                      <a  className={`ui tiny ${this.state.isPopup ? 'active' : '' } icon button`}
                          title='Popout the code-run area so it can be moved around the screen'
                          onClick={this.handleGamePopup.bind(this)}>
                        <i className={"external icon"}></i>&emsp;Popout
                      </a>
                    }
                    { !this.hasErrors &&
                    <span className={( (this.tools.hasChanged() || this.state.creatingBundle) && this.props.canEdit) ? "ui button labeled" : ""}>
                      <a  className='ui tiny icon button full-screen'
                          id="mgb-EditCode-full-screen-button"
                          title='Click here to start running your program in a different browser tab'
                          onClick={this.handleFullScreen.bind(this, asset._id)}>
                        <i className='external icon' />&emsp;Full&nbsp;
                      </a>
                      {/*Moved to global notification - (this.tools.hasChanged()) - not used anymore - as we are creating bundle on every save - to make play game - better
                      { this.state.creatingBundle && this.props.canEdit &&
                        <a className="ui tiny left pointing label reload" onClick={() => {this.createBundle( () => {} )}}
                          title="Updating Bundle">
                          <i className={'refresh icon ' + (this.state.creatingBundle ? ' loading' : '')} />
                        </a>
                      }*/}
                    </span>
                    }
                  </span>
                  {infoPaneOpts.col2 && gameScreen}

                  <ConsoleMessageViewer
                    messages={this.state.consoleMessages}
                    gotoLinehandler={this.gotoLineHandler.bind(this)}
                    clearConsoleHandler={this._consoleClearAllMessages.bind(this) }/>
                </div>
              }
              { this.state.astReady && asset.kind === 'code' &&
                <div id="mgbjr-EditCode-codeFlower" className="title">
                  <span className="explicittrigger" style={{ whiteSpace: 'nowrap'}} >
                    <i className='dropdown icon' />CodeFlower
                  </span>
                </div>
              }
              { this.state.astReady && asset.kind === 'code' &&
                <div className='content'>
                  {/* this.props.canEdit && this.state.astReady &&
                   <a className={"ui right floated mini icon button"} onClick={this.drawAstFlower.bind(this)}
                   title="This will make abstract image of your code">
                   <i className={"write square icon"}></i>Draw AST
                   </a>
                   */}
                  <span style={{float: "right", marginTop: "-28px", position: "relative"}}>
                    { this.state.astFlowerReady && this.props.canEdit &&
                    <a className="ui tiny icon button" onClick={() => {this.saveAstThumbnail( () => {} )}}
                      title="Save the currently displayed CodeFlower as the Code Asset preview 'thumbnail' image for this asset">
                      <i className='save icon' />
                    </a>
                    }
                    <a className="ui tiny icon button"
                      onClick={this.drawAstFlowerForThumbnail.bind(this, asset._id)}
                      title='Generate an abstract CodeFlower image based on the structure of your source code'>
                      <i className='empire icon' />&emsp;Simple
                    </a>&nbsp;
                    <a className="ui tiny icon button" onClick={this.drawAstFlowerFull.bind(this, asset._id)}
                      title="Generate a more detailed CodeFlower image based on the structure of your source code">
                      <i className='first order icon' />&emsp;Detailed
                    </a>&nbsp;
                  </span>
                  <div id='codeflower' ref='codeflower' />
                </div>
              }
              </div>
          </div>
        </div>
        }
        {!infoPaneOpts.col2 && gameScreen}

      </div>
    )
  }
}





EditCode.contextTypes = {
  skills: PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
}
