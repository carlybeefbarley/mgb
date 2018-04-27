const reactUpdate = require('react-addons-update')

import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import {
  Accordion,
  Button,
  Segment,
  Table,
  Modal,
  Header,
  Icon,
  Dimmer,
  Loader,
  Image,
} from 'semantic-ui-react'
import Tabs from './CodeEditorTabs'

import DragNDropHelper from '/client/imports/helpers/DragNDropHelper'
import TutorialMentor from './TutorialEditHelpers'

import Toolbar from '/client/imports/components/Toolbar/Toolbar'
import { showToast } from '/client/imports/modules'

import moment from 'moment'
import { snapshotActivity } from '/imports/schemas/activitySnapshots'
import { js_beautify } from 'js-beautify'
import CodeMirror from '../../CodeMirror/CodeMirrorComponent'
import ConsoleMessageViewer from './ConsoleMessageViewer'
import SourceTools from './SourceTools'
import CodeFlower from './CodeFlowerModded'
import GameScreen from './GameScreen'
import CodeStarter from './CodeStarter'
import CodeChallenges from './CodeChallenges/CodeChallenges'
import CodeTutorials from './CodeTutorials'
import HocActivity from './HocActivity'
import { makeCDNLink, mgbAjax } from '/client/imports/helpers/assetFetchers'
import { AssetKindEnum } from '/imports/schemas/assets'
import EnrollButton from '/client/imports/components/HourOfCode/EnrollButton'
import UX from '/client/imports/UX'
import VideoFrame from '/client/imports/components/Video/VideoFrame'

import ThumbnailWithInfo from '/client/imports/components/Assets/ThumbnailWithInfo'

import getCDNWorker from '/client/imports/helpers/CDNWorker'
import Hotjar from '/client/imports/helpers/hotjar'
// import tlint from 'tern-lint'
import validJSName from '/client/imports/helpers/validJSName'

// **GLOBAL*** Tern JS - See comment below...
// import scoped_tern from "tern"
// window.tern = scoped_tern   // 'tern' symbol needs to be GLOBAL due to some legacy non-module stuff in tern-phaser

// Tern 'definition files'
// import "tern/lib/def"     // Do I need? since I'm doing it differently in next 2 lines...
// import Defs_ecma5 from "./tern/Defs/ecma5.json"
// import Defs_browser from './tern/Defs/browser.json'

import JsonDocsFinder from './tern/Defs/JsonDocsFinder.js'

// removed this - as we are using tern worker for a while now -
// TODO(stauzs): move MGB tern extensions to worker
// import InstallMgbTernExtensions from './tern/MgbTernExtensions.js'
import 'codemirror/addon/tern/tern'
import 'codemirror/addon/comment/comment'

import FunctionDescription from './tern/FunctionDescription'
import ExpressionDescription from './tern/ExpressionDescription'
import RefsAndDefDescription from './tern/RefsAndDefDescription'
import TokenDescription from './tern/TokenDescription'
import InvokingDescription from './tern/InvokingDescription'
import ImportHelperPanel from './tern/ImportHelperPanel'
import ImportAssistantHeader from './tern/ImportAssistantHeader'
import DebugASTview from './tern/DebugASTview.js'

import registerDebugGlobal from '/client/imports/ConsoleDebugGlobals'

import SpecialGlobals from '/imports/SpecialGlobals'

import { getKnownExtension } from '/client/imports/helpers/extensions'

const THUMBNAIL_WIDTH = SpecialGlobals.thumbnail.width
const THUMBNAIL_HEIGHT = SpecialGlobals.thumbnail.height

import { isPathChallenge, isPathCodeTutorial } from '/imports/Skills/SkillNodes/SkillNodes'
import { withStores } from '/client/imports/hocs'
import { hourOfCodeStore, joyrideStore } from '/client/imports/stores'

let showDebugAST = false // Handy thing while doing TERN dev work

// NOTE, if we deliver phaser.min.js from another domain, then it will
// limit the error handler's knowledge of that code - see 'Notes' on
// https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
//   BAD:  return "//cdn.jsdelivr.net/phaser/" + phaserVerNNN + "/phaser.min.js"

// we are delaying heavy jobs for this amount of time (in ms) .. e.g. when user types - there is no need to re-analyze all content on every key press
// reasonable value would be equal to average user typing speed (chars / second) * 1000
const CHANGES_DELAY_TIMEOUT = SpecialGlobals.editCode.typingSpeed

const _infoPaneModes = [
  { col1: 'ten', col2: 'six' },
  { col1: 'sixteen', col2: null },
  { col1: 'six', col2: 'ten' },
  { col1: 'eight', col2: 'eight' },
]

// Code asset - Data format:
//
// content2.src                     // String with source code

class EditCode extends React.Component {
  static propTypes = {
    asset: PropTypes.object.isRequired,
    canEdit: PropTypes.bool.isRequired,
    editDeniedReminder: PropTypes.func,
    handleContentChange: PropTypes.func.isRequired,
    //    can be null whilst loading
    activitySnapshots: PropTypes.array,
  }

  constructor(props, context) {
    super(props)

    // from now store here all stuff unrelated to react
    this.mgb = {}

    registerDebugGlobal('editCode', this, __filename, 'Active Instance of Code editor')

    this.fontSizeSettingIndex = undefined
    // save jshint reference - so we can kill it later
    this.jshintWorker = null

    this.userSkills = context.skills

    this.state = {
      _preventRenders: false, // We use this as a way to batch updates.
      consoleMessages: [],
      isPlaying: false,
      previewAssetIdsArray: [], // Array of { id: assetIdString, kind: assetKindString } e.g. { id: "asdxzi87q", kind: "graphic" }

      infoPaneMode: 0, // See _infoPaneModes
      documentIsEmpty: true, // until loaded

      // tern-related stuff:
      functionHelp: undefined,
      functionArgPos: -1,
      atCursorTypeRequestResponse: {},
      atCursorRefRequestResponse: {},
      atCursorDefRequestResponse: {},

      // Only for Tutorial Assets
      parsedTutorialData: null, // null for not valid, or an object set by srcUpdate_AnalyzeTutorial()

      // handling game screen
      isPopup: false,

      // this is set when we complete CodeMentor related queries - as then we will need to re-render CodeMentor components
      lastAnalysisAtCursor: 0,

      // indicates when to run code challenge
      runChallengeDate: null,

      // for showing modal upon completing current HoC task
      isCurrStepCompleted: false,

      // for showing HoC video modal
      showVideoModal: true,

      // collapsible console in tutorials to increase space
      showConsole: false,
    }

    this.errorMessageCache = {}
    // assume that new code will have errors - it will be reset on first error checking
    this.hasErrors = true

    // is this component is still active?
    this.isActive = true

    this.cursorHistory = {
      undo: [],
      redo: [],
    }

    // is guest user?
    this.isGuest = this.props.currUser ? this.props.currUser.profile.isGuest : false
    this.isAutoRun = this.isGuest

    // indicates if code is challenge and/or tutorial
    this.isChallenge = this.props.asset.skillPath && isPathChallenge(this.props.asset.skillPath)
    this.isCodeTutorial = this.props.asset.skillPath && isPathCodeTutorial(this.props.asset.skillPath)
    this.isTutorialView = this.isCodeTutorial || this.isChallenge
  }

  handleJsBeautify() {
    let newValue = js_beautify(this._currentCodemirrorValue, { indent_size: 2, brace_style: 'expand' })
    this.codeMirror.setValue(newValue)
    this._currentCodemirrorValue = newValue
    let newC2 = { src: newValue }
    this.handleContentChange(newC2, null, `Beautify code`)
  }

  quickSave() {
    let newC2 = { src: this.codeMirror.getValue() }
    this.handleContentChange(newC2, null, `Save code`)
  }

  warnNoWriteAccess() {
    showToast.error("You don't have write access to this Asset")
  }

  componentDidMount() {
    this.mgb_mode =
      this.props.asset.kind === 'tutorial'
        ? 'application/json'
        : // guard is inside getKnownExtension as requested per: https://github.com/devlapse/mgb/pull/1221#discussion_r130507613
          getKnownExtension(this.props.asset.name, 'jsx')

    // Debounce the codeMirrorUpdateHints() function - only once
    this.codeMirrorUpdateHintsDebounced = _.debounce(this.codeMirrorUpdateHints, 100, true)

    this.updateUserScripts()
    // previous debounce eats up changes
    // CHANGES_DELAY_TIMEOUT - improves typing speed significantly on the price of responsiveness of CodeMentor
    // CodeMentor is affected here only on content change
    // codeMirrorUpdateHintsDebounced is responsible for simple code browsing
    this.codeMirrorUpdateHintsChanged = _.debounce(
      () => {
        this.codeMirrorUpdateHints.call(this, true)
      },
      CHANGES_DELAY_TIMEOUT,
      true,
    )
    this.listeners = {}
    this.listeners.joyrideCodeAction = event => {
      if (this.props.canEdit) {
        const newValue = this._currentCodemirrorValue + event.detail
        this.codeMirror.setValue(newValue)
        this._currentCodemirrorValue = newValue
        this.handleContentChange({ src: newValue }, null, `Tutorial appended code`)
      } else this.warnNoWriteAccess()
    }

    window.addEventListener('mgbjr-stepAction-appendCode', this.listeners.joyrideCodeAction)

    this.listeners.joyrideHighlightCode = event => {
      this.highlightLines(parseInt(event.data.from, 10), parseInt(event.data.to))
    }
    window.addEventListener('mgbjr-highlight-code', this.listeners.joyrideHighlightCode)

    // CodeMirror setup
    const textareaNode = this.refs.textarea
    const codemirrorOptions = {
      mode: this.mgb_mode,
      inputStyle: 'textarea', // contentEditable is another option - but input on tablet then sux
      // change theme for read only?
      theme: 'monokai',
      styleActiveLine: true,
      lineNumbers: true,
      scrollbarStyle: 'overlay',
      tabSize: 2,
      // to change at runtime: cm.setOption("readOnly", !this.props.canEdit)
      readOnly: !this.props.canEdit, // Note, not reactive, so be aware of that if we do dynamic permissions in future.
      foldGutter: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      viewportMargin: 10,

      search: {
        closeOnEnter: false,
      },

      /*hintOptions: {
       completeSingle: false    //    See https://codemirror.net/doc/manual.html -> completeSingle
       },*/

      gutters: [
        'CodeMirror-lint-markers',
        'CodeMirror-linenumbers',
        'CodeMirror-foldgutter',
        'mgb-cm-user-markers',
      ],
      extraKeys: {
        'Ctrl-F': 'findPersistent',
        'Alt-F': 'find',
        "'.'": cm => {
          return this.codeEditPassAndHint(cm)
        },
        'Ctrl-Space': cm => {
          return this.codeEditShowHint(cm)
        },
        'Ctrl-I': cm => {
          this.ternServer.showType(cm)
        },
        'Ctrl-D': cm => {
          this.ternServer.showDocs(cm)
        },
        'Alt-J': cm => {
          this.ternServer.jumpToDef(cm)
        },
        'Ctrl-B': cm => {
          this.handleJsBeautify(cm)
        },
        'Ctrl-Q': cm => {
          this.ternServer.rename(cm)
        },
        'Ctrl-S': cm => {
          this.ternServer.selectName(cm)
        },
        'Ctrl-O'(cm) {
          cm.foldCode(cm.getCursor())
        },
        'Ctrl-/'(cm) {
          cm.execCommand('toggleComment')
        },
        'Alt-.': cm => this.goToDef(),
        'Alt-,': cm => this.goBack(),
      },
      //lint: true,   // TODO - use eslint instead? Something like jssc?
      autofocus: true,
      highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
    }

    this.codeMirror = CodeMirror.fromTextArea(textareaNode, codemirrorOptions)
    // allow toolbar keyboard shortcuts from codemirror text area
    codemirrorOptions.inputStyle == 'textarea' &&
      this.codeMirror.display.input.textarea.classList.add('allow-toolbar-shortcuts')

    this.updateDocName(true)

    this.codeMirror.on('change', this.codemirrorValueChanged.bind(this))
    this.codeMirror.on('cursorActivity', this.codeMirrorOnCursorActivity.bind(this, false))
    this.codeMirror.on('dragover', this.handleDragOver.bind(this))
    this.codeMirror.on('drop', this.handleDropAsset.bind(this))

    this.codeMirror.on('mousedown', this.handleDocumentClick.bind(this))
    this.codeMirror.on('keyup', (cm, e) => {
      if (e.ctrlKey && e.altKey) e.preventDefault()
      if (!this.props.canEdit) {
        if (e.ctrlKey || e.altKey || e.which == 17 /* CTRL key*/) {
          return
        }

        this.props.editDeniedReminder()
      }
    })

    this._currentCodemirrorValue = this.props.asset.content2.src || ''

    this.codeMirrorUpdateHintsChanged()

    this.codeMirror.getWrapperElement().addEventListener('wheel', this.handleMouseWheel.bind(this))

    this.codeMirror.setSize('100%', this.isGuest ? '200px' : '500px')

    // Resize Handler - a bit complicated since we want to use to end of page
    // TODO: Fix this properly using flexbox/stretched so the content elements stretch to take remaining space.
    //       NOTE that the parent elements have the wrong heights because of a bunch of cascading h=100% styles. D'oh.
    var ed = this.codeMirror
    if (!this.isGuest) {
      this.edResizeHandler = e => {
        const $sPane = document.querySelector('.CodeMirror')
        const edHeight = window.innerHeight - (16 + $sPane.getBoundingClientRect().top)
        ed.setSize('100%', `${edHeight}px`)

        if (this.isTutorialView) {
          // Resize right panes
          const sc = document.querySelector('.pane-container')
          sc.style.height = `${edHeight}px`
          sc.style.maxHeight = `${edHeight}px`
        }
      }
      window.addEventListener('resize', this.edResizeHandler)
      this.edResizeHandler()
    }
    this.updateDocName()
    this.doHandleFontSizeDelta(0, { force: true })

    this.isActive = true

    this.cursorHistory = {
      undo: [],
      redo: [],
    }

    this.mgb_c2_hasChanged = this.props.canEdit
    // storing here misc stuff that can be accessed to gain performance
    this.mgb_cache = {}

    this.highlightedLines = []

    if (this.mgb_mode === 'jsx') this.startTernServer()

    const c2 = this.props.asset.content2
    this.setState({
      needsBundle: c2.needsBundle,
      hotReload: c2.hotReload,
      documentIsEmpty: !c2.src || c2.src.length === 0,
    })

    if (this.isGuest) {
      Hotjar('vpv', `hour-of-code/stepId:${this.props.hourOfCodeStore.state.currStepId}`)

      const timerId = window.setInterval(() => {
        if (this.state.astReady) {
          // run empty on first autorun
          this.handleRun()
          window.clearInterval(timerId)
        }
      }, 200)

      // Check every second for activity time expiration
      var activityTimerId = window.setInterval(() => {
        if (!this.props.hourOfCodeStore.state.isActivityOver) {
          this.props.hourOfCodeStore.checkActivityTime()
        } else {
          window.clearInterval(activityTimerId)
        }
      }, 10 * 1000)
    }
  }

