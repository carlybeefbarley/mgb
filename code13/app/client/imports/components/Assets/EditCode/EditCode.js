var update = require('react-addons-update');

import _ from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';
import { snapshotActivity } from '/imports/schemas/activitySnapshots.js';
import { templateCode } from './templates/TemplateCode.js';
import { js_beautify } from 'js-beautify';
import CodeMirror from '../../CodeMirror/CodeMirrorComponent.js';
import KeyBindingAssist from '../../Skills/Keybindings.js';
import ConsoleMessageViewer from './ConsoleMessageViewer.js'


// **GLOBAL*** Tern JS - See comment below...   
import scoped_tern from "tern";
window.tern = scoped_tern;   // 'tern' symbol needs to be GLOBAL due to some legacy non-module stuff in tern-phaser

// Tern 'definition files'
import "tern/lib/def";     // Do I need? since I'm doing it differently in next 2 lines...
import Defs_ecma5 from "./tern/Defs/ecma5.json";
import Defs_browser from './tern/Defs/browser.json';
import Defs_phaser from "./tern/Defs/DefsPhaser";
import Defs_lodash from "./tern/Defs/DefsLodash";

import JsonDocsFinder from './tern/Defs/JsonDocsFinder.js';

import cm_tern_lib_comment from "tern/lib/comment";
// ?  <script src="/tern/plugin/doc_comment.js"></script>
  
  
import InstallMgbTernExtensions from './tern/MgbTernExtensions.js';
import "codemirror/addon/tern/tern";

import FunctionDescription from './tern/FunctionDescription.js';
import ExpressionDescription from './tern/ExpressionDescription.js';
import RefsAndDefDescription from './tern/RefsAndDefDescription.js';
import TokenDescription from './tern/TokenDescription.js';

import MgbMagicCommentDescription from './tern/MgbMagicCommentDescription.js';