  startTernServer() {
    // Tern setup
    var myTernConfig = {
      // in worker mode it's not possible to add defs and doc_comment plugin also can't add parsed defs
      // TODO: find workaround and uncomment
      useWorker: true,
      // load defs at runtime
      defs: [], //[Defs_ecma5, Defs_browser, Defs_lodash, Defs_phaser, Defs_sample],
      completionTip(curData) {
        // we get called for the CURRENTLY highlighted entry in the autocomplete list.
        // We are provided fields like
        //   name, type     ... pretty reliably
        //   doc, url       ... sometimes (depending on dataset)
        const doc = curData.doc ? curData.doc : ''
        return doc + (doc ? '\n\n' + curData.type : '')
      },
      workerDeps: [
        makeCDNLink('/lib/acorn/acorn.js'),
        makeCDNLink('/lib/acorn/acorn_loose.js'),
        makeCDNLink('/lib/acorn/walk.js'),
        makeCDNLink('/lib/tern/lib/signal.js'),
        makeCDNLink('/lib/tern/lib/tern.js'),
        makeCDNLink('/lib/tern/lib/def.js'),
        makeCDNLink('/lib/tern/lib/infer.js'),
        makeCDNLink('/lib/tern/lib/comment.js'),
        makeCDNLink('/lib/tern/plugin/modules.js'),
        makeCDNLink('/lib/tern/plugin/es_modules.js'),
        makeCDNLink('/lib/tern/plugin/doc_comment.js'),
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
          strong: true,
        },
      },
      workerScript: '/lib/workers/TernWorker.js',
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
      this.ternServer.server.addDefs = defs => {
        // async - can be unmounted already
        this.ternServer &&
          this.ternServer.worker.postMessage({
            type: 'addDefs',
            defs,
          })
      }
    }
    // overwrite default function - so we can use replace
    this.ternServer.server.addFile = (name, text, replace) => {
      this.ternServer && this.ternServer.worker.postMessage({ type: 'add', name, text, replace })
    }
    this.ternServer.server.delFile = name => {
      this.ternServer && this.ternServer.worker.postMessage({ type: 'del', name })
    }

    // TODO: next 3 tern server extensions follows same pattern .. clean up: listen -> filter -> cleanup
    this.ternServer.server.getAstFlowerTree = (options, callback, filename = this.props.asset.name) => {
      if (!options.filename) {
        options.filename = filename
      }
      const getAstFlowerTree = e => {
        if (e.data.type !== 'flower') return
        this.ternServer.worker.removeEventListener('message', getAstFlowerTree)
        callback(e.data.data)
      }
      this.ternServer.worker.addEventListener('message', getAstFlowerTree)
      this.ternServer.worker.postMessage({
        type: 'getAstFlowerTree',
        filename: options.filename,
        local: options.local,
      })
    }

    this.ternServer.server.getComments = (callback, filename = this.props.asset.name) => {
      const cb = e => {
        if (e.data.type !== 'getComments') return
        this.ternServer.worker.removeEventListener('message', cb)
        callback(e.data.data)
      }
      this.ternServer.worker.addEventListener('message', cb)
      this.ternServer.worker.postMessage({
        type: 'getComments',
        filename,
      })
    }

    this.ternServer.server.getDef = (def, callback) => {
      const cb = e => {
        if (e.data.type !== 'getDef') return
        this.ternServer.worker.removeEventListener('message', cb)
        callback(e.data.data)
      }
      this.ternServer.worker.addEventListener('message', cb)
      this.ternServer.worker.postMessage({
        type: 'getDef',
        def,
      })
    }

    this.tools = new SourceTools(this.ternServer, this.props.asset)
    this.tools.on('change', asset => {
      this.consoleLog(`Updated asset: /${asset.dn_ownerName}:${asset.name}`)
      // TODO (@stauzs):
      // looks like quick save can be skipped if automatic bundling (publishing) is not required
      // before skipping quickSave - make sure that changes won't break anything else
      // - at least hot reload relies on quickSave
      this.quickSave()
    })
    this.tools.on('error', err => {
      this.showError(err)
    })

    this.tools.loadCommonDefs()
    // InstallMgbTernExtensions(tern)
  }

  // update file name - to correctly report 'part of'
  updateDocName(updateDocumentAnyway) {
    // don't update doc name until all required assets are loaded.
    // tern won't update itself after loading new import - without changes to active document
    if (this.state.astReady && this.lastName !== this.props.asset.name) {
      const doc = this.codeMirror.getDoc()
      if (this.isGuest) {
        const getValue = doc.getValue
        doc.getValue = () => this.getEditorValue()

        const req = this.ternServer.server.request
        this.ternServer.server.request = (body, c) => {
          let cb = c
          if (body && body.query && body.query.end && body.query.end.line !== void 0) {
            const origVal = getValue.call(doc)
            const currVal = doc.getValue()
            const extraLines = currVal.substring(0, currVal.indexOf(origVal) - origVal.length).split('\n')
              .length

            body.query.end = Object.assign({}, body.query.end, { line: body.query.end.line + extraLines })
            // there is less hackinsh option - responseFilter.. but there is no requestFilter ...
            cb = (err, data) => {
              if (data && data.end && data.end.line) {
                data.end.line -= extraLines
              }
              if (data && data.start && data.start.line) {
                data.start.line -= extraLines
              }
              c(err, data)
            }
          }
          return req.call(this.ternServer.server, body, cb)
        }
      }
      if (this.ternServer && doc) {
        this.ternServer.delDoc(doc)
        this.ternServer.addDoc(this.props.asset.name, doc)
        this.lastName = this.props.asset.name

        // we need to update all sources - to match new origin
        this.doFullUpdateOnContentChange()
      }
    } else if (updateDocumentAnyway) this.doFullUpdateOnContentChange()
  }

  codeMirrorOnCursorActivity() {
    // Indirecting this to help with debugging and maybe some future optimizations
    this.codeMirrorUpdateHintsDebounced(false)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.edResizeHandler)
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

    this.mgb_cache = null
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
    if (this.props.asset.kind === 'tutorial') {
      return TutorialMentor.showHint(cm, CodeMirror)
    } else if (this.mgb_mode !== 'jsx') {
      return this.codeMirror.execCommand('autocomplete')
    } else if (this.props.canEdit && this.state.currentToken && this.mgb_mode === 'jsx') {
      if (this.state.currentToken.type === 'comment') return CodeMirror.Pass
      if (this.state.currentToken.type === 'string') {
        return this.showUserAssetHint(cm, CodeMirror, this.state.currentToken)
      }
      return this.ternServer.complete(cm)
    }
    return CodeMirror.Pass
  }

  // autocomplete options type: [{text: '', desc: ''}, ...]
  showCustomCMHint(cm, autocompleteOptions, keywordSubstring = 0) {
    let tooltip = null
    // TODO: optimize - reuse tooltip
    const createTooltip = () => {
      const node = document.createElement('div')
      // same class as for JS tooltips
      node.className = 'CodeMirror-Tern-tooltip CodeMirror-Tern-hint-doc'
      return node
    }
    const removeTooltip = () => {
      if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip)
      }
    }

    const hintObj = {
      // hint will be called on every change
      hint() {
        const cursor = cm.getCursor()
        const token = cm.getTokenAt(cursor, true)
        const keyword = token.string.substring(1 + keywordSubstring, token.string.length - 1)

        // filter our list
        const list = autocompleteOptions.filter(a => {
          return !keyword || a.text.toLowerCase().startsWith(keyword.toLowerCase())
        })
        const from = Object.assign({}, cursor)
        from.ch = token.start + 1 + keywordSubstring // keep quote

        const to = Object.assign({}, from)
        to.ch = token.end - 1 // keep quote

        list.sort((a, b) => {
          return a.text < b.text ? -1 : 1
        })
        const hints = {
          list,
          from,
          to,
          // completeSingle seems that is not working ?
          completeSingle: false,
        }

        CodeMirror.on(hints, 'select', (completion, element) => {
          // remove old tooltip
          removeTooltip()
          if (completion.desc) {
            tooltip = createTooltip()
            tooltip.innerHTML = completion.desc
            // li < ul < body - by default
            element.parentNode.parentNode.appendChild(tooltip)
            const box = element.getBoundingClientRect()
            const ulbox = element.parentNode.getBoundingClientRect()

            tooltip.style.left = ulbox.left + ulbox.width + 'px'
            tooltip.style.top = box.top + 'px'
          }
        })
        CodeMirror.on(hints, 'close', () => {
          removeTooltip()
          CodeMirror.off(hints, 'close')
          CodeMirror.off(hints, 'select')
          CodeMirror.on(hints, 'shown')
        })
        return hints
      },
    }

    return cm.showHint(hintObj)
  }

  showUserAssetHint(cm, CodeMirror, token) {
    // strip quotes
    const keyword = token.string.substring(1, token.string.length - 1)
    // this combo starts to repeat too often
    if (keyword && keyword.startsWith('/') && !keyword.startsWith('//')) {
      const parts = keyword.split(':')
      // get hints for own assets
      if (parts.length === 1) {
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
      } else if (parts.length === 2) {
        // check if user exists at all? parts[0] - is username
        const userWithSlash = parts.shift()
        mgbAjax(`/api/assets/code${userWithSlash}/?query=${parts.shift()}`, (err, listStr) => {
          if (err) return
          this.showCustomCMHint(cm, JSON.parse(listStr), userWithSlash.length + 1)
        })
      }
    }
    return CodeMirror.Pass
  }

  updateUserScripts(cb) {
    if (Meteor.user()) {
      mgbAjax(`/api/assets/code/${Meteor.user().username}/?query=`, (err, listStr) => {
        // async call
        if (!this.isActive) {
          return
        }
        if (err) return

        try {
          this.setState({ userScripts: JSON.parse(listStr) })
        } catch (e) {
          // no op
        }
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
      if (this.changeTimeout) return
      this.codeEditShowHint(cm)
    }, 1000) // Pop up a helper after a second
    // this.ternServer.getHint(cm, function (hint)
    // {
    // console.log("HINT",hint)
    // })
    return CodeMirror.Pass // Allow the typed character to be part of the document
  }

  // this method is triggered very very often due to activity snapshot
  componentWillReceiveProps(nextProps) {
    this.isGuest = nextProps.currUser ? nextProps.currUser.profile.isGuest : false

    const newVal = nextProps.asset.content2.src
    if (
      this.codeMirror &&
      newVal !== undefined &&
      this._currentCodemirrorValue !== newVal &&
      this.mgb.lastSaved.src != newVal
    ) {
      // user is typing - intensively working with document - don't update until it finishes ( update will trigger automatically on finish )
      if (this.changeTimeout) {
        return
      }

      const currentCursor = this.codeMirror.getCursor()
      const currentScrollInfo = this.codeMirror.getScrollInfo()

      this.codeMirror.setValue(newVal)
      this.setState({
        needsBundle: nextProps.asset.content2.needsBundle,
        hotReload: nextProps.asset.content2.hotReload,
      })

      this._currentCodemirrorValue = newVal // This needs to be done here or we will loop around forever

      // restore scroll and cursor
      this.codeMirror.setCursor(currentCursor) // Note that this will trigger the source Analysis stuff also.. and can update activitySnapshots. TODO(@dgolds) look at inhibiting the latter
      this.codeMirror.scrollTo(currentScrollInfo.left, currentScrollInfo.top)

      // force update source tools related files
      this.doFullUpdateOnContentChange()
    }
  }

  // opts can be    force = true ... force a font change even if delta =0
  doHandleFontSizeDelta(delta, opts = {}) {
    // delta should be -1 or +1
    const fontSizes = [
      { fontSize: '8.5px', lineHeight: '10px' }, //  0
      { fontSize: '9px', lineHeight: '11px' }, //  1
      { fontSize: '9px', lineHeight: '12px' }, //  2
      { fontSize: '10px', lineHeight: '12px' }, //  3
      { fontSize: '10px', lineHeight: '13px' }, //  4
      { fontSize: '10px', lineHeight: '14px' }, //  5
      { fontSize: '11px', lineHeight: '15px' }, //  6
      { fontSize: '12px', lineHeight: '16px' }, //  7
      { fontSize: '13px', lineHeight: '17px' }, //  8
      { fontSize: '14px', lineHeight: '19px' }, //  9
      { fontSize: '15px', lineHeight: '19px' }, // 10
      { fontSize: '16px', lineHeight: '20px' }, // 11
    ]

    if (this.fontSizeSettingIndex === undefined) this.fontSizeSettingIndex = 8

    // Changing font size - http://codemirror.977696.n3.nabble.com/Changing-font-quot-on-the-go-quot-td4026016.html
    let editor = this.codeMirror
    let validDelta = 0

    if (delta > 0 && this.fontSizeSettingIndex > 0) validDelta = -1
    else if (delta < 0 && this.fontSizeSettingIndex < fontSizes.length - 1) validDelta = 1

    if (Math.abs(validDelta) !== 0 || opts.force) {
      // Watch out for stupid -0 and NaN
      this.fontSizeSettingIndex += validDelta
      var nfs = fontSizes[this.fontSizeSettingIndex] // nfs:new font size
      editor.getWrapperElement().style['font-size'] = nfs.fontSize
      editor.getWrapperElement().style['line-height'] = nfs.lineHeight
      editor.refresh()
    }
  }

  // delta should be -1 or +1
  doHandleCommentFadeDelta(delta) {
    // 0. Set default Alpha now if it hasn't been set already
    if (this.CommentAlphaSetting === undefined) this.CommentAlphaSetting = 100 // Default is 100% Opacity

    // 1. Calculate new Alpha
    let alpha = this.CommentAlphaSetting
    alpha -= delta * 10 // 10% increments/decrements
    alpha = Math.min(alpha, 100) // Keep between 100
    alpha = Math.max(alpha, 10) // and 10
    this.CommentAlphaSetting = alpha

    // 2. Apply new Alpha using CSS magic
    let customCSSid = 'idOfCustomMgbCSSforComments'
    let $sty = document.querySelector(`#${customCSSid}`)
    if ($sty) $sty.parentNode.removeChild($sty)

    const $newStyle = document.createElement('style')
    $newStyle.setAttribute('id', customCSSid)
    $newStyle.innerHTML = `.cm-comment { opacity: ${alpha / 100} }`
    document.head.appendChild($newStyle)
  }

  // Drag and Drop of Asset onto code area
  handleDragOver(cm, event) {
    if (this.props.canEdit) {
      const scrollInfo = this.codeMirror.getScrollInfo()

      DragNDropHelper.preventDefault(event)
      // TODO: discuss - change cursor style to indicate drop???
      cm.focus()

      // move cursor to exact drop location
      const cur = cm.getCursor()
      const coords = cm.coordsChar({ left: event.clientX, top: event.clientY }, 'window')
      cur.ch = coords.ch
      cur.line = coords.line

      // workaround - force codemirror to really update cursor - when moving happens on the same line but different char
      if (cur.line === coords.line) cm.setCursor({ line: 0, ch: 0 })

      cm.setCursor(coords)

      // we need to scroll back to correct position - fix #1041 (CM doesn't do that automatically)
      cm.scrollTo(null, scrollInfo.top)
    }
  }

  handleDropAsset(cm, event) {
    // TODO: check if this is phaser game.. do something other if phaser is not included
    if (this.props.canEdit) {
      const draggedAsset = DragNDropHelper.getAssetFromEvent(event)
      let url = null
      let code = null
      if (draggedAsset) {
        switch (draggedAsset.kind) {
          case 'graphic':
            url = `/api/asset/png/${draggedAsset.dn_ownerName}/${draggedAsset.name}`
            code = `// Load ${draggedAsset.kind} Asset '${draggedAsset.name}' in Phaser:\n     game.load.image( '${draggedAsset.name}', '${url}' )`
            break
          case 'map': {
            event.preventDefault()

            let loadMap =
              `// Loads MGB map and all related resources\n// place this function in the preload method` +
              '\n' +
              `game.load.mgbMap( '${draggedAsset.name}', '/${draggedAsset.dn_ownerName}/${draggedAsset.name}' )` +
              '\n\n' +
              `// Creates full MGB map with all visible layers\n// place this function in the create method` +
              '\n' +
              `const map = game.create.mgbMap('${draggedAsset.name}')`

            this.codeMirror.replaceSelection('\n' + loadMap + '\n', 'around')
            this.codeMirror.execCommand('indentAuto')
            // clear selection
            this.codeMirror.setSelection(this.codeMirror.getCursor())

            const val = this.codeMirror.getValue()
            if (val.indexOf('mgb-map-loader-extended') === -1)
              this.codeMirror.setValue(`import '/!vault:mgb-map-loader-extended'` + '\n' + val)

            return
          }
          case 'sound':
          case 'music':
            url = `/api/asset/${draggedAsset.kind}/${draggedAsset.dn_ownerName}/${draggedAsset.name}/${draggedAsset.kind}.mp3`
            code = `// Load ${draggedAsset.kind} Asset '${draggedAsset.name}' in Phaser:\n     game.load.audio( '${draggedAsset.name}', '${url}' )`
            break
          case 'code':
            // TODO: support extensions or something similar - e.g. in case when importing css
            if (this.props.asset.dn_ownerName === draggedAsset.dn_ownerName)
              code = this.createImportString(draggedAsset.name)
            else code = this.createImportString(draggedAsset.name, draggedAsset.dn_ownerName)
            break

          // actor, actormap
          default:
            code = `'/${draggedAsset.kind}/${draggedAsset.dn_ownerName}/${draggedAsset.name}'`
        }
      }

      if (code) {
        event.preventDefault()
        this.codeMirror.replaceSelection('\n' + code + '\n', 'around')
        this.codeMirror.execCommand('indentAuto')
        // clear selection
        this.codeMirror.setSelection(this.codeMirror.getCursor())
      }
    } else event.preventDefault() // ReadOnly
  }

  // Alt-Shift Mousewheel will change the editor font Size
  handleMouseWheel(event) {
    // We only handle alt-shift + wheel or alt-wheel. Anything else is system behavior (scrolling etc)
    if (event.altKey === false) return

    event.preventDefault() // No default scroll behavior in the cases we handle (alt-)

    // WheelDelta system is to handle MacOS that has frequent small deltas,
    // rather than windows wheels which typically have +/- 120
    this.mgb_wheelDeltaAccumulator = (this.mgb_wheelDeltaAccumulator || 0) + event.wheelDelta
    let wd = this.mgb_wheelDeltaAccumulator // shorthand

    if (Math.abs(wd) > 60) {
      let delta = Math.sign(wd)
      if (event.shiftKey) this.doHandleFontSizeDelta(delta)
      else this.doHandleCommentFadeDelta(delta)
      this.mgb_wheelDeltaAccumulator = 0
    }
  }

  // TODO(@stauzs): add deeper analysis - would be really nice to - allow to change asset on include ??
  handleDocumentClick(cm, event) {
    const pos = cm.coordsChar({ left: event.clientX, top: event.clientY })
    // click on the gutter
    if (pos.xRel < 0) {
      return
    }
    const currentCursor = _.cloneDeep(this.codeMirror.getCursor())
    this.cursorHistory.undo.push(currentCursor)

    // do we really need to reset redo steps??? - test it
    this.cursorHistory.redo.length = 0
    if (this.cursorHistory.undo.length > SpecialGlobals.editCode.maxLengthOfCursorHistory) {
      this.cursorHistory.undo.shift()
    }

    if (event.ctrlKey) {
      // disable multi select
      event.preventDefault()

      const token = cm.getTokenAt(pos, true)

      cm.operation(() => {
        if (token.type === 'string') {
          const link = this.getImportStringLocation(this.cleanTokenString(token.string))
          if (link) this.openNewTab(link)
        } else {
          // jump to definition
          this.codeMirror.setCursor(pos)
          this.cursorHistory.undo.push(pos)
          this.ternServer.jumpToDef(cm)
        }
      })
    }
  }

  /**
   * Removes quotes around token
   * @param string - CodeMirror Token
   * @returns string
   */
  cleanTokenString(string) {
    // check if we are actually stripping quotes?
    return string.substring(1, string.length - 1)
  }

  goToDef() {
    const currentCursor = _.cloneDeep(this.codeMirror.getCursor())
    this.cursorHistory.undo.push(currentCursor)

    this.ternServer.jumpToDef(this.codeMirror)
  }

  goBack() {
    const pos = this.cursorHistory.undo.pop()
    this.cursorHistory.redo.push(_.cloneDeep(this.codeMirror.getCursor()))

    this.codeMirror.setCursor(pos)
    //this.ternServer.jumpBack(this.codeMirror)
    this.codeMirror.focus()
  }

  goForward() {
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
    let re = /api\/asset\/([a-z]+)\/([A-Za-z0-9]+)|(load\.mgbMap)\s*\(\s*["'`]([A-Za-z0-9]+)["'`]\s*(,\s*["'`]\.\/([A-Za-z0-9/]+)["'`])*\s*\)/g
    let matches = []
    let match
    while ((match = re.exec(lineText))) {
      // single arg fn
      if (match[3] === 'load.mgbMap') {
        if (
          match[5] // second arg
        )
          matches.push({ id: match[6], kind: 'map', refType: '' }) // :user/:name
        else matches.push({ id: match[4], kind: 'map', refType: 'ID#' })
      } else matches.push({ id: match[2], kind: match[1], refType: '' }) // :user/:name
    }
    return _.uniqBy(matches, 'id')
  }

  /** Just show the Clean Sheet helpers if there is no code */
  srcUpdate_CleanSheetCase() {
    const isEmpty = this.codeMirror.getValue().length === 0
    if (this.state.documentIsEmpty !== isEmpty) {
      // set state seems to be expensive - based on profiler data
      this.setState({ documentIsEmpty: isEmpty })
      if (this._currentCodemirrorValue.length === 0) {
        joyrideStore.completeTag('mgbjr-CT-EditCode-editor-clean')
      }
    }
  }

  srcUpdate_AnalyzeTutorial() {
    const pj = TutorialMentor.parseJson(this._currentCodemirrorValue)
    this.setState({ parsedTutorialData: pj })
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
    this.setState({ previewAssetIdsArray: AssetIdsAndKinds })
  }

  /** Runs JSHINT on the user's code and show any relevant issues as widgets
   * directly below that code in CodeMirror. This was adapted from the demo code
   * at https://codemirror.net/demo/widget.html
   */
  srcUpdate_ShowJSHintWidgetsForCurrentLine(fSourceMayHaveChanged = false) {
    //return // TODO make this user-selectable
    const editor = this.codeMirror
    const currentLineNumber = editor.getCursor().line + 1 // +1 since user code is 1...

    const info = editor.getScrollInfo()
    const after = editor.charCoords({ line: currentLineNumber, ch: 0 }, 'local').top
    if (info.top + info.clientHeight < after) editor.scrollTo(null, after - info.clientHeight + 3)
  }

  runJSHintWorker(code, cb) {
    if (this.props.asset.kind === 'tutorial' || this.mgb_mode !== 'jsx') return

    // terminate old busy worker - as jshint can take a lot time on huge scripts
    if (this.jshintWorker && this.jshintWorker.isBusy) {
      this.jshintWorker.terminate()
      this.jshintWorker = null
    }

    if (!this.jshintWorker) {
      // TODO: now should be easy to change hinting library - as separate worker - make as end user preference?
      this.jshintWorker = getCDNWorker('/lib/workers/JSHintWorker.js')
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
        alert: false, // why alert is not defined?
        //"require": false,
        //"exports": false,
        Phaser: false,
        PIXI: false,
        console: false,
        _: false,
      },
      maxerr: 999,
    }

    this.jshintWorker.isBusy = true
    this.jshintWorker.onmessage = e => {
      this.jshintWorker.isBusy = false
      this.showErrors(e.data[0], true)
      cb && cb(e.data[0])
    }
    this.jshintWorker.postMessage([code, conf])
  }

  showErrors(errors, clear) {
    // TODO: allow user to change error level? Warning / Error?
    if (clear) {
      this.codeMirror.clearGutter('CodeMirror-lint-markers')
      this.errorMessageCache = {}
    }

    for (let i = 0; i < errors.length; ++i) this.showError(errors[i], clear)
  }

  showError(err, clear) {
    if (!err) return
    const msgs = this.errorMessageCache
    // get line
    if (!err.line || !clear) {
      const doc = this.codeMirror.getValue().split('\n')
      err.line = _.findIndex(doc, v => v.indexOf(err.evidence) > -1) + 1
    }
    const msg = msgs[err.line] ? msgs[err.line] : document.createElement('div')
    const errorText = ' ' + err.reason

    if (!msgs[err.line]) {
      msgs[err.line] = msg
      msg.icon = msg.appendChild(document.createElement('div'))
      if (err.code.substring(0, 1) == 'W') {
        msg.icon.className = 'CodeMirror-lint-marker-warning'
      } else {
        msg.icon.className = 'CodeMirror-lint-marker-error'
      }
      msg.container = msg.appendChild(document.createElement('div'))
      msg.container.className = 'lint-error-text'
    } else if (!msg.multi) {
      msg.multi = msg.icon.appendChild(document.createElement('div'))
      msg.multi.className = 'CodeMirror-lint-marker-multiple'
    }

    // override warning icon to Error
    if (err.code.substring(0, 1) == 'E') {
      msg.icon.className = 'CodeMirror-lint-marker-error'
    }

    // don't show multiple messages with same text
    const index = _.findIndex(msg.container.children, child => child.childNodes[1].nodeValue == errorText)
    if (index > -1) return

    const text = msg.container.appendChild(document.createElement('div'))
    const ico = text.appendChild(document.createElement('div'))
    if (err.code.substring(0, 1) == 'W') {
      ico.className = 'CodeMirror-lint-marker-warning'
    } else {
      ico.className = 'CodeMirror-lint-marker-error'
    }

    text.appendChild(document.createTextNode(errorText))

    msg.className = 'lint-error'
    this.codeMirror.setGutterMarker(err.line - 1, 'CodeMirror-lint-markers', msg)

    /*
     var evidence = msg.appendChild(document.createElement("span"))
     evidence.className = "lint-error-text evidence"
     evidence.appendChild(document.createTextNode(err.evidence))
     */
  }

  /**
   * Gets info about function from tern server asynchronously and resolves promise with new state props on completion.
   * @returns Promise
   */
  srcUpdate_GetInfoForCurrentFunction() {
    return new Promise(resolve => {
      const ternServer = this.ternServer
      const editor = this.codeMirror
      if (!ternServer || !editor) {
        resolve()
        return
      }
      const currentCursorPos = editor.getCursor()

      // we need to force internal tern cache to clean up - move cursor to 0,0 and then back
      // TODO: (stauzs) debug this in free time
      const { line, char } = currentCursorPos
      currentCursorPos.line = 0
      currentCursorPos.char = 0

      // get token at 0,0
      editor.getTokenAt(currentCursorPos, true)
      currentCursorPos.line = line
      currentCursorPos.char = char

      // get token at current pos
      const currentToken = editor.getTokenAt(currentCursorPos, true)

      // I stole the following approach from
      // node_modules/codemirror/addon/tern/tern.js -> updateArgHints so I could get ArgPos
      // which is otherwise not stored/exposed
      let argPos = -1
      if (!editor.somethingSelected()) {
        const state = currentToken.state
        const inner = CodeMirror.innerMode(editor.getMode(), state)
        if (inner.mode.name === 'javascript') {
          const lex = inner.state.lexical
          if (lex.info === 'call') {
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

      let functionTypeInfo = null
      const _doResolve = functionTypeInfo => {
        if (functionTypeInfo) {
          JsonDocsFinder.getApiDocsAsync(
            {
              frameworkName: functionTypeInfo.origin,
              //frameworkVersion: "x.x.x",
              symbolType: 'method',
              symbol: functionTypeInfo.name || functionTypeInfo.exprName, // Tern can't always provide a 'name', for example when guessing
            },
            (originalRequest, result) => {
              resolve({
                helpDocJsonMethodInfo: result.data,
                functionHelp: functionTypeInfo ? ternServer.cachedArgHints : {},
                functionArgPos: argPos,
                functionTypeInfo: functionTypeInfo || {},
                currentToken,
              })
            },
          )
        } else {
          resolve({
            functionHelp: functionTypeInfo ? ternServer.cachedArgHints : {},
            functionArgPos: argPos,
            helpDocJsonMethodInfo: null,
            functionTypeInfo: functionTypeInfo || {},
            currentToken,
          })
        }
      }

      if (argPos !== -1) {
        ternServer.request(
          editor,
          'type',
          (error, data) => {
            // async call - component may be unmounted already
            if (!this.isActive) return
            functionTypeInfo = error ? { error } : data
            _doResolve(functionTypeInfo)
          },
          currentCursorPos,
        ) // TODO - We need CodeMirror 5.13.5 so this will work
      } else _doResolve()
    })
  }

  /**
   * Gets type from tern server asynchronously and resolves promise with new state props on completion.
   * @returns Promise
   */
  srcUpdate_GetRelevantTypeInfo() {
    return new Promise(resolve => {
      const ternServer = this.ternServer
      const editor = this.codeMirror
      if (!ternServer || !editor) {
        resolve()
        return
      }
      const position = editor.getCursor()
      const query = {
        type: 'type',
        depth: 0,
        //preferFunction: true
      }

      ternServer.request(
        editor,
        query,
        (error, data) => {
          // async call - component may be unmounted already
          if (!this.isActive) return
          if (error) resolve({ atCursorTypeRequestResponse: { error } })
          else {
            if (data.type == data.name) {
              query.depth = 1
              ternServer.request(
                editor,
                query,
                (error, data) => {
                  // async call - component may be unmounted already
                  if (!this.isActive) return
                  if (error) resolve({ atCursorTypeRequestResponse: { error } })
                  else resolve({ atCursorTypeRequestResponse: { data } })
                },
                position,
              )
            } else resolve({ atCursorTypeRequestResponse: { data } })
          }
        },
        position,
      )
    })
  }

  /**
   * Gets references from tern server asynchronously and resolves promise with new state props on completion.
   * @returns Promise
   */
  srcUpdate_GetRefs() {
    return new Promise(resolve => {
      let ternServer = this.ternServer
      let editor = this.codeMirror
      if (!ternServer || !editor) {
        resolve()
        return
      }
      let position = editor.getCursor()

      ternServer.request(
        editor,
        'refs',
        (error, data) => {
          // async call - component may be unmounted already
          if (!this.isActive) return // discuss: resolve or just ignore???
          if (error) resolve({ atCursorRefRequestResponse: { error } })
          else resolve({ atCursorRefRequestResponse: { data } })
        },
        position,
      )
    })
  }

  /**
   * Gets definitions from tern server asynchronously and resolves promise with new state props on completion.
   * @returns Promise
   */
  srcUpdate_GetDef() {
    return new Promise(resolve => {
      let ternServer = this.ternServer
      let editor = this.codeMirror
      if (!ternServer || !editor) {
        resolve()
        return
      }
      let position = editor.getCursor()

      ternServer.request(
        editor,
        'definition',
        (error, data) => {
          // async call - component may be unmounted already
          if (!this.isActive) return
          if (error) resolve({ atCursorDefRequestResponse: { error } })
          else {
            data.definitionText = null
            if (data.origin === this.props.asset.name && data.start && data.start.line) {
              const line = editor.getLine(data.start.line)
              if (line) {
                data.definitionText = line.trim()
              }
            }
            resolve({ atCursorDefRequestResponse: { data } })
          }
        },
        position,
      )
    })
  }

  /**
   * Gets comment at char index - resolves on completetion with found comment (if any) - may or may not be async
   * @param {number} index - character index in the WHOLE document
   * @returns Promise
   */
  getCommentAt(index = 0) {
    return new Promise(resolve => {
      if (this.mgb_c2_hasChanged || !this.mgb_cache.comments || this.mgb_cache.comments.length === 0) {
        this.ternServer.server.getComments(comments => {
          this.mgb_cache.comments = comments
          resolve(_.find(comments, com => com.start <= index && com.end >= index))
        })
      } else {
        resolve(_.find(this.mgb_cache.comments, com => com.start <= index && com.end >= index))
      }
    })
  }

  /**
   * @typedef {Object} Comment
   * @property {boolean} block - is this a block comment?
   * @property {string} text - comment's text without starting symbols - // or /* * /
   * @property {number} start - starting index of the comment
   * @property {number} end - ending index of the comment
   *
   * Gets Comment at cursor position - resolves on completion with found Comment (if any) - may or may not be async
   * @returns Promise
   */
  getCommentAtCursor() {
    const ternServer = this.ternServer
    const editor = this.codeMirror
    if (!ternServer || !editor) {
      return Promise.resolve()
    }
    let currentCursorPos = editor.getCursor()
    const index = editor.indexFromPos(currentCursorPos)

    return this.getCommentAt(index)
  }

  /**
   * gets Type Description from tern tern server definitions
   *
   * @return Promise.<{atCursorTypeDescription: {}}>
   */
  getTypeDescription(atCursorTypeRequestResponse) {
    return new Promise(resolve => {
      if (
        !atCursorTypeRequestResponse ||
        !atCursorTypeRequestResponse.data ||
        !atCursorTypeRequestResponse.data.name
      ) {
        resolve({ atCursorTypeDescription: null })
        return
      }
      let type = atCursorTypeRequestResponse.data.name
      type = type === 'o' ? 'Object' : type
      // tern uses 'o' for  ... = {}
      this.ternServer.server.getDef(type, data => {
        resolve({ atCursorTypeDescription: { def: data, name: type } })
      })
    })
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

  /**
   * Gets MemberParent definitions from tern server asynchronously and resolves promise on completion.
   * @returns Promise
   */

  /* TODO (@stauzs): fix this - Tern worker don't have MGB extensions installed
    (move EditCode/tern/MgbTernExtensions.js to TernWorker)
  */
  srcUpdate_getMemberParent(callback) {
    return new Promise(resolve => {
      if (!showDebugAST) {
        // nothing to do
        resolve()
        return
      }

      let ternServer = this.ternServer
      let editor = this.codeMirror
      if (!ternServer || !editor) {
        resolve()
        return
      }
      let position = editor.getCursor()

      var query = { type: 'mgbGetMemberParent' }

      ternServer.request(
        editor,
        query,
        (error, data) => {
          // async call - component may be unmounted already
          if (!this.isActive) return
          if (error) this.setState({ atCursorMemberParentRequestResponse: { error } })
          else {
            this.setState({ atCursorMemberParentRequestResponse: { data } })
          }
          resolve()
        },
        position,
      )
    })
  }

  cm_updateActivityMarkers() {
    var ed = this.codeMirror
    ed.clearGutter('mgb-cm-user-markers')

    let acts = this.props.getActivitySnapshots()
    _.each(acts, act => {
      var currUserId = this.props.currUser
        ? this.props.currUser._id
        : 'BY_SESSION:' + Meteor.default_connection._lastSessionId
      if (currUserId !== act.byUserId) {
        let marker = document.createElement('div')
        marker.style.color = '#822'
        const ago = moment(act.timestamp).fromNow() // TODO: Make reactive
        marker.title = 'Being viewed by ' + act.byUserName + ', ' + ago
        let c = act.byUserName[0]
        marker.innerHTML = c === '<' || !c ? '?' : c
        ed.setGutterMarker(act.passiveAction.position.line, 'mgb-cm-user-markers', marker)
      }
    })
  }

  // This gets called by CodeMirror when there is CursorActivity
  // This gets _.debounced in componentDidMount() and split into 2 parts +haveChanges
  codeMirrorUpdateHints(fSourceMayHaveChanged = false) {
    // Update the activity snapshot if the code line has changed
    // TODO: Batch this so it only fires when line# is changed
    if (!this.isActive) {
      return
    }

    const editor = this.codeMirror
    const position = editor.getCursor()
    const { asset } = this.props
    const passiveAction = { position }
    snapshotActivity(asset, passiveAction)
    // this is one very heavy function called on cursor changes
    // prevent updates to whole component - so we can complete it faster
    // also preventing updates will allow user to type normally (without freezing codemirror)
    this.setState({ _preventRenders: true })

    // TODO: update Read only???
    // TODO: Batch the async setState() calls also for tutprial.
    this.srcUpdate_CleanSheetCase()
    this.srcUpdate_LookForMgbAssets()
    this.srcUpdate_ShowJSHintWidgetsForCurrentLine(fSourceMayHaveChanged)
    if (asset.kind === 'code' && this.mgb_mode === 'jsx') {
      // collect new state properties and set state on full resolve
      const newState = { _preventRenders: false }
      this.srcUpdate_GetInfoForCurrentFunction()
        .then(state => {
          Object.assign(newState, state)
          return this.srcUpdate_GetRelevantTypeInfo()
        })
        .then(state => {
          Object.assign(newState, state)
          return this.srcUpdate_GetRefs()
        })
        .then(state => {
          Object.assign(newState, state)
          return this.srcUpdate_GetDef()
        })
        .then(state => {
          Object.assign(newState, state)
          return this.getTypeDescription(newState.atCursorTypeRequestResponse)
        })
        .then(state => {
          Object.assign(newState, state)
          return this.getCommentAtCursor()
        })
        .then(comment => {
          Object.assign(newState, { comment })
        })
        .then(() => {
          this.setState(Object.assign(newState, { lastAnalysisAtCursor: Date.now() }))
          // we have analysed source
          this.mgb_c2_hasChanged = false
        })
      // not used: see comment near function
      // this.srcUpdate_getMemberParent(onDone())
    } else if (asset.kind === 'tutorial') {
      this.srcUpdate_AnalyzeTutorial()
      this.setState({ _preventRenders: false })
    } else {
      // undo prevent
      this.setState({ _preventRenders: false })
    }
    // TODO:  See atInterestingExpression() and findContext() which are
    // called by TernServer.jumpToDef().. LOOK AT THESE.. USEFUL?
  }

  shouldComponentUpdate(nextProps, nextState) {
    // this.changeTimeout - is set when user is typing
    const retval = !(this.changeTimeout || nextState._preventRenders || this.state.creatingBundle)
    // manually check state properties that definitely will require redraw on change
    return (
      retval ||
      this.state.astReady !== nextState.astReady ||
      this.state.consoleMessages !== nextState.consoleMessages ||
      this.state.hotReload !== nextState.hotReload ||
      this.state.isCurrStepCompleted !== nextState.isCurrStepCompleted ||
      this.state.isPlaying !== nextState.isPlaying ||
      this.state.lastAnalysisAtCursor !== nextState.lastAnalysisAtCursor ||
      this.state.lastUndoRedo !== nextState.lastUndoRedo ||
      this.state.needsBundle !== nextState.needsBundle
    )
  }

  codemirrorValueChanged(doc, change) {
    const value = doc.getValue()
    const newValue = this.isGuest ? (value + '\n').replace(/\n{2,}$/, '\n') : value
    if (newValue !== value) {
      const cursorPosition = doc.getCursor()
      doc.setValue(newValue)
      doc.setCursor(cursorPosition)
    }

    // Ignore SetValue so we don't bounce changes from server back up to server
    this.mgb_c2_hasChanged = true
    if (change.origin !== 'setValue') {
      this._currentCodemirrorValue = newValue
      let newC2 = { src: newValue }
      this.handleContentChange(newC2, null, 'Edit code')
      this.codeMirrorUpdateHintsChanged(true)
    }
  }

  componentDidUpdate() {
    this.cm_updateActivityMarkers()
    this.updateDocName()
    const asset = this.props.asset
    // enable auto bundle by default for code asset
    if (asset.content2.needsBundle === void 0 && !asset.skillPath && !this.isGuest) {
      this.toggleBundling()
    }

    this.mgb.lastSaved = _.cloneDeep(asset.content2)
  }

  _consoleClearAllMessages() {
    this.setState({ consoleMessages: [] })
  }

  _consoleAdd(data) {
    // Using immutability helpers as described on https://facebook.github.io/react/docs/update.html
    let newMessages = reactUpdate(this.state.consoleMessages, { $push: [data] }).slice(
      -SpecialGlobals.editCode.messagesInConsole,
    )
    this.setState({ consoleMessages: newMessages })
    // todo -  all the fancy stuff in https://github.com/WebKit/webkit/blob/master/Source/WebInspectorUI/UserInterface/Views/ConsoleMessageView.js
  }

  consoleLog(message) {
    // Don't post anything to console if HoC
    if (!_.isEmpty(this.props.hourOfCodeStore.state.currStep)) return null

    this._consoleAdd({
      args: ['MGB: ' + message],
      timestamp: new Date(),
      consoleFn: 'info',
    })
  }

  _handle_iFrameMessageReceiver(event) {
    // there is no ref for empty code
    if (
      this.refs.gameScreen // TODO: This maybe a code smell that we (a) are getting a bunch more mesage noise than we expect (e.g. Meteor.immediate) and (b) that we should maybe register/deregister this handler more carefully
    )
      this.refs.gameScreen.handleMessage(event)
  }

  handleScreenshotIFrame() {
    if (this.state.isPlaying)
      this._postMessageToIFrame({
        mgbCommand: 'screenshotCanvas',
        recommendedHeight: THUMBNAIL_HEIGHT, // See AssetCard for this size
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

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT

    this.ternServer.server.getAstFlowerTree(
      {
        local: false,
      },
      tree => {
        const { width } = this.refs.codeflower.getBoundingClientRect()
        const flower = new CodeFlower('#codeflower', width, width / canvas.width * THUMBNAIL_HEIGHT)

        flower.update(tree)

        // wait for animations...
        window.setTimeout(() => {
          // TODO: move this to codeFlower.. flower.toImage(callback)
          this.refs.codeflower.firstChild.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

          const data = this.refs.codeflower.innerHTML

          const DOMURL = window.URL || window.webkitURL || window

          const img = new window.Image()
          const svg = new window.Blob([data], { type: 'image/svg+xml;charset=utf-8' })
          const url = DOMURL.createObjectURL(svg)

          img.onload = () => {
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
            this.props.asset.thumbnail = canvas.toDataURL('image/png')
            this.handleContentChange(null, this.props.asset.thumbnail, 'update thumbnail')

            DOMURL.revokeObjectURL(url)
          }
          img.src = url
        }, 1000)
      },
    )
  }

  drawAstFlower() {
    this.ternServer.server.getAstFlowerTree(tree => {
      const { width } = this.refs.codeflower.getBoundingClientRect()
      const flower = new CodeFlower('#codeflower', width, width / THUMBNAIL_WIDTH * THUMBNAIL_HEIGHT)
      flower.update(tree)
      this.setState({
        astFlowerReady: true,
      })
    })
  }

  drawAstFlowerForThumbnail() {
    this.ternServer.server.getAstFlowerTree(
      {
        local: true,
      },
      tree => {
        const { width } = this.refs.codeflower.getBoundingClientRect()
        const flower = new CodeFlower('#codeflower', width, width / THUMBNAIL_WIDTH * THUMBNAIL_HEIGHT, {
          showNames: false,
          onclick: node => {
            // make node stay in place
            node.fixed = true

            const cm = this.codeMirror
            let char = 0
            const pos = {
              ch: 0,
              line: 0,
            }
            if (!node.start) {
              cm.setCursor(pos)
              cm.focus()
              return
            }
            // we need to get line ch from char position
            cm.eachLine(line => {
              if (node.start >= char && node.start < char + line.text.length) {
                pos.ch = node.start - char
                return true
              }
              pos.line++
              char += line.text.length + 1
            })
            cm.setCursor(pos)
            cm.focus()
          },
        })
        flower.update(tree)
        this.setState({
          astFlowerReady: true,
        })
      },
    )
  }

  drawAstFlowerFull() {
    this.ternServer.server.getAstFlowerTree({}, tree => {
      const { width } = this.refs.codeflower.getBoundingClientRect()
      const flower = new CodeFlower('#codeflower', width, width / THUMBNAIL_WIDTH * THUMBNAIL_HEIGHT, {
        showNames: true,
      })
      flower.update(tree)
      this.setState({
        astFlowerReady: true,
      })
    })
  }

  saveAstThumbnail() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = THUMBNAIL_WIDTH
    canvas.height = THUMBNAIL_HEIGHT
    ctx.fillStyle = 'rgba(153,204,153,0.2)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    this.refs.codeflower.firstChild.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    const data = this.refs.codeflower.innerHTML
    const DOMURL = window.URL || window.webkitURL || window

    const img = new Image()
    const svg = new Blob([data], { type: 'image/svg+xml;charset=utf-8' })
    const url = DOMURL.createObjectURL(svg)

    img.onload = () => {
      ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height)
      this.props.asset.thumbnail = canvas.toDataURL('image/png')
      this.handleContentChange(null, this.props.asset.thumbnail, 'update thumbnail')

      DOMURL.revokeObjectURL(url)
    }
    img.src = url
  }

  postToIFrame(cmd, data = {}) {
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

  handleEmptyRun = () => {
    this.isAutoRun = true
    this.handleRun()
  }

  /** Start the code running! */
  handleRun = () => {
    if (this.isChallenge) {
      this.setState({ runChallengeDate: Date.now() })
      //return false // don't need to execute further as CodeChallenges have all need functionality
    }

    // always make sure we are running latest sources and not stacking them
    if (this.state.isPlaying) this.handleStop()
    //this.consoleLog('Starting new game runner')
    if (!this.bound_handle_iFrameMessageReceiver)
      this.bound_handle_iFrameMessageReceiver = this._handle_iFrameMessageReceiver.bind(this)

    window.addEventListener('message', this.bound_handle_iFrameMessageReceiver)

    const { asset } = this.props

    this.setState({ isPlaying: true })

    // we don't want to hide tutorials so we open popup
    if (asset.skillPath && !this.state.isPopup) this.setState({ isPopup: true })

    const val = this.isAutoRun ? this.getEditorValue('') : this.getEditorValue()
    this.tools
      .collectAndTranspile('/' + this.props.asset.name, val)
      .then(() => this.tools.collectSources())
      .then(collectedSources => {
        const startRun = () => {
          if (this.refs.gameScreen && this.refs.gameScreen.isIframeReady()) {
            this._postMessageToIFrame({
              mgbCommand: 'startRun',
              sourcesToRun: collectedSources,
              asset_id: asset._id,
              filename: asset.name || '',
            })
          } else {
            // ask iframe to tell parent that it is ready.. fix for very slow connections
            this._postMessageToIFrame({
              mgbCommand: 'approveIsReady',
            })
            window.setTimeout(startRun, 100)
          }
        }
        startRun()
      })

    !this.isGuest && !this.isTutorialView && this.tabs.openTabByKey('code-runner')
  }

  handleStop = options => {
    this.isCodeTutorial
    this.postToIFrame('stop', options)
    this.setState({
      isPlaying: false,
    })
    window.removeEventListener('message', this.bound_handle_iFrameMessageReceiver)
  }

  handleStopClick = () => {
    this.handleStop({ closePopup: true })
  }

  handleFullScreen = () => {
    const id = this.props.asset._id
    if (this.props.canEdit) {
      // use this so we can get favicon
      // TODO: change iframe manipulations to messages - to use CDN link to blank page
      const urlToOpen = '/blank.html' //window.location.origin + '/api/blank' //- to work with pushState without reload
      let fullScreenWindow = window.open(urlToOpen, 'Bundle')
      this.mgb_fullScreenWindow = fullScreenWindow
      this.createBundle(() => {
        // clear previous data - and everything else
        if (!fullScreenWindow.document) {
          fullScreenWindow = window.open(urlToOpen, 'Bundle')
        }
        const delayReloadIfSaving = () => {
          if (this.props.hasUnsentSaves || this.props.asset.isUnconfirmedSave)
            window.setTimeout(delayReloadIfSaving, 100)
          else {
            //child.history.pushState(null, "Bundle", `/api/asset/code/bundle/${id}`)
            fullScreenWindow.location = `/api/asset/code/bundle/${id}`
          }
        }

        delayReloadIfSaving()
      })
    } else {
      window.open(`/api/asset/code/bundle/${id}`, 'Bundle')
    }
  }

  createBundle(cb) {
    if (!this.isActive) {
      console.log('not creating bundle since not active')
      return
    }
    // this is called directly from publish button also - to disable bundling see:
    // componentDidUpdate
    if (this.props.asset.kind == 'tutorial' || this.isGuest || this.mgb_mode !== 'jsx') {
      return
    }

    if (this.state.creatingBundle || !this.props.canEdit) {
      setTimeout(() => {
        this.createBundle(cb)
      }, 100)
      return
    }
    this.setState({ creatingBundle: true })
    this.tools.createBundle(this.props.asset.dn_ownerName).then(bundle => {
      const value = this.getEditorValue()
      this.tools
        .transpileAndMinify('/' + this.props.asset.name, value, this.props.asset.dn_ownerName)
        .then(es5 => {
          const c2 = this.props.asset.content2

          const newC2 = {
            src: this.codeMirror.getValue(),
            bundle,
            lastBundle: Date.now(),
            needsBundle: c2.needsBundle,
            hotReload: c2.hotReload,
            es5,
          }
          // make sure we have bundle before every save
          this.handleContentChangeAsync(newC2, null, `Published`)
          this.setState({ creatingBundle: false })
          cb && cb()
        })
    })
  }

  handleGamePopup = () => {
    this.setState({ isPopup: !this.state.isPopup })
    this.handleRun()
  }

  handleGamePopout = () => {
    this.refs.gameScreen && this.refs.gameScreen.popup(), this.handleRun()
  }

  /**
   * item is one of the templateCodeChoices[] elements with non-null { label, code }
   */
  pasteSampleCode = item => {
    const newValue = item.code
    this.codeMirror.setValue(newValue)
    this._currentCodemirrorValue = newValue
    const newC2 = { src: newValue }
    this.handleContentChange(newC2, null, `Template code: ${item.label}`)

    const label = item.label.replace(/ /g, '-')
    joyrideStore.completeTag('mgbjr-CT-EditCode-templates-' + label + '-invoke')
  }

  // Note that either c2 or thumbnail could be null/undefined.
  handleContentChange(c2, thumbnail, reason) {
    if (!this.props.canEdit) {
      this.props.editDeniedReminder()
      return
    }

    if (!c2) {
      this.props.handleContentChange(c2, thumbnail, reason)
      return
    }
    const origContent = this.props.asset.content2
    c2.needsBundle = origContent.needsBundle
    c2.hotReload = origContent.hotReload
    // save old bundle if we don't need to rebuild
    if (!c2.needsBundle) c2.bundle = origContent.bundle

    //props trigger forceUpdate - so delay changes a little bit - on very fast changes
    if (this.changeTimeout) {
      window.clearTimeout(this.changeTimeout)
    }
    this.changeTimeoutFn = () => {
      // prevent asset changes to older one because of user activity forced update
      // sencond handle change will overwrite deferred save
      if (this.props.asset.kind === 'tutorial' || this.mgb_mode !== 'jsx') {
        this.changeTimeout = 0
        this.mgb.lastSaved.src = c2.src
        this.props.handleContentChange(c2, thumbnail, reason)
        return
      }

      this.doFullUpdateOnContentChange(errors => {
        // it's not possible to create useful bundle with errors in the code - just save
        console.log('doFullUpdateOnContentChange() callback [A]: error', errors)
        if (errors.length || !this.props.asset.content2.needsBundle || this.isGuest) {
          console.log('doFullUpdateOnContentChange() callback [B]')
          if (!this.isActive) {
            console.log('Discarding bundle ERRORS to prevent overwrite')
            return
          }
          this.tools
            .transpileAndMinify(
              '/' + this.props.asset.name,
              this.getEditorValue(c2.src),
              this.props.asset.dn_ownerName,
            )
            .then(es5 => {
              console.log('doFullUpdateOnContentChange() callback [C]. isActive = ', this.isActive)
              if (!this.isActive) {
                console.log('Discarding transpileAndMinify ERRORS to prevent overwrite')
                return
              }
              c2.es5 = es5
              if (_.isEqual(_.omitBy(this.mgb.lastSaved, _.isUndefined), _.omitBy(c2, _.isUndefined))) {
                console.log('Discarding changes as nothing has changed!')
                return
              }

              this.mgb.lastSaved = _.cloneDeep(c2)

              this.props.handleContentChange(c2, thumbnail, reason)
            })
        } else {
          // createBundle is calling handleContentChangeAsync after completion
          this.createBundle(() => {
            this.changeTimeout = 0
          })
        }
      })
    }

    this.changeTimeout = window.setTimeout(this.changeTimeoutFn, CHANGES_DELAY_TIMEOUT)
  }

  // this can be called even AFTER component unmount.. or another asset has been loaded
  // make sure we don't overwrite another source
  handleContentChangeAsync(c2, thumbnail, reason) {
    if (_.isEqual(this.mgb.lastSaved, c2)) {
      console.log('Discarding changes as nothing has changed!')
      return
    }

    // is this safe to use it here? Don't call handleContentChange() if we have unmounted
    if (this.isActive) {
      this.mgb.lastSaved = _.cloneDeep(c2)
      this.props.handleContentChange(c2, thumbnail, reason)
    } else {
      console.log('Discarding bundle to prevent overwrite')
    }
  }

  handleHotReload() {
    if (this.state.hotReload) {
      this.consoleLog(`Hot Reload - refreshing`)
      if (this.state.isPlaying) {
        this.handleRun()
      }
      if (this.mgb_fullScreenWindow && !this.mgb_fullScreenWindow.closed) this.handleFullScreen()
    }
  }

  getEditorValue(value = this.codeMirror.getValue()) {
    return !this.isGuest ? value : this.props.hourOfCodeStore.prepareSource(value)
  }

  // this is very heavy function - use with care
  // callback gets one argument - array with critical errors
  doFullUpdateOnContentChange(cb) {
    // operation() is a way to prevent CodeMirror updates until the function completes
    // However, it is still synchronous - this isn't an async callback
    this.mgb_c2_hasChanged = true
    this.codeMirror.operation(() => {
      // this is where source tools receive raw source - we are modifying it for HOC
      const val = this.getEditorValue()

      this.runJSHintWorker(val, errors => {
        const critical = errors.filter(e => e.code.substr(0, 1) === 'E')
        this.hasErrors = !!critical.length
        if (this.tools && !this.hasErrors) {
          // set asset name to /assetName - so recursion is handled correctly
          this.tools.collectAndTranspile('/' + this.props.asset.name, val).then(
            () => {
              this.setState({
                astReady: true,
              })
              this.codeMirrorOnCursorActivity()
              cb && cb(critical)
              this.handleHotReload()
            },
            a => {
              console.log('Something failed!!!', a)
            },
          )
        } else {
          cb && cb(critical)
        }
      })
    })
  }

  /**
   * Opens asset in the new tab
   * @param link - location to asset
   */
  openNewTab(link) {
    // open link in the new tab
    const a = document.createElement('a')
    a.setAttribute('href', link)
    a.setAttribute('target', '_blank')
    a.click()
  }
  gotoLineHandler(line, filename) {
    const { asset } = this.props
    if (filename && filename !== '/' + asset.dn_ownerName + '/' + asset.name) {
      const link = this.getImportStringLocation(filename)
      if (link) this.openNewTab(link)
    } else {
      let pos = { line: line - 1, ch: 0 }
      this.codeMirror.scrollIntoView(pos, 100) //100 pixels margin
      this.codeMirror.setCursor(pos)
      this.codeMirror.focus()
    }
  }

  /** This is useful when working with Tern stuff..
   * It is Enabled by setting showDebugAST at top of this file
   */
  renderDebugAST() {
    if (showDebugAST && this.state.atCursorMemberParentRequestResponse)
      return (
        <DebugASTview atCursorMemberParentRequestResponse={this.state.atCursorMemberParentRequestResponse} />
      )
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

  doUndo(e) {
    if (e.target.className !== 'allow-toolbar-shortcuts') this.codeMirror.undo()
    this.setState({ lastUndoRedo: Date.now() })
  }

  doRedo(e) {
    if (e.target.className !== 'allow-toolbar-shortcuts') this.codeMirror.redo()
    this.setState({ lastUndoRedo: Date.now() })
  }

  toolToggleInfoPane() {
    const i = this.state.infoPaneMode
    const newMode = (i + 1) % _infoPaneModes.length

    const oldMode = _infoPaneModes[this.state.infoPaneMode]
    const curMode = _infoPaneModes[newMode]
    // if(!_infoPaneModes[newMode].col2) this.handleStop()
    //
    if (this.state.isPlaying && (!oldMode.col2 || !curMode.col2)) {
      this.handleRun()
    }

    this.setState({ infoPaneMode: newMode })
  }

  generateToolbarConfig() {
    const history = this.codeMirror ? this.codeMirror.historySize() : { undo: 0, redo: 0 }

    var config =
      this.isTutorialView || this.isGuest
        ? {
            buttons: [],
          }
        : {
            // level: 2,    // default level -- This is now in expectedToolbars.getDefaultLevel
            buttons: [
              {
                name: 'doUndo',
                icon: 'undo',
                label: 'Undo',
                iconText: history.undo ? history.undo : '',
                disabled: !history.undo,
                tooltip: 'Undo last action',
                level: 1,
                shortcut: 'Ctrl+Z',
              },
              {
                name: 'doRedo',
                icon: 'undo flip', // redo is flipped undo
                iconText: '', // history.redo ? history.redo : '',
                label: 'Redo',
                disabled: !history.redo,
                tooltip: 'Redo previous action',
                level: 1,
                shortcut: 'Ctrl+Shift+Z',
              },
              { name: 'separator' },
              {
                name: 'goBack',
                icon: 'arrow left',
                level: 2,
                label: 'Go Back',
                tooltip: 'This action will move cursor to the previous location',
                disabled: !this.cursorHistory.undo.length,
                shortcut: 'Ctrl+Alt+LEFT',
              },
              {
                name: 'goForward',
                icon: 'arrow right',
                label: 'Go Forward',
                level: 2,
                tooltip: 'This action will move cursor to the next location',
                disabled: !this.cursorHistory.redo.length,
                shortcut: 'Ctrl+Alt+RIGHT',
              },
              { name: 'separator' },
              {
                name: 'toolZoomOut',
                label: 'Small Font',
                icon: 'zoom out',
                tooltip: 'Smaller Text',
                disabled: false,
                level: 2,
                shortcut: 'Ctrl+P',
              },
              {
                name: 'toolZoomIn',
                label: 'Large font',
                icon: 'zoom in',
                tooltip: 'Larger text',
                disabled: false,
                level: 2,
                shortcut: 'Ctrl+L',
              },
              { name: 'separator' },
              {
                name: 'handleJsBeautify',
                label: 'Beautify Code',
                icon: 'leaf',
                tooltip: 'Beautify: Auto-format your code',
                disabled: false,
                level: 3,
                shortcut: 'Ctrl+B',
              },
              { name: 'separator' },
              {
                name: 'toggleFold',
                label: this.mgb_code_folded ? 'Expand all nodes' : 'Fold all nodes',
                icon: this.mgb_code_folded ? 'expand' : 'compress',
                tooltip: this.mgb_code_folded ? 'Unfold all nodes in the code' : 'Fold all nodes in the code',
                disabled: false,
                level: 3,
                shortcut: 'Ctrl+Shift+\\',
              },
              { name: 'separator' },
              {
                name: 'toolToggleInfoPane',
                label: 'Info Panels',
                icon: 'resize horizontal',
                tooltip: 'Resize Info Pane',
                disabled: false,
                level: 1,
                shortcut: 'Ctrl+I',
              },
            ],
          }

    if (this.props.asset.kind === 'tutorial') {
      config.buttons.unshift({
        name: 'stopTutorial',
        label: 'Stop Tutorial',
        icon: 'stop',
        tooltip: 'Stop Tutorial',
        disabled: false,
        level: 1,
        // shortcut: 'Ctrl+T'
      })
      config.buttons.unshift({
        name: 'tryTutorial',
        label: 'Try Tutorial',
        icon: 'student',
        tooltip: 'Try Tutorial',
        disabled: false,
        level: 1,
        shortcut: 'Ctrl+T',
      })
      config.buttons.push({ name: 'separator' })
      config.buttons.push({
        name: 'toolToggleInfoPane',
        label: 'Info Panes',
        icon: 'resize horizontal',
        tooltip: 'Resize Info Pane',
        disabled: false,
        level: 1,
        shortcut: 'Ctrl+I',
      })
    } else if (this.mgb_mode === 'jsx') {
      // code...
      if (!(this.isTutorialView || this.isGuest)) {
        config.buttons.unshift({ name: 'separator' })
        config.buttons.unshift({
          name: 'toggleHotReload',
          label: 'Automatically reload game screen',
          icon:
            'refresh' +
            `${this.tools && this.mgb_c2_hasChanged ? ' red' : ''} ${!this.state.astReady
              ? ' animate rotate'
              : ''}`,
          tooltip:
            (!this.state.astReady ? 'Loading all required files...\n' : '') +
            'Automatically reloads game screen when one of the imported scripts changes',
          disabled: false,
          active: this.props.asset.content2.hotReload,
          level: 3,
          shortcut: 'Ctrl+Alt+Shift+R',
        })
        config.buttons.push({
          name: 'toolCommentFade',
          label: 'Fade Comments',
          icon: 'grey sticky note',
          tooltip: 'Fade Comments so you can focus on code',
          disabled: false,
          level: 3,
          shortcut: 'Ctrl+Alt+F',
        })
        config.buttons.push({
          name: 'toolCommentUnFade',
          label: 'UnFade Comments',
          icon: 'sticky note',
          tooltip: 'UnFade comments so you can see them again',
          disabled: false,
          level: 3,
          shortcut: 'Ctrl+Alt+Shift+F',
        })
        config.buttons.push({ name: 'separator' })
        config.buttons.push({
          name: 'toggleBundling',
          label: 'Auto Publish game',
          icon: 'send outline',
          tooltip:
            'Automatically publish game on every code change (this asset or one of the imported modules).',
          disabled: false,
          active: this.props.asset.content2.needsBundle,
          level: 3,
          shortcut: 'Ctrl+Alt+Shift+B',
        })
        config.buttons.unshift({
          name: 'handleStopClick',
          label: 'Stop Running',
          icon: 'stop',
          tooltip: 'Stop Running',
          disabled: !this.state.isPlaying,
          level: 1,
          shortcut: 'Ctrl+ENTER',
        })
      } else {
        this.isGuest &&
          config.buttons.unshift({
            name: 'handleEmptyRun',
            label: 'Move to Start',
            icon: 'refresh',
            iconText: 'Move to Start',
            tooltip: 'Move the Dwarf back to the starting position',
            disabled: false,
            level: 1,
            shortcut: null,
          })
        config.buttons.unshift({ name: 'separator' })
      }
      // jsx, regardless of guest/not guest
      config.buttons.unshift({
        name: 'handleRun',
        label: 'Run code',
        icon: 'play',
        iconText: this.isTutorialView || this.isGuest ? 'Run Code' : '',
        tooltip: 'Run Code',
        disabled: (!(this.isTutorialView || this.isGuest) && this.state.isPlaying) || !this.state.astReady,
        level: 1,
        shortcut: 'Ctrl+ENTER',
      })
    } else {
      // css and maybe something else in the future ( e.g. html ? )
      config.buttons.push({ name: 'separator' })
      config.buttons.push({
        name: 'toolCommentFade',
        label: 'Fade Comments',
        icon: 'grey sticky note',
        tooltip: 'Fade Comments so you can focus on code',
        disabled: false,
        level: 3,
        shortcut: 'Ctrl+Alt+F',
      })
      config.buttons.push({
        name: 'toolCommentUnFade',
        label: 'UnFade Comments',
        icon: 'sticky note',
        tooltip: 'UnFade comments so you can see them again',
        disabled: false,
        level: 3,
        shortcut: 'Ctrl+Alt+Shift+F',
      })
    }
    return config
  }

  toggleFold() {
    const cm = this.codeMirror

    cm.operation(() => {
      for (let l = cm.firstLine(); l <= cm.lastLine(); ++l)
        cm.foldCode({ line: l, ch: 0 }, null, this.mgb_code_folded ? 'unfold' : 'fold')

      this.mgb_code_folded = !this.mgb_code_folded
      this.setState({
        mgb_code_folded: this.mgb_code_folded,
      })
    })
  }

  toggleBundling() {
    this.props.asset.content2.needsBundle = !this.props.asset.content2.needsBundle
    this.setState({ needsBundle: this.props.asset.content2.needsBundle })

    this.handleContentChange(this.props.asset.content2, null, 'enableBundling')
  }

  toggleHotReload() {
    this.props.asset.content2.hotReload = !this.props.asset.content2.hotReload
    this.setState({ hotReload: this.props.asset.content2.hotReload })

    this.handleContentChange(this.props.asset.content2, null, 'enableHotReload')
  }

  insertTextAtCursor(text) {
    if (!this.props.canEdit) {
      this.warnNoWriteAccess()
      return
    }
    const editor = this.codeMirror
    var doc = editor.getDoc()
    var cursor = doc.getCursor()
    doc.replaceRange(text, cursor)
  }

  tryTutorial = () => {
    if (!this._currentCodemirrorValue) return
    const { joyride } = this.props

    const parsedJSON = TutorialMentor.parseJson(this._currentCodemirrorValue)

    if (parsedJSON.errorHintString) {
      showToast.error('JSON Parse error: ' + parsedJSON.errorHintString)
      if (parsedJSON.errorCharIdx >= 0) {
        const editor = this.codeMirror
        editor.setCursor(editor.posFromIndex(parsedJSON.errorCharIdx))
        editor.focus()
      }
    }

    if (parsedJSON.data) {
      if (!_.has(parsedJSON.data, 'steps')) showToast.error('Tutorials must have a steps: [] array value')
      else {
        joyride.setDebug(true)
        joyride.addSteps(parsedJSON.data.steps, {
          origAssetId: { ownerName: this.props.asset.dn_ownerName, id: this.props.asset._id },
        })
      }
    }
  }

  stopTutorial = () => {
    const { joyride } = this.props
    joyride.setDebug(false)
    joyride.stop()
  }

  createImportString(val, user) {
    return `import ${validJSName(val)} from '/${user ? user + ':' : ''}${val}'\n`
  }

  includeLocalImport = val => {
    if (!this.props.canEdit) {
      this.warnNoWriteAccess()
      return
    }
    const imp = this.createImportString(val) + this.codeMirror.getValue()

    this.codeMirror.setValue(imp)
    this.handleContentChange({ src: imp })
  }

  includeExternalImport = val => {
    if (!this.props.canEdit) {
      this.warnNoWriteAccess()
      return
    }
    const imp = `import ${val.name} from '${val.import}'\n` + this.codeMirror.getValue()

    this.codeMirror.setValue(imp)
    this.handleContentChange({ src: imp })
  }

  // TODO: add some sort of message to highlighted lines????
  highlightLines(from, to) {
    // make from 1 -> 0 so it's not confusing
    from--
    if (to == void 0 || isNaN(to)) to = from
    else to--

    if (from < 0) {
      this.highlightedLines.forEach(lh => {
        this.codeMirror.removeLineClass(lh, 'background', 'highlight')
      })
    }

    for (let i = from; i <= to; i++) {
      const lh = this.codeMirror.getLineHandle(i)
      // reached end of the file
      if (!lh) return
      this.codeMirror.addLineClass(lh, 'background', 'highlight')
      this.highlightedLines.push(lh)
    }
    // scroll to first highlighted line
    if (from > -1) this.scrollToLine(from)
  }

  scrollToLine(line) {
    this.codeMirror.setCursor(line, 0)
    var t = this.codeMirror.charCoords({ line, ch: 0 }, 'local').top
    var middleHeight = this.codeMirror.getScrollerElement().offsetHeight / 2
    this.codeMirror.scrollTo(null, t - middleHeight - 5)
  }

  getKind(maybeKind) {
    if (AssetKindEnum[maybeKind]) return maybeKind

    switch (maybeKind) {
      case 'png':
        return 'graphic'
    }

    return null
  }

  // this is almost same as: _getMgbAssetIdsInLine
  // leave only one.. or merge both functions into one
  getStringReferences() {
    const token = this.state.currentToken
    const advices = []
    // TODO.. something useful with token.state?
    if (token && token.type === 'string' && this.state.userScripts && this.state.userScripts.length > 0) {
      let string = this.cleanTokenString(token.string)
      if (string.startsWith('/') && !string.startsWith('//') && string.length > 1) {
        string = string.substring(1)
        const parts = this.getImportStringParts(string)
        const { kind, owner, name } = parts
        const urlToAsset = this.getAssetUrl(this.getImportStringParts(string))

        if (string.startsWith('api/asset/')) {
          advices.push(
            <a
              className="ui fluid label"
              key={advices.length}
              style={{ marginBottom: '2px' }}
              href={`/assetEdit/${urlToAsset}`}
              target="_blank"
            >
              <small style={{ fontSize: '85%' }}>
                This string references API link to <strong>{kind}</strong> asset: <code> {name}</code>
              </small>
              <ThumbnailWithInfo
                assetId={urlToAsset}
                expires={60}
                constrainHeight="60px"
                showDimensions={kind === 'graphic'}
                owner={owner}
                name={name}
              />
            </a>,
          )
        } else {
          advices.push(
            <a
              className="ui fluid label"
              key={advices.length}
              style={{ marginBottom: '2px' }}
              href={`/assetEdit/${urlToAsset}`}
              target="_blank"
            >
              <small style={{ fontSize: '85%' }}>
                This string references <strong>{owner}'s</strong> {kind ? kind : ''} asset:{' '}
                <code> {name}</code>
              </small>
              <ThumbnailWithInfo
                assetId={urlToAsset}
                expires={60}
                constrainHeight="60px"
                showDimensions={kind === 'graphic'}
                owner={owner}
                name={name}
              />
            </a>,
          )
        }
      }
    }
    return advices
  }

  /**
   * Retrieves kind / owner / name from string which references asset
   * @param {string} string - string which references asset
   *
   * @returns {kind<string>, owner<string>, name<string>}
   * */

  getImportStringParts(string) {
    // split and filter out empty strings
    const pieces = string.split('/').filter(p => {
      return p
    })

    // assume that we have only name here
    if (pieces.length === 1) pieces.unshift(this.props.asset.dn_ownerName)

    // check if this is API link
    if (pieces.length > 1 && pieces[0] === 'api' && pieces[1] === 'asset') {
      // remove api / asset
      pieces.splice(0, 2)
      const last = _.last(pieces)
      // special handling for music and sound
      if (last === 'music.mp3' || last === 'sound.mp3') pieces.pop()
    }

    const parts = pieces.pop().split(':')
    const name = parts.pop()
    const owner = parts.length ? parts.pop() : pieces.pop()

    const kind = this.getKind(pieces.pop())

    return { kind, owner, name }
  }

  getAssetUrl(assetInfo) {
    const { owner, name, kind } = assetInfo
    // substr - because otherwise chaning to create link with others strings looks too strange - e.g. /thumbnail${myVar}
    // /thumbnail/${myVar} - looks better
    return `${kind ? '/' + kind : ''}${owner ? '/' + owner : ''}${name ? '/' + name : ''}`.substr(1)
  }

  getImportStringLocation(string) {
    return `/assetEdit/${this.getAssetUrl(this.getImportStringParts(string))}`
  }

  getPrevToken(callback, cursor = null) {
    const cur = cursor || Object.assign({}, this.codeMirror.getCursor())
    // TODO: maybe get correct last char of line instead for forcing random number?
    cur.ch = 100
    if (cur.line) {
      cur.line--
      if (callback(this.codeMirror.getTokenAt(cur))) this.getPrevToken(callback, cur)
    }
  }

  getNextToken(callback, tokenIn, cursor = null) {
    const cur = cursor || Object.assign({}, this.codeMirror.getCursor())
    const token = tokenIn || this.codeMirror.getTokenAt(cur)

    // TODO: maybe get correct last char of line instead for forcing random number?
    const line = this.codeMirror.getLine(cur.line)
    if (line === void 0) return

    if (cur.ch > line.length) {
      cur.ch = 0
      cur.line++
    } else cur.ch = (tokenIn ? tokenIn.end : cur.ch) + 1
    const nextToken = this.codeMirror.getTokenAt(cur)
    // is this same token?
    if (nextToken.start == token.start && nextToken.end == token.end) {
      this.getNextToken(callback, nextToken, cur)
    } else {
      if (callback(nextToken)) {
        this.getNextToken(callback, nextToken, cur)
      }
    }
  }

  // Reset code for HoC activity
  handleReset = src => {
    const isConfirmed = confirm('Are you sure you want to reset your code?')
    if (!isConfirmed) return

    this.props.hourOfCodeStore.setCurrStepCompletion(false)
    this.codeMirror.setValue(src)
    this.handleContentChange({ src }, null, `Reset code`)
  }

  handleGameScreenEvent = event => {
    const { hourOfCodeStore: { state: { isLastStep, isActivityOver } } } = this.props
    if (isActivityOver || (isLastStep && this.state.isCurrStepCompleted)) return

    if (event.success) {
      this.props.hourOfCodeStore.setCurrStepCompletion(event.success)
      this.setState({ isCurrStepCompleted: event.success })
    }

    if (event.gameOver) {
      showToast.info('Some gems were not collected! Review your code and try again.')
    }
  }

  handleCloseHocModal = () => {
    this.setState({ isCurrStepCompleted: false })
  }

  handleOpenVideoModal = () => {
    this.setState({ showVideoModal: true })
    // fix video modal open/close not working after content change update
    this.forceUpdate()
  }

  handleCloseVideoModal = () => {
    this.setState({ showVideoModal: false })
    // fix video modal open/close not working after content change update
    this.forceUpdate()
  }

  handleAutoRun = () => {
    this.isAutoRun = false
  }

  handleToggleConsole = () => {
    this.setState({ showConsole: !this.state.showConsole })
  }

  handleOpenConsole = () => {
    this.setState({ showConsole: true })
  }

  //
  // Tabs
  //
  getTabPanes = () => {
    const { asset, canEdit, currUser } = this.props

    const docEmpty = this.state.documentIsEmpty
    const isPlaying = this.state.isPlaying

    const stringReferences = this.getStringReferences()
    const infoPaneOpts = this.isGuest
      ? _infoPaneModes[3]
      : this.isTutorialView ? _infoPaneModes[0] : _infoPaneModes[this.state.infoPaneMode]

    const isPopup = this.state.isPopup || !infoPaneOpts.col2

    const knownImports = this.tools ? this.tools.collectAvailableImportsForFile(asset.name) : []

    return [
      docEmpty &&
      !asset.isCompleted &&
      !this.isCodeTutorial &&
      !this.isChallenge &&
      this.mgb_mode === 'jsx' && {
        title: 'Code Starter',
        key: 'code-starter-content',
        icon: 'file text',
        tooltip: 'Templates for generating starter code',
        content: <CodeStarter asset={asset} handlePasteCode={this.pasteSampleCode} />,
      },
      // TUTORIAL Current Line/Selection helper (body)
      !docEmpty &&
      asset.kind === 'tutorial' && {
        title: 'Tutorial Mentor',
        key: 'tutorial-mentor',
        icon: 'student',
        tooltip: 'Walkthrough of each step of the tutorial',
        content: (
          <div>
            <TutorialMentor
              tryTutorial={this.tryTutorial}
              stopTutorial={this.stopTutorial}
              parsedTutorialData={this.state.parsedTutorialData}
              insertCodeCallback={canEdit ? newCodeStr => this.insertTextAtCursor(newCodeStr) : null}
            />
            {stringReferences &&
            stringReferences.length > 0 && (
              <div className="ui divided selection list">{stringReferences}</div>
            )}
          </div>
        ),
      },
      !docEmpty &&
      asset.kind === 'code' &&
      this.mgb_mode === 'jsx' && {
        title: 'Code Runner',
        key: 'code-runner',
        icon: 'toggle right',
        tooltip: 'Run your code and display the resulting content',
        content: this.state.astReady ? (
          <div
            style={{
              flexFlow: 'column',
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <div style={{ overflowY: 'auto', flex: '1 1 auto', height: 'calc(100% - 2.5em)' }}>
              <span style={{ float: 'right', position: 'relative' }}>
                {isPlaying &&
                this.props.canEdit && (
                  <Button
                    icon
                    compact
                    size="mini"
                    onClick={this.handleScreenshotIFrame.bind(this)}
                    title="This will set the Asset preview Thumbnail image to be a screenshot of the first <canvas> element in the page, *IF* your code has created one..."
                  >
                    <Icon name="save" />
                  </Button>
                )}
                {!isPlaying && (
                  <Button
                    icon
                    compact
                    onClick={this.handleRun}
                    size="mini"
                    title="Click here to start the program running"
                    id="mgb-EditCode-start-button"
                  >
                    <Icon name="play" />&ensp;Run
                  </Button>
                )}
                {isPlaying && (
                  <Button
                    icon
                    compact
                    onClick={this.handleStopClick}
                    size="mini"
                    title="Click here to stop the running program"
                    id="mgb-EditCode-stop-button"
                  >
                    <Icon name="stop" />&ensp;Stop
                  </Button>
                )}
                {isPlaying && (
                  <Button
                    as="a"
                    active={isPopup}
                    icon
                    compact
                    onClick={this.handleGamePopup}
                    size="mini"
                    id="mgb-EditCode-popup-button"
                    title="Popout the code-run area so it can be moved around the screen"
                  >
                    <Icon name="external" />&ensp;Popout
                  </Button>
                )}
                {isPlaying && (
                  <Button
                    as="a"
                    icon
                    compact
                    onClick={this.handleGamePopout}
                    size="mini"
                    title="Open Game screen in the window"
                    id="mgb-EditCode-popup-button"
                  >
                    <Icon name="external" />&ensp;Full
                  </Button>
                )}
                {!this.hasErrors && (
                  <Button
                    icon
                    compact
                    disabled={!this.props.canEdit}
                    onClick={this.handleFullScreen}
                    size="mini"
                    title={
                      this.props.canEdit ? (
                        'Click here to publish your game and automatically open it in the new browser window (tab)'
                      ) : (
                        'Open published version of this game'
                      )
                    }
                    id="mgb-EditCode-full-screen-button"
                  >
                    <Icon name="send outline" />
                    &ensp;{this.props.canEdit ? 'Publish' : 'View Published'}
                  </Button>
                )}
              </span>
              {!isPopup && this.renderGameScreen()}
            </div>
            <div style={{ flex: '0 1 4em', height: '100%' }}>
              {this.refs.gameScreen && (
                <ConsoleMessageViewer
                  messages={this.state.consoleMessages}
                  gotoLinehandler={this.gotoLineHandler.bind(this)}
                  clearConsoleHandler={this._consoleClearAllMessages.bind(this)}
                  style={{
                    maxHeight: '100px',
                    marginBottom: '1em',
                  }}
                />
              )}
            </div>
          </div>
        ) : (
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        ),
      },
      !docEmpty &&
      asset.kind === 'code' && {
        title: 'Code Docs',
        key: 'code-docs',
        icon: 'book',
        tooltip: 'Documentation for JS/CSS/Phaser',
        content:
          this.mgb_mode === 'css' ? (
            <div className="ui divided selection list active">
              <Segment>
                <p>
                  This asset is treated as Cascading Style Sheets (CSS) file - because of the
                  <em>css</em> extension in the filename
                </p>
                <p>
                  You can find more about CSS in the{' '}
                  <a
                    href="https://developer.mozilla.org/en-US/docs/Web/CSS"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    MDN Web Docs / Web / CSS
                  </a>{' '}
                </p>
              </Segment>
            </div>
          ) : this.mgb_mode === 'jsx' ? (
            // Current Line/Selection helper (body)
            <div>
              <TokenDescription
                currentToken={this.state.currentToken}
                getPrevToken={cb => this.getPrevToken(cb)}
                getNextToken={cb => this.getNextToken(cb)}
                comment={this.state.comment}
              />
              <FunctionDescription
                functionHelp={this.state.functionHelp}
                functionArgPos={this.state.functionArgPos}
                functionTypeInfo={this.state.functionTypeInfo}
                helpDocJsonMethodInfo={this.state.helpDocJsonMethodInfo}
              />

              {this.state.atCursorTypeRequestResponse.data &&
              this.state.atCursorTypeRequestResponse.data.exprName && (
                <ExpressionDescription expressionTypeInfo={this.state.atCursorTypeRequestResponse.data} />
              )}
              {(!this.state.atCursorTypeRequestResponse.data ||
                !this.state.atCursorTypeRequestResponse.data.exprName) && (
                <InvokingDescription typeDescription={this.state.atCursorTypeDescription} />
              )}

              <RefsAndDefDescription
                refsInfo={this.state.atCursorRefRequestResponse.data}
                defInfo={this.state.atCursorDefRequestResponse.data}
                expressionTypeInfo={this.state.atCursorTypeRequestResponse.data}
              />

              {this.renderDebugAST()}

              {stringReferences &&
              stringReferences.length > 0 && (
                <div className="ui divided selection list">{stringReferences}</div>
              )}
            </div>
          ) : null,
      },
      // Import Assistant HEADER
      canEdit &&
      !asset.isCompleted &&
      !this.isCodeTutorial &&
      !this.isChallenge &&
      this.mgb_mode === 'jsx' && {
        title: 'Import Assistant',
        key: 'import-assistant',
        icon: 'download',
        tooltip: 'Interface for importing MGB code assets or JS frameworks',
        content: this.state.astReady ? (
          <ImportHelperPanel
            scripts={this.state.userScripts}
            includeLocalImport={this.includeLocalImport}
            includeExternalImport={this.includeExternalImport}
            knownImports={knownImports}
          />
        ) : (
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        ),
      },
      !this.isCodeTutorial &&
      !this.isChallenge &&
      asset.kind === 'code' &&
      this.mgb_mode === 'jsx' && {
        title: 'Code Flower',
        key: 'code-flower',
        icon: 'asterisk',
        tooltip: 'Code visualization',
        content: this.state.astReady ? (
          <div>
            {
              // Is this needed?
              /*this.props.canEdit &&
            this.state.astReady && (
              <Button
                icon
                compact
                floated="right"
                size="mini"
                onClick={this.drawAstFlower.bind(this)}
                title="This will make abstract image of your code"
              >
                <Icon name="write square" />&ensp;Draw AST
              </Button>
            )*/
            }
            <span style={{ float: 'right', position: 'relative' }}>
              {this.state.astFlowerReady &&
              this.props.canEdit && (
                <Button
                  icon
                  compact
                  size="mini"
                  title="Save the currently displayed CodeFlower as the Code Asset preview 'thumbnail' image for this asset"
                >
                  <Icon name="save" />&ensp;Save AST
                </Button>
              )}
              <Button
                icon
                compact
                size="mini"
                onClick={this.drawAstFlowerForThumbnail.bind(this, asset._id)}
                title="Generate an abstract CodeFlower image based on the structure of your source code"
              >
                <Icon name="asterisk" />&ensp;Simple
              </Button>
              <Button
                icon
                compact
                size="mini"
                onClick={this.drawAstFlowerFull.bind(this, asset._id)}
                title="Generate a more detailed CodeFlower image based on the structure of your source code"
              >
                <Icon name="certificate" />&ensp;Detailed
              </Button>
            </span>
            <div id="codeflower" ref="codeflower" />
          </div>
        ) : (
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        ),
      },
    ].filter(Boolean)
  }

  renderGameScreen = () => {
    const { asset, hourOfCodeStore: { state: { currStepId } } } = this.props

    const infoPaneOpts = this.isGuest
      ? _infoPaneModes[3]
      : this.isTutorialView ? _infoPaneModes[0] : _infoPaneModes[this.state.infoPaneMode]

    const isPopup = this.state.isPopup || !infoPaneOpts.col2

    return (
      <GameScreen
        key="gameScreen"
        ref="gameScreen"
        isPopup={isPopup}
        isPopupOnly={this.isCodeTutorial}
        isHidden={this.isChallenge}
        isPlaying={this.state.isPlaying}
        isAutoRun={this.isAutoRun}
        onAutoRun={this.handleAutoRun}
        hocStepId={currStepId}
        asset={asset}
        consoleAdd={this._consoleAdd.bind(this)}
        handleContentChange={this.handleContentChange.bind(this)}
        handleStop={this.isCodeTutorial ? this.handleStop : this.handleGamePopup}
        onEvent={this.handleGameScreenEvent}
      />
    )
  }

  // Simplified views of right panels (replaces accordions)
  // For HoC, Code Challenges, and Code Tutorials
  renderHoc = tbConfig => {
    return (
      <div>
        {this.bound_handle_iFrameMessageReceiver ? (
          <div>
            <Toolbar actions={this} config={tbConfig} name="EditCode" ref="toolbar" />
            {this.renderGameScreen()}
            <ConsoleMessageViewer
              messages={this.state.consoleMessages}
              gotoLinehandler={this.gotoLineHandler.bind(this)}
              clearConsoleHandler={this._consoleClearAllMessages.bind(this)}
              style={{
                maxHeight: '100px',
              }}
            />
          </div>
        ) : (
          <Dimmer inverted active>
            <Loader>Preparing code runner...</Loader>
          </Dimmer>
        )}
      </div>
    )
  }

  renderTutorial = (asset, currUser) => {
    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'column',
          height: 'inherit',
          overflowY: 'auto',
        }}
      >
        <div
          id="tutorial-container"
          style={{ overflowY: 'auto', flex: '1 1 auto', height: 'calc(100% - 2.5em)' }}
        >
          {this.isCodeTutorial && (
            <CodeTutorials
              style={{ backgroundColor: 'rgba(0,255,0,0.02)', height: 'calc(100% - 2.5em)' }}
              isOwner={currUser && currUser._id === asset.ownerId}
              active={!!asset.skillPath}
              skillPath={asset.skillPath}
              codeMirror={this.codeMirror}
              currUser={currUser}
              userSkills={this.userSkills}
              quickSave={this.quickSave.bind(this)}
              runCode={this.handleRun}
              handleOpenConsole={this.handleOpenConsole}
              highlightLines={this.highlightLines.bind(this)}
              assetId={asset._id}
              asset={asset}
            />
          )}
          {this.isChallenge && (
            <CodeChallenges
              style={{ backgroundColor: 'rgba(0,255,0,0.02)', height: 'calc(100% - 2.5em)' }}
              active={!!asset.skillPath}
              skillPath={asset.skillPath}
              codeMirror={this.codeMirror}
              currUser={currUser}
              userSkills={this.userSkills}
              runChallengeDate={this.state.runChallengeDate}
              runCode={this.handleRun}
              handleOpenConsole={this.handleOpenConsole}
            />
          )}
        </div>
        <div style={{ flex: '0 1 4em', height: '100%' }}>
          {this.renderGameScreen()}
          <Accordion fluid>
            <Accordion.Title style={{ padding: 0 }} onClick={this.handleToggleConsole}>
              {this.state.showConsole ? (
                <Button compact fluid size="mini" icon="chevron down" />
              ) : (
                <Button compact fluid size="mini" icon="chevron up" />
              )}
            </Accordion.Title>
            <Accordion.Content style={{ padding: 0 }} active={this.state.showConsole}>
              <ConsoleMessageViewer
                messages={this.state.consoleMessages}
                gotoLinehandler={this.gotoLineHandler.bind(this)}
                clearConsoleHandler={this._consoleClearAllMessages.bind(this)}
                style={{
                  maxHeight: '100px',
                  marginBottom: '2em',
                }}
              />
            </Accordion.Content>
          </Accordion>
        </div>
      </div>
    )
  }

  render() {
    const {
      asset,
      currUser,
      hourOfCodeStore: { state: { api, steps, currStep, isLastStep, isActivityOver } },
    } = this.props

    if (!asset) return null

    this.codeMirror && this.codeMirror.setOption('readOnly', !this.props.canEdit)

    const infoPaneOpts = this.isGuest
      ? _infoPaneModes[3]
      : this.isTutorialView ? _infoPaneModes[0] : _infoPaneModes[this.state.infoPaneMode]

    const tbConfig = this.generateToolbarConfig()

    const isPopup = this.state.isPopup || !infoPaneOpts.col2

    const fullSize = {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: '1em',
    }

    if (asset.skillPath && asset.kind === 'code') {
      if (isPathChallenge(asset.skillPath)) this.isChallenge = true
      else if (isPathCodeTutorial(asset.skillPath)) this.isCodeTutorial = true
    }

    return (
      <div>
        {this.isGuest && (
          <div>
            {/* HoC VIDEO MODAL */}
            {currStep &&
            currStep.videoId && (
              <Modal
                open={this.state.showVideoModal}
                closeOnDimmerClick
                closeIcon
                style={{ background: 'rgba(0,0,0,0)' }}
                onClose={this.handleCloseVideoModal}
              >
                <VideoFrame videoId={currStep.videoId} hd="1080" width="854px" height="480px" />
              </Modal>
            )}

            {/* HoC STEP COMPLETION MODAL */}
            <Modal
              closeOnDimmerClick
              closeIcon
              open={this.state.isCurrStepCompleted && !isLastStep}
              size="small"
              onClose={this.handleCloseHocModal}
            >
              <Header as="h1" color="green" textAlign="center">
                <p>
                  <Icon name="check circle" />Success!
                </p>
              </Header>
              <Modal.Actions style={{ display: 'flex', justifyContent: 'center' }}>
                <Button primary onClick={hourOfCodeStore.stepNext}>
                  Continue
                </Button>
              </Modal.Actions>
            </Modal>

            {/* HoC ACTIVITY FINISH MODAL */}
            <Modal size="large" open={isActivityOver || (isLastStep && this.state.isCurrStepCompleted)}>
              <Header as="h1" color="green" textAlign="center">
                <p>
                  <Icon name="graduation" />Congratulations, you completed the activity!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div>
                    <Image centered src="/images/logos/hoc/HourOfCode_logo_RGB.png" style={{ width: 140 }} />
                  </div>
                  <div style={{ color: 'black', padding: '10px' }}>
                    <Icon style={{ margin: 0 }} name="plus" size="large" />
                  </div>
                  <div>
                    <Segment
                      inverted
                      style={{ margin: 'auto', borderRadius: '8px', width: 140, height: 140 }}
                    >
                      <Image centered src={UX.makeMascotImgLink('team')} style={{ width: 140 }} />
                      <Image centered src="/images/logos/mgb/medium/01w.png" style={{ width: 140 }} />
                    </Segment>
                  </div>
                </div>
              </Header>
              <Modal.Content style={{ display: 'flex', justifyContent: 'center' }}>
                {/* This should link to the HoC certificate upon completion */}
                <div style={{ display: 'inline-block', textAlign: 'center' }}>
                  <h3>
                    <a target="_blank" rel="noopener noreferrer" href="https://code.org/api/hour/finish">
                      I've finished my Hour of Code™ <Icon name="sign out" />
                    </a>
                  </h3>
                  <EnrollButton />
                </div>
              </Modal.Content>
            </Modal>
          </div>
        )}
        <div className="ui grid">
          {this.state.creatingBundle && <div className="loading-notification">Publishing source code...</div>}
          <div className="row stretched">
            <div className={infoPaneOpts.col1 + ' wide column'}>
              {this.isGuest && (
                <HocActivity
                  assetId={asset._id}
                  onReset={this.handleReset}
                  openVideoModal={this.handleOpenVideoModal}
                />
              )}
              {!(this.isTutorialView || this.isGuest) && (
                <Toolbar actions={this} config={tbConfig} name="EditCode" ref="toolbar" />
              )}
              {!this.isGuest ? (
                <div
                  className={'accept-drop' + (this.props.canEdit ? '' : ' read-only')}
                  onDrop={e => {
                    this.handleDropAsset(this.codeMirror, e)
                  }}
                  onDragOver={e => {
                    this.handleDragOver(this.codeMirror, e)
                  }}
                >
                  <textarea
                    ref="textarea"
                    className="allow-toolbar-shortcuts"
                    defaultValue={asset.content2.src}
                    autoComplete="off"
                    placeholder="Start typing code here..."
                  />
                </div>
              ) : (
                <Segment inverted raised style={{ position: 'relative', margin: 0, padding: 0 }}>
                  <Header as="h3" inverted sub attached="top" style={{ margin: 0 }}>
                    Enter commands here
                  </Header>
                  <textarea
                    ref="textarea"
                    className="allow-toolbar-shortcuts"
                    defaultValue={asset.content2.src}
                    autoComplete="off"
                    placeholder="Start typing code here..."
                  />
                  <div
                    style={{
                      position: 'absolute',
                      padding: '0.5em',
                      bottom: '1em',
                      right: '1em',
                      background: '#333',
                      borderTop: '2px solid #58C',
                      fontSize: '0.9em',
                      zIndex: 100,
                    }}
                  >
                    <Icon name="trophy" />
                    Try to solve this level with{' '}
                    <strong>{currStep && currStep.locToSolve} lines of code</strong>
                  </div>
                </Segment>
              )}
              {this.isGuest &&
              steps && (
                <Segment stacked>
                  <Header as="h3" sub>
                    Command Reference
                  </Header>
                  <Table basic compact definition size="small">
                    <Table.Body>
                      {_.map(_.get(currStep, 'api'), command => (
                        <Table.Row key={command}>
                          <Table.Cell>
                            <pre style={{ margin: 0 }}>
                              <code>{api[command].code}</code>
                            </pre>
                          </Table.Cell>
                          <Table.Cell>{api[command].description}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Segment>
              )}
            </div>
            <div
              className={infoPaneOpts.col2 + ' wide column'}
              style={{ display: infoPaneOpts.col2 ? 'block' : 'none' }}
            >
              {!this.isGuest && !this.isTutorialView ? (
                <div style={fullSize}>
                  <Tabs ref={ref => (this.tabs = ref)} panes={this.getTabPanes()} />
                </div>
              ) : (
                <Segment raised className="pane-container" style={{ overflow: 'hidden', ...fullSize }}>
                  {this.isGuest ? this.renderHoc(tbConfig) : this.renderTutorial(asset, currUser)}
                </Segment>
              )}
            </div>
          </div>
          {!(this.isTutorialView || this.isGuest) && isPopup && this.renderGameScreen()}
        </div>
      </div>
    )
  }
}

EditCode.contextTypes = {
  skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
}

export default withStores({
  hourOfCodeStore,
  joyride: joyrideStore,
})(EditCode)