import DebugASTview from './tern/DebugASTview.js';
let showDebugAST = false    // Handy thing while doing TERN dev work


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

  constructor(props) {
    super(props);
    this.fontSizeSettingIndex = undefined;

    // save jshint reference - so we can kill it later
    this.jshintWorker = null

    this.state = {
      _preventRenders: false,        // We use this as a way to batch updates. 
      consoleMessages: [],
      gameRenderIterationKey: 0,
      isPlaying: false,
      previewAssetIdsArray: [],        // Array of { id: assetIdString, kind: assetKindString } e.g. { id: "asdxzi87q", kind: "graphic" }
      
      documentIsEmpty: true,          // until loaded
      
      // tern-related stuff:
      functionHelp: undefined,
      functionArgPos: -1,
      atCursorTypeRequestResponse: {},
      atCursorRefRequestResponse: {},
      atCursorDefRequestResponse: {},
      
      defaultPhaserVersionNNN: "2.4.6",       // TODO make this a prop or system constant
      mgbopt_game_engine: null,               // Determined anywhere in the file
      currentLineDeterminesGameEngine: null   // Determined by current line/selection
    }
    this.cache = {}
    this.lastBundle = null
    this.hintWidgets = []
  }
  
  
  handleJsBeautify()
  {
    let newValue = js_beautify(this._currentCodemirrorValue, {indent_size: 2})
    this.codeMirror.setValue(newValue)
    this._currentCodemirrorValue = newValue;
    let newC2 = { src: newValue }
    this.handleContentChange( newC2, null, `Beautify code`)
  }


  componentDidMount() {
    this.getElementReferences()    
        
    // Debounce the codeMirrorUpdateHints() function
    this.codeMirrorUpdateHints = _.debounce(this.codeMirrorUpdateHints, 100, true)
    
    // Semantic-UI item setup (Accordion etc)
    $('.ui.accordion').accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })

    // Tern setup
    var myTernConfig = {
      useWorker: true,
      defs: [Defs_ecma5, Defs_browser, Defs_lodash, Defs_phaser],
      completionTip: function (curData) { 
        // we get called for the CURRENTLY highlighted entry in the autocomplete list. 
        // We are provided fields like
        //   name, type     ... pretty reliably
        //   doc, url       ... sometimes (depending on dataset) 
        return curData.doc  + (curData.type ? "\n\n"+curData.type : "") 
      },
      // TODO: is there a simple "meteor" way to get these files from node_modules???
      workerDeps: [
        "/lib/acorn/acorn.js",
        "/lib/acorn/acorn_loose.js",
        "/lib/acorn/walk.js",
        "/lib/tern/signal.js",
        "/lib/tern/tern.js",
        "/lib/tern/def.js",
        "/lib/tern/infer.js",
        "/lib/tern/comment.js"
      ],
      workerScript: "/lib/TernWorker.js"
      // ,
      // responseFilter: function (doc, query, request, error, data)
      // {
      //   // Woah - capture all the responses from the TernServer
      //   console.log("REQ",request, "  DATA",data)
      //   return data
      // }

      // typeTip: function(..) this would be a function that creates a DOM element to render the typeTip
    }

    this.ternServer = new CodeMirror.TernServer(myTernConfig)

    InstallMgbTernExtensions(tern);

    // CodeMirror setup
    const textareaNode = this.refs.textarea
    let cmOpts = {  
      mode: "jsx",
      theme: "eclipse",
      styleActiveLine: true,
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 2,
      readOnly: !this.props.canEdit,    // Note, not reactive, so be aware of that if we do dynamic permissions in future.
      foldGutter: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      viewportMargin: Infinity,
      
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
        "'.'": cm => {return this.codeEditPassAndHint(cm)},
        "Ctrl-Space": (cm) => { this.ternServer.complete(cm); },
        "Ctrl-I": (cm) => { this.ternServer.showType(cm); },
        "Ctrl-D": (cm) => { this.ternServer.showDocs(cm); },
        "Alt-J": (cm) => { this.ternServer.jumpToDef(cm); },
        "Ctrl-B": (cm) => {this.handleJsBeautify(cm); },
        "Alt-,": (cm) => { this.ternServer.jumpBack(cm); },
        "Ctrl-Q": (cm) => { this.ternServer.rename(cm); },
        "Ctrl-S": (cm) => { this.ternServer.selectName(cm); },
        "Ctrl-O": (cm) => { cm.foldCode(cm.getCursor()); }
      },
      //lint: true,   // TODO - use eslint instead? Something like jssc?
      autofocus: true,
      highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true}
    }
    
    this.codeMirror = CodeMirror.fromTextArea(textareaNode, cmOpts)
    
    this.codeMirror.on('change', this.codemirrorValueChanged.bind(this))
    this.codeMirror.on("cursorActivity", this.codeMirrorOnCursorActivity.bind(this, false))


    this._currentCodemirrorValue = this.props.asset.content2.src || '';
    
    this.codeMirrorUpdateHints(true)
    
    this.codeMirror.getWrapperElement().addEventListener('wheel', this.handleMouseWheel.bind(this));

    this.codeMirror.setSize("100%", "500px")
    
    // Resize Handler - a bit complicated since we want to use to end of page
    // TODO: Fix this properly using flexbox/stretched so the content elements stretch to take remaining space.
    //       NOTE that the parent elements have the wrong heights because of a bunch of cascading h=100% styles. D'oh.
    var ed = this.codeMirror;
    this.edResizeHandler = e => {       
      let $sPane = $(".CodeMirror")
      let h = window.innerHeight - ( 16 + $sPane.offset().top )
      let hpx = h.toString() + "px"
      ed.setSize("100%", hpx)
      $(".mgbAccordionScroller").css("max-height", hpx);
      $(".mgbAccordionScroller").css("overflow-y", "scroll");
    }
    $(window).on("resize",  this.edResizeHandler)
    this.edResizeHandler();
  }


  codeMirrorOnCursorActivity() 
  {
    // Indirecting this to help with debugging and maybe some future optimizations
    this.codeMirrorUpdateHints(false)  
  }

  componentWillUnmount() {
    $(window).off("resize", this.edResizeHandler)
    // TODO: Destroy CodeMirror editor instance?

    this.jshintWorker.terminate();
    this.jshintWorker = null;

    // this also will terminate worker (if in worker mode)
    this.ternServer.destroy();
    this.ternServer = null;

    // clean up
    this.cache = {};
    this.lastBundle = null;
  }

  codeEditPassAndHint(cm) {
    if (this.props.canEdit)
      setTimeout(() => {



        this.ternServer.complete(cm);
      }, 1000)      // Pop up a helper after a second
// this.ternServer.getHint(cm, function (hint) 
// {
// console.log("HINT",hint)
// })    
    return CodeMirror.Pass       // Allow the typed character to be part of the document
  }

  
  componentWillReceiveProps (nextProps) {
    let currentCursor = this.codeMirror.getCursor()
    let newVal = nextProps.asset.content2.src
    
    if (this.codeMirror && newVal !== undefined && this._currentCodemirrorValue !== newVal) {
      this.codeMirror.setValue(newVal)
      this._currentCodemirrorValue = newVal       // This needs to be done here or we will loop around forever
      this.codeMirror.setCursor(currentCursor)    // Note that this will trigger the source Analysis stuff also.. and can update activitySnapshots. TODO(@dgolds) look at inhibiting the latter
    }  
  }
  
  
  
  doHandleFontSizeDelta(delta) {   // delta should be -1 or +1
    const fontSizes = [
      { fontSize: '8.5px',  lineHeight: '10px'},
      { fontSize: '9px',  lineHeight: '11px'},
      { fontSize: '9px',  lineHeight: '12px'},
      { fontSize: '10px', lineHeight: '12px'},
      { fontSize: '10px', lineHeight: '13px'},
      { fontSize: '10px', lineHeight: '14px'},
      { fontSize: '11px', lineHeight: '15px'},
      { fontSize: '12px', lineHeight: '16px'},
      { fontSize: '13px', lineHeight: '17px'},
      { fontSize: '14px', lineHeight: '19px'},
      { fontSize: '15px', lineHeight: '19px'},
      { fontSize: '16px', lineHeight: '20px'}      
    ];
    if (this.fontSizeSettingIndex === undefined)
      this.fontSizeSettingIndex = 9

    // Changing font size - http://codemirror.977696.n3.nabble.com/Changing-font-quot-on-the-go-quot-td4026016.html 
    let editor = this.codeMirror
    let validDelta = 0
    
    if (delta > 0 && this.fontSizeSettingIndex > 0 )
      validDelta = -1
    else if (delta < 0 && this.fontSizeSettingIndex < fontSizes.length-1 )
      validDelta = 1
      
    if (Math.abs(validDelta) !== 0)   // Watch out for stupid -0 and NaN
    {
      this.fontSizeSettingIndex += validDelta
      var nfs=fontSizes[this.fontSizeSettingIndex]    // nfs:new font size
      editor.getWrapperElement().style["font-size"] = nfs.fontSize 
      editor.getWrapperElement().style["line-height"] = nfs.lineHeight
      editor.refresh(); 
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
    $('head').append(`<style id="${customCSSid}">.cm-comment { opacity: ${alpha/100} }</style>`);
  }
  
  
  // Alt-Shift Mousewheel will change the editor font Size
  handleMouseWheel(event)
  {
    // We only handle alt-shift + wheel or alt-wheel. Anything else is system behavior (scrolling etc)
    if (event.altKey === false)
      return
    
    event.preventDefault();     // No default scroll behavior in the cases we handle (alt-)
    
    // WheelDelta system is to handle MacOS that has frequent small deltas,
    // rather than windows wheels which typically have +/- 120
    this.mgb_wheelDeltaAccumulator = (this.mgb_wheelDeltaAccumulator || 0) + event.wheelDelta;
    let wd = this.mgb_wheelDeltaAccumulator;    // shorthand

    if (Math.abs(wd) > 60)
    {
      let delta = Math.sign(wd)
      if (event.shiftKey)
        this.doHandleFontSizeDelta(delta)
      else 
        this.doHandleCommentFadeDelta(delta)
      this.mgb_wheelDeltaAccumulator = 0
    }     
  }
  
  
  _getMgbAssetIdsInLine(lineText)
  {
    let re=/api\/asset\/([a-z]+)\/([A-Za-z0-9]+)/g
    let matches=[]
    let match
    while ( ( match = re.exec( lineText ) ) && matches.push( 
      { id: match[2],
        kind: match[1]
      }
       ) ) 
      ;
    return _.uniqBy(matches, 'id')
  }
  
  /** Just show the Clean Sheet helpers if there is no code */
  srcUpdate_CleanSheetCase()
  {
    this.setState( {documentIsEmpty: this._currentCodemirrorValue.length === 0} )
  }
  
  
  /** Look for any MGB asset strings in current line or selection */
  srcUpdate_LookForMgbAssets()
  {
    // Extract Asset IDs in current line for 'Current line help' view
    let thisLine = this.codeMirror.getSelection(';')
    if (!thisLine || thisLine.length === 0) {
      const thisLineNum = this.codeMirror.getCursor().line
      thisLine = this.codeMirror.getLine(thisLineNum)
    }
    const AssetIdsAndKinds = this._getMgbAssetIdsInLine(thisLine)
    this.setState( { previewAssetIdsArray: AssetIdsAndKinds } )
  }

  /** Runs JSHINT on the user's code and show any relevant issues as widgets 
    * directly below that code in CodeMirror. This was adapted from the demo code
    * at https://codemirror.net/demo/widget.html
   */
  srcUpdate_ShowJSHintWidgetsForCurrentLine(fSourceMayHaveChanged = false)
  {
    //return // TODO make this user-selectable
    const editor = this.codeMirror
    var widgets = this.hintWidgets
    var currentLineNumber = editor.getCursor().line + 1     // +1 since user code is 1...

    // operation() is a way to prevent CodeMirror updates until the function completes
    // However, it is still synchronous - this isn't an async callback
    this.codeMirror.operation(() => {
      /*if ( !fSourceMayHaveChanged ){
        return;
      }*/
      for (var i = 0; i < widgets.length; ++i)
        editor.removeLineWidget(widgets[i]);
        
      widgets.length = 0;

      /*
      if (fSourceMayHaveChanged === true)
        JSHINT(editor.getValue());      // TODO: Can we look at the JSHINT results that Codemirror has instead of re-running it?
          
      for (var i = 0; i < JSHINT.errors.length; ++i) {
        var err = JSHINT.errors[i];
        if (!err || err.line !== currentLineNumber)   // We only show widget for our current line
          continue;
        
        // Could use React here, but it would add more lifecycle complexity than it is worth
        var msg = document.createElement("div");
        var icon = msg.appendChild(document.createElement("span"));
        icon.innerHTML = "!!";
        icon.className = "widget-lint-error-icon";
        msg.appendChild(document.createTextNode(err.reason));
        msg.className = "widget-lint-error";
        widgets.push(editor.addLineWidget(err.line - 1, msg, {
          coverGutter: false, 
          noHScroll: true
        })
        );
      }*/

      // terminate old busy worker - as jshint can take a lot time on huge scripts
      if(this.jshintWorker && this.jshintWorker.isBusy){
        this.jshintWorker.terminate();
        this.jshintWorker = null;
      }

      if(!this.jshintWorker) {
        // TODO: now should be easy to change hinting library - as separate worker - make as end user preference?
        const worker = this.jshintWorker = new Worker("/lib/JSHintWorker.js");

        worker.onmessage = function (e) {
          worker.isBusy = false;
          // clean up old messages
          editor.clearGutter("CodeMirror-lint-markers");

          const errors = e.data[0]
          // TODO: optimization: skip invisible lines?
          // TODO: show multiple errors on same line
          // TODO: allow user to change error level? Warning / Error?
          const msgs = {};
          for (var i = 0; i < errors.length; ++i) {
            const err = errors[i];
            if (!err) continue;
            const msg = msgs[err.line] ? msgs[err.line] : document.createElement("div");
            // msg.errorTxt = err.reason;

            if (!msgs[err.line]) {
              msgs[err.line] = msg;
              msg.icon = msg.appendChild(document.createElement("div"));
              //icon.innerHTML = "!";
              if (err.code.substring(0, 1) == "W") {
                msg.icon.className = "CodeMirror-lint-marker-warning";
              }
              else {
                msg.icon.className = "CodeMirror-lint-marker-error";
              }
              msg.container = msg.appendChild(document.createElement("div"));
              msg.container.className = "lint-error-text";

            }
            else if (!msg.multi) {
              msg.multi = msg.icon.appendChild(document.createElement("div"));
              msg.multi.className = "CodeMirror-lint-marker-multiple";
            }
            // override warning icon to Error
            if (err.code.substring(0, 1) == "E") {
              msg.icon.className = "CodeMirror-lint-marker-error";
            }

            const text = msg.container.appendChild(document.createElement("div"));
            const ico = text.appendChild(document.createElement("div"));
            if (err.code.substring(0, 1) == "W") {
              ico.className = "CodeMirror-lint-marker-warning";
            }
            else {
              ico.className = "CodeMirror-lint-marker-error";
            }

            text.appendChild(document.createTextNode(" "+err.reason));

            msg.className = "lint-error";
            editor.setGutterMarker(err.line - 1, "CodeMirror-lint-markers", msg);

            //var evidence = msg.appendChild(document.createElement("span"));
            //evidence.className = "lint-error-text evidence";
            //evidence.appendChild(document.createTextNode(err.evidence));
          }
        };
      }

      const conf = {
        browser: true,
        esversion: 6,
        asi: true,

        //globalstrict: true,
        strict: "implied",

        undef: true,
        unused: true,
        loopfunc: true,
        predef: {
          "alert": false,// why alert is not defined?
          //"require": false,
          //"exports": false,
          "Phaser": false,
          "PIXI": false,
          "console": false,
          "_": false
        }
      };
      this.jshintWorker.isBusy = true;
      this.jshintWorker.postMessage([editor.getValue(), conf ]);
    });
    
    var info = editor.getScrollInfo();
    var after = editor.charCoords({line: currentLineNumber, ch: 0}, "local").top;
    if (info.top + info.clientHeight < after)
      editor.scrollTo(null, after - info.clientHeight + 3);    
  }


  srcUpdate_GetInfoForCurrentFunction()
  {
    let ternServer=this.ternServer;
    let editor = this.codeMirror
    ternServer.updateArgHints(this.codeMirror);
    let currentCursorPos = editor.getCursor()

    let currentToken = editor.getTokenAt(currentCursorPos, true)

    // I stole the following approach from 
    // node_modules/codemirror/addon/tern/tern.js -> updateArgHints so I could get ArgPos
    // which is otherwise not stored/exposed
    var argPos = -1
    if (!editor.somethingSelected()) {
      var state = currentToken.state;
      var inner = CodeMirror.innerMode(editor.getMode(), state);
      if (inner.mode.name === "javascript") {
        var lex = inner.state.lexical;
        if (lex.info === "call") 
          argPos = lex.pos || 0
      }
    }

    var functionTypeInfo = null;
    
    const setState = (functionTypeInfo) => {
      if (functionTypeInfo) {
        JsonDocsFinder.getApiDocsAsync({
          frameworkName: functionTypeInfo.origin, 
          //frameworkVersion: "x.x.x",
          symbolType: "method",
          symbol: functionTypeInfo.name || functionTypeInfo.exprName   // Tern can't always provide a 'name', for example when guessing
        },
        (originalRequest, result) => {
          // This callback will always be called, but could be sync or async
          this.setState( {  "helpDocJsonMethodInfo": result.data,
                            "functionHelp": functionTypeInfo ? ternServer.cachedArgHints : {}, 
                            "functionArgPos": argPos,
                            "functionTypeInfo": functionTypeInfo || {},
                            currentToken: currentToken
          })   // MIGHT BE SYNC OR ASYNC. THIS MATTERS. Maybe find a better way to handle this down in a component?
        })
      }
      else {
        this.setState( {  "functionHelp": functionTypeInfo ? ternServer.cachedArgHints : {}, 
            "functionArgPos": argPos,
            "helpDocJsonMethodInfo": null,
            "functionTypeInfo": functionTypeInfo || {},
            currentToken: currentToken
        })
      }
    }
    
    
    if (argPos !== -1 && ternServer.cachedArgHints && ternServer.cachedArgHints.start)
    {
      ternServer.request(editor, "type", function(error, data) {
        if (error) {
          functionTypeInfo = { "error": error }
        }
        else{
          functionTypeInfo = data
        }
        setState(functionTypeInfo);
      }, currentCursorPos)     // TODO - We need CodeMirror 5.13.5 so this will work
    }
    else {
      setState();
    }

  }
  
  
  srcUpdate_GetRelevantTypeInfo()
  {
    let ternServer=this.ternServer
    let editor = this.codeMirror      
    let position = editor.getCursor()
    var self = this
    let query = {
      type: "type",
      depth: 0
    }

    ternServer.request(editor, query, function(error, data) {
      if (error)
        self.setState( { atCursorTypeRequestResponse: { "error": error } } ) 
      else
        self.setState( { atCursorTypeRequestResponse: { data } } )
    }, position)
  
  }


  srcUpdate_GetRefs()
  {     
    let ternServer=this.ternServer
    let editor = this.codeMirror      
    let position = editor.getCursor()
    var self = this

    ternServer.request(editor, "refs", function(error, data) {
      if (error)
        self.setState( { atCursorRefRequestResponse: { "error": error } } ) 
      else
        self.setState( { atCursorRefRequestResponse: { data } } )
    }, position)
  }

  srcUpdate_GetDef()
  {
    let ternServer=this.ternServer
    let editor = this.codeMirror      
    let position = editor.getCursor()
    var self = this

    ternServer.request(editor, "definition", function(error, data) {
      if (error)
        self.setState( { atCursorDefRequestResponse: { "error": error } } ) 
      else
      {
        data.definitionText = (data.origin === "[doc]" && data.start) ? editor.getLine(data.start.line).trim() : null
        self.setState( { atCursorDefRequestResponse: { data } } )
      }
    }, position)
  }
  
  
  srcUpdate_getMgbOpts()
  {
    // We must check the entire source code file because it is used in the indicator in the Run Code accordion
    let src = this.props.asset.content2.src
    let gameEngineJsToLoad = this.detectGameEngine(src)
    this.setState( { mgbopt_game_engine: gameEngineJsToLoad})
    
    // We also check just the current line so we can make it clear that the current line is setting an MGBopt
    let thisLine = this.codeMirror.getLine(this.codeMirror.getCursor().line);
    this.setState( { currentLineDeterminesGameEngine: this.detectGameEngine(thisLine, true)})    
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


  srcUpdate_getMemberParent()
  {
    if (showDebugAST) {
      let ternServer = this.ternServer
      let editor = this.codeMirror
      let position = editor.getCursor()
      var self = this

      var query = { type: "mgbGetMemberParent" }

      ternServer.request(editor, query, function (error, data) {
        if (error)
          self.setState({atCursorMemberParentRequestResponse: {"error": error}})
        else {
          self.setState({atCursorMemberParentRequestResponse: {data}})
        }
      }, position)
    }
  }

   
  cm_updateActivityMarkers() {
    var ed = this.codeMirror
    ed.clearGutter("mgb-cm-user-markers");
        
    let acts = this.props.activitySnapshots
    _.each(acts, act => { 
      var currUserId = this.props.currUser ? this.props.currUser._id : "BY_SESSION:" + Meteor.default_connection._lastSessionId
      if (currUserId !== act.byUserId)
      {
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
  // This gets _.debounced in componentDidMount()
  codeMirrorUpdateHints(fSourceMayHaveChanged = false) {    
    
    // Update the activity snapshot if the code line has changed
    // TODO: Batch this so it only fires when line# is changed
    let editor = this.codeMirror      
    let position = editor.getCursor()
    let passiveAction = {
      position: position
    }
    snapshotActivity(this.props.asset, passiveAction)
    

    this.setState( {_preventRenders: true})
    
    try
    {  
      // TODO: Batch the async setState() calls also. 
      this.srcUpdate_CleanSheetCase()
      this.srcUpdate_LookForMgbAssets()
      this.srcUpdate_ShowJSHintWidgetsForCurrentLine(fSourceMayHaveChanged)
      this.srcUpdate_GetInfoForCurrentFunction()
      this.srcUpdate_GetRelevantTypeInfo()
      this.srcUpdate_GetRefs()
      this.srcUpdate_GetDef()
      this.srcUpdate_getMgbOpts()
      
      this.srcUpdate_getMemberParent()

      // TODO:  See atInterestingExpression() and findContext() which are 
      // called by TernServer.jumpToDef().. LOOK AT THESE.. USEFUL?
    }
    finally 
    {
      this.setState( {_preventRenders: false})
    }
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    if (nextState._preventRenders === true)
      return false
    return true
  }
  
  codemirrorValueChanged (doc, change) {
    // Ignore SetValue so we don't bounce changes from server back up to server
    if (change.origin !== "setValue")
    {
      const newValue = doc.getValue();
      this._currentCodemirrorValue = newValue;
      let newC2 = { src: newValue }
      this.handleContentChange( newC2, null, "Edit code" )
      this.codeMirrorUpdateHints(true)
    }
  }


  componentDidUpdate() {
    this.getElementReferences()
    this.cm_updateActivityMarkers()
  }
  
  
  getElementReferences()
  {
    this.iFrameWindow = document.getElementById("iFrame1")
  }


  detectGameEngine(src, returnRawVersionNNNwithoutDefault = false) {
    let phaserVerNNN = this.state.defaultPhaserVersionNNN
    let versionArray = src && src.match(/^\/\/\MGBOPT_phaser_version\s*=\s*([\.\d]+)/)
    if (versionArray && versionArray.length > 1)
    {
      phaserVerNNN = versionArray[1]
      if (returnRawVersionNNNwithoutDefault)
        return phaserVerNNN;
    }
    else
    {
      if (returnRawVersionNNNwithoutDefault)
        return null
    }
    
    // NOTE, if we deliver phaser.min.js from another domain, then it will 
    // limit the error handler's knowledge of that code - see 'Notes' on
    // https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror    
    //   BAD:  return "//cdn.jsdelivr.net/phaser/" + phaserVerNNN + "/phaser.min.js"
    return "/phaser/" + phaserVerNNN + "/phaser.min.js"
  }


  _consoleClearAllMessages()
  {
    this.setState( { consoleMessages: [] } )
  }


  _consoleAdd(data)
  {
    // Using immutability helpers as described on https://facebook.github.io/react/docs/update.html
    let newMessages = update(this.state.consoleMessages, {$push: [data]} ).slice(-10)
    this.setState(  { consoleMessages: newMessages } )
    // todo -  all the fancy stuff in https://github.com/WebKit/webkit/blob/master/Source/WebInspectorUI/UserInterface/Views/ConsoleMessageView.js
  }
  

  _handle_iFrameMessageReceiver(event)
  {
    // Message receivers like this can receive a lot of crap from malicious windows
    // debug tools etc, so we have to be careful to filter out what we actually care 
    // about
    var source = event.source
    var data = event.data
    if (source === this.iFrameWindow.contentWindow && data.hasOwnProperty("mgbCmd"))
    {
      switch(data.mgbCmd){
        case "mgbConsoleMsg": {
          this._consoleAdd(data)
        } break

        case "mgbScreenshotCanvasResponse": {
          // In a Phaser game, this is needed to enable screenshots if using WebGL renderer
          //   game.preserveDrawingBuffer = true;
          // OR use Phaser.CANVAS as the renderer

          let asset = this.props.asset
          asset.thumbnail = data.pngDataUrl
          this.handleContentChange(null, asset.thumbnail, "update thumbnail")
        } break

        case "mgbStoreCache": {
          this.cache[data.filename] = data.src
        } break

        case "mgbGetFromCache": {
          this.postToIFrame("mgbFromCache", {src: this.cache[data.filename], cbId: data.cbId})
        } break

        case "mgbAllInOneSource" : {
          if (this.props.canEdit)
          {
            const value = this.codeMirror.getValue()
            let newC2 = { src: value, bundle: data.src }
            this.lastBundle = data.src
            this.handleContentChange( newC2, null, `Store code bundle`)
          }
        } break
      }

    }
  }
  
  
  handleScreenshotIFrame()
  {
    if (this.state.isPlaying)
      this._postMessageToIFrame( { 
        mgbCommand: 'screenshotCanvas',
        recommendedHeight: 150            // See AssetCard for this size        
      })            
  }

  postToIFrame(cmd, data)
  {
    if (this.state.isPlaying) {
      data.mgbCommand = cmd
      this._postMessageToIFrame(data)
    }
  }
  _postMessageToIFrame(messageObject)
  {
    this.iFrameWindow.contentWindow.postMessage(messageObject, "*")
  }
  
  
  /** Start the code running! */
  handleRun()
  {    
    this._consoleClearAllMessages()
    if (!this.bound_handle_iFrameMessageReceiver)
      this.bound_handle_iFrameMessageReceiver = this._handle_iFrameMessageReceiver.bind(this)
    window.addEventListener('message', this.bound_handle_iFrameMessageReceiver)
    
    const { asset } = this.props
    const src = asset.content2.src
    const gameEngineJsToLoad = this.detectGameEngine(src)
    this.setState( {isPlaying: true } )
    this._postMessageToIFrame(
      {
        mgbCommand: 'startRun',
        codeToRun: src,
        asset_id: asset._id,
        filename: asset.name || "",
        gameEngineScriptToPreload: gameEngineJsToLoad
      })    
    
    // Make sure that it's really visible.. and also auto-close accordion above so there's space.
    $('.ui.accordion').accordion('close', 0);
    $('.ui.accordion').accordion('open', 1);
  }
  

  handleStop()
  {
    this.setState( { gameRenderIterationKey: this.state.gameRenderIterationKey+1, // or this.iFrameWindow.contentWindow.location.reload(); ? 
                     isPlaying: false
                   } )
    window.removeEventListener('message', this.bound_handle_iFrameMessageReceiver)
  }
  
  
  pasteSampleCode(item) {   // item is one of the templateCodeChoices[] elements
    let newValue = item.code
    this.codeMirror.setValue(newValue)
    this._currentCodemirrorValue = newValue;
    let newC2 = { src: newValue }
    this.handleContentChange( newC2, null, `Template code: ${item.label}`)
  }

  // Note that either c2 or thumnail could be null/undefined.
  handleContentChange(c2, thumbnail, reason) {
    if (c2 && !c2.bundle && this.lastBundle)
      c2.bundle = this.lastBundle
    this.props.handleContentChange(c2, thumbnail, reason)
  }


  gotoLineHandler(line)
  {
    let pos = {line: line-1, ch:0}
    this.codeMirror.scrollIntoView(pos, 100)  //100 pixels margin
    this.codeMirror.setCursor(pos)
  }

  /** This is useful when working with Tern stuff.. 
   * It is Enabled by setting showDebugAST at top of this file 
   */
  renderDebugAST()
  {
    if (showDebugAST && this.state.atCursorMemberParentRequestResponse)
      return <DebugASTview atCursorMemberParentRequestResponse={this.state.atCursorMemberParentRequestResponse} />
  }


  render() {
    if (!this.props.asset) 
      return null
      
    const templateCodeChoices = templateCode.map(item => {
      return  <a className="item" key={item.label} onClick={this.pasteSampleCode.bind(this,item)}>
                <div className="ui green horizontal label">{item.label}</div>
                {item.description}
              </a>
    }) 
    
    const previewIdThings = this.state.previewAssetIdsArray.map( assetInfo => {
      return <a className="ui fluid label" key={assetInfo.id} style={{marginBottom: "2px"}}>
                <img className="ui right spaced medium image" src={`/api/asset/thumbnail/png/${assetInfo.id}`}></img>
                URL references MGB <strong>{assetInfo.kind}</strong> asset ID#{assetInfo.id}
              </a>
    })
    
    let asset = this.props.asset
    let docEmpty = this.state.documentIsEmpty
    let isPlaying = this.state.isPlaying

    // const RunCodeIFrameStyle = {
    //   transform: "scale(0.5)",  
    //   transformOrigin: "0 0",
    //   overflow: "hidden"
    // }
    
    return ( 
        <div className="ui grid">
          <div className="ten wide column">
            <textarea ref="textarea"
                      defaultValue={asset.content2.src} 
                      autoComplete="off"
                      placeholder="Start typing code here..."/>
          </div>
        
        <div className="six wide column">
        
          <div className="mgbAccordionScroller">
            <div className="ui fluid styled accordion">
                            
              { !docEmpty &&
                // Current Line/Selection helper (header)
              <div className="active title">
                <span className="explicittrigger">
                  <i className="dropdown icon"></i>
                  Current line/selection code help
                  </span>                
              </div>
              }              
              { !docEmpty &&
                // Current Line/Selection helper (body)
                <div className="active content">
                  <TokenDescription
                      currentToken={this.state.currentToken} />

                  <MgbMagicCommentDescription
                    currentLineDeterminesGameEngine={this.state.currentLineDeterminesGameEngine} 
                    mgbopt_game_engine={this.state.mgbopt_game_engine}
                    expressionTypeInfo={this.state.atCursorTypeRequestResponse.data} 
                    defaultPhaserVersionNNN={this.state.defaultPhaserVersionNNN}
                    />

                  <FunctionDescription 
                    functionHelp={this.state.functionHelp} 
                    functionArgPos={this.state.functionArgPos} 
                    functionTypeInfo={this.state.functionTypeInfo}
                    helpDocJsonMethodInfo={this.state.helpDocJsonMethodInfo}/>

                  <ExpressionDescription 
                    expressionTypeInfo={this.state.atCursorTypeRequestResponse.data} />
                
                  <RefsAndDefDescription 
                    refsInfo={this.state.atCursorRefRequestResponse.data} 
                    defInfo={this.state.atCursorDefRequestResponse.data} 
                    expressionTypeInfo={this.state.atCursorTypeRequestResponse.data} />

                  { this.renderDebugAST() }

                  { previewIdThings && previewIdThings.length > 0 &&
                    <div className="ui divided selection list">
                      {previewIdThings}
                    </div>
                  }
                </div>
              }
              
              { docEmpty && 
                // Clean sheet helper!          
                <div className="active title">
                  <span className="explicittrigger">
                    <i className="dropdown icon"></i>
                    Clean Sheet helper
                    </span>                
                </div>
              }
              { docEmpty && 
                <div className="active content">
                  If you like, you can click one of the following buttons to paste some useful template code into your empty file
                  <div className="ui divided selection list">
                    {templateCodeChoices}
                  </div>
                  ...or, if you think you know what you are doing, just start hacking away!
                </div>
              }
                
              { !docEmpty &&
                // Code run/stop (header)                  
                <div className="title">
                  <span className="explicittrigger">
                    <i className="dropdown icon"></i>
                    Run Code&nbsp;&nbsp;
                    </span>
                      { !isPlaying && 
                        <a className={"ui mini labeled icon button"} onClick={this.handleRun.bind(this)}>
                            <i className={"play icon"}></i>Run
                        </a>
                      }
                      { isPlaying && 
                        <a className={"ui mini labeled icon button"} onClick={this.handleStop.bind(this)}>
                            <i className={"stop icon"}></i>Stop
                        </a>
                      }
                      { !!asset.content2.bundle && 
                        <a className={"ui mini labeled icon button"} href={`/api/asset/code/bundle/${asset._id}`} target="_blank">
                            <i className={"external icon"}></i>Full
                        </a>
                      }
                      { isPlaying && 
                        <a className={"ui right floated mini icon button"} onClick={this.handleScreenshotIFrame.bind(this)} title="This will make a screenshot of the CANVAS element in the page">
                            <i className={"write square icon"}></i>Set thumbnail
                        </a>
                      }
                      
                </div>
              }
              { !docEmpty &&
                // Code run/stop (body)                  
                <div className="content">
                  <iframe 
                    key={ this.state.gameRenderIterationKey } 
                    id="iFrame1" 
                    width="100%" height="400" 
                    sandbox='allow-modals allow-same-origin allow-scripts allow-popups' 
                    src="/codeEditSandbox.html">
                  </iframe>
                  { this.state.mgbopt_game_engine &&  
                      <a className="ui item"><small>Using engine {this.state.mgbopt_game_engine}</small></a>
                  }
                  <ConsoleMessageViewer
                    messages={this.state.consoleMessages}
                    gotoLinehandler={this.gotoLineHandler.bind(this)} />
                </div>
              }
              
              
              { /* Keyboard/Mouse shortcuts */}
              <div className="title">
                <span className="explicittrigger">
                  <i className="dropdown icon"></i>
                  Code Editor Keyboard/Mouse shortcuts
                  </span>
              </div>
              <div className="content">
                <KeyBindingAssist commandContext="editor.text." />
                <p>Mouse: <code>alt-shift</code> + Mouse Wheel in the code edit window will change the editor font size</p>
                <p>Mouse: <code>alt</code> + Mouse Wheel in the code edit window will fade comments in/out for readability</p>
              </div>           
            </div>
          </div>

        </div>
      </div>
    );
  }
}
