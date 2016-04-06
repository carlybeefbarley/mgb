import React, { PropTypes } from 'react';
import SplitPane from 'react-split-pane';

import Inspector from 'react-inspector';

// Import CodeMirror and its various dependencies.
//   This is not as simple as it might sound...

// 1) Due to Meteor 1.3 import limitations, there are also symlinks in the 
//    /package-assets-symlink-hack/ directory for the CSS etc files that 
//    CodeMirror needs.
// 2) We load JSHINT from /app.htm in browser because JSHINT redefines some fundamental
//    globals like 'utils' and 'event', and that confuses node/meteor greatly.
//
// Things get even more complicated once TERN (the code analysis system use for autocomplete smarts)
import CodeMirror from 'codemirror';

// CodeMirror Modes we will support
import cm_modejs from 'codemirror/mode/javascript/javascript';

// CodeMirror addons for cool IDE-like functions
import cm_showhint from 'codemirror/addon/hint/show-hint';
//import cm_closetag from 'codemirror/addon/edit/closetag';
import cm_closebrackets from 'codemirror/addon/edit/closebrackets';
import cm_matchbrackets from 'codemirror/addon/edit/matchbrackets';
import cm_activeline from 'codemirror/addon/selection/active-line';

import cm_fold_code from 'codemirror/addon/fold/foldcode';
import cm_fold_gutter from 'codemirror/addon/fold/foldgutter';
import cm_fold_brace from 'codemirror/addon/fold/brace-fold';
import cm_fold_comment from 'codemirror/addon/fold/comment-fold';
// import cm_fold_ from 'codemirror/addon/fold/xml-fold';
// import cm_fold_ from 'codemirror/addon/fold/markdown-fold';

import cm_dialog from 'codemirror/addon/dialog/dialog';

import cm_annotatescrollbar from 'codemirror/addon/scroll/annotatescrollbar';
import cm_matchesonscrollbar from 'codemirror/addon/search/matchesonscrollbar';

import cm_display_placeholder from 'codemirror/addon/display/placeholder';


import cm_jumptoline from 'codemirror/addon/search/jump-to-line';

import cm_lint from 'codemirror/addon/lint/lint';
import cm_jslint from 'codemirror/addon/lint/javascript-lint';
import cm_jsonlint from 'codemirror/addon/lint/json-lint';

import cm_searchcursor from 'codemirror/addon/search/searchcursor';
import cm_search from 'codemirror/addon/search/search';

// **GLOBAL*** Tern JS - See comment below...  
import scoped_tern from "tern";
tern = scoped_tern;   // 'tern' symbol needs to be GLOBAL due to some legacy non-module stuff in tern-phaser

// Tern 'definition files'
import cm_tern_lib_def from "tern/lib/def";     // Do I need? since I'm doing it differently in next 2 lines...

// import Defs_phaser from "./tern/DefsPhaser";
// import Defs_ecma5 from "./tern/DefsEcma5";
// import Defs_browser from 'tern/defs/browser.json';

//import Defs_phaser from "./tern/Defs/phaser.json";
import Defs_ecma5 from "./tern/Defs/ecma5.json";
import Defs_browser from './tern/Defs/browser.json';
import Defs_phaser from "./tern/Defs/DefsPhaser";


import cm_tern_lib_comment from "tern/lib/comment";

// ?  <script src="/tern/lib/infer.js"></script>  
// ?  <script src="/tern/plugin/doc_comment.js"></script>
  
// Official CodeMirror Tern addon (so Tern smartness can show in CodeMirror)
import cm_addon_tern from "codemirror/addon/tern/tern";

// (END OF CODEMIRROR/TERN imports)


import { iframeScripts } from './sandbox/SandboxScripts.js';
import { templateCode } from './templates/TemplateCode.js';
import FunctionDescription from './tern/FunctionDescription.js';
import ExpressionDescription from './tern/ExpressionDescription.js';
import RefsAndDefDescription from './tern/RefsAndDefDescription.js';

// Code asset - Data format:
//
// content2.src                     // String with source code

export default class EditCode extends React.Component {
  // static PropTypes = {
  //   asset: PropTypes.object
  // }

  constructor(props) {
    super(props);
    this.state = {
      gameRenderIterationKey: 0,
      isPlaying: false,
      previewAssetIdsArray: [],        // Array of strings with asset ids.
      
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
    this.hintWidgets = [];
  }


  componentDidMount() {
    this.getElementReferences()
    
    // Debounce the codeMirrorUpdateHints() function
    this.codeMirrorUpdateHints = _.debounce(this.codeMirrorUpdateHints, 100, true)
    
    // Semantic-UI item setup (Accordion etc)
    $('.ui.accordion').accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })

    // Tern setup
    var myTernConfig = {
      defs: [Defs_ecma5, Defs_browser, Defs_phaser],
      useWorker: false
    }
    CodeMirror.tern = new CodeMirror.TernServer(myTernConfig)     // This is actually our instance which we have foolishly just attached to the global for now :( hack)

    // CodeMirror setup
    const textareaNode = this.refs.textarea
    let cmOpts = {  
      mode: "javascript",
      theme: "eclipse",
      styleActiveLine: true,
      lineNumbers: true,
      lineWrapping: true,
      tabSize: 2,
      foldGutter: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      viewportMargin: 10,
      gutters: [
        "CodeMirror-lint-markers", 
        "CodeMirror-linenumbers", 
        "CodeMirror-foldgutter"
        ],
      extraKeys: {
        "Alt-F": "findPersistent",        
        "'.'": this.codeEditPassAndHint,
        "Ctrl-Space": function(cm) { CodeMirror.tern.complete(cm); },
        "Ctrl-I": function(cm) { CodeMirror.tern.showType(cm); },
        "Ctrl-D": function(cm) { CodeMirror.tern.showDocs(cm); },
        "Ctrl-B": function(cm) { CodeMirror.tern.jumpToDef(cm); },
        "Alt-,": function(cm) { CodeMirror.tern.jumpBack(cm); },
        "Ctrl-Q": function(cm) { CodeMirror.tern.rename(cm); },
        "Ctrl-S": function(cm) { CodeMirror.tern.selectName(cm); },
        "Ctrl-O": function(cm) { cm.foldCode(cm.getCursor()); }
      },
      lint: true,   // TODO - use eslint instead? Something like jssc?
      autofocus: true,
      highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true},
    }
		this.codeMirror = CodeMirror.fromTextArea(textareaNode, cmOpts)
    
    this.codeMirror.on('change', this.codemirrorValueChanged.bind(this))
		this._currentCodemirrorValue = this.props.asset.content2.src || '';
    
    this.codeMirror.on("cursorActivity", this.codeMirrorUpdateHints.bind(this, false))
    this.codeMirrorUpdateHints(true)
    
    // Resize Handler - a bit complicated since we want to use to end of page
    // TODO: Fix this properly using flexbox/stretched so the content elements stretch to take remaining space.
    //       NOTE that the parent elements have the wrong heights because of a bunch of cascading h=100% styles. D'oh.
    var ed = this.codeMirror;
    this.edResizeHandler = e => {       
      let $sPane = $(".SplitPane.vertical")
      let h = window.innerHeight - ( 8 + $sPane.offset().top )
      let hpx = h.toString() + "px"
      $sPane.height(hpx);
    }
    $(window).on("resize",  this.edResizeHandler)
    this.edResizeHandler();
  }

  componentWillUnmount()
  {
    $(window).off("resize", this.edResizeHandler)
  }

  codeEditPassAndHint(cm) {
    setTimeout(function() {CodeMirror.tern.complete(cm);}, 1000);      // Pop up a helper after a second
    return CodeMirror.Pass;       // Allow the typed character to be part of the document
  }

  
  componentWillReceiveProps (nextProps) {
    let currentCursor = this.codeMirror.getCursor()
    let newVal = nextProps.asset.content2.src
    
		if (this.codeMirror && newVal !== undefined && this._currentCodemirrorValue !== newVal) {
			this.codeMirror.setValue(newVal);
      this.codeMirror.setCursor(currentCursor);
		}
  }
  
  
  _getPNGsInLine(lineText)
  {
    let re=/api\/asset\/png\/([A-Za-z0-9]+)/g
    let matches=[]
    while ( ( match = re.exec( lineText ) ) && matches.push( match[1] ) ) {};
    return _.uniq(matches)
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
    let thisLine = this.codeMirror.getSelection(';');
    if (!thisLine || thisLine.length === 0)
      thisLine = this.codeMirror.getLine(this.codeMirror.getCursor().line);
    let PNGids = this._getPNGsInLine(thisLine);
    this.setState( { previewAssetIdsArray: PNGids } );    
  }
  
  /** Runs JSHINT on the user's code and show any relevant issues as widgets 
    * directly below that code in CodeMirror. This was adapted from the demo code
    * at https://codemirror.net/demo/widget.html
   */
  srcUpdate_ShowJSHintWidgetsForCurrentLine(fSourceMayHaveChanged = false)
  {
    var editor = this.codeMirror
    var widgets = this.hintWidgets
    var currentLineNumber = editor.getCursor().line + 1     // +1 since user code is 1...

    // operation() is a way to prevent CodeMirror updates until the function completes
    // However, it is still synchronous - this isn't an async callback
    this.codeMirror.operation(function() {

      for (var i = 0; i < widgets.length; ++i)
        editor.removeLineWidget(widgets[i]);
        
      widgets.length = 0;
      
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
      }
    });
    
    var info = editor.getScrollInfo();
    var after = editor.charCoords({line: currentLineNumber, ch: 0}, "local").top;
    if (info.top + info.clientHeight < after)
      editor.scrollTo(null, after - info.clientHeight + 3);    
  }

  srcUpdate_GetInfoForCurrentFunction()
  {
    let ternServer=CodeMirror.tern;
    let editor = this.codeMirror
    ternServer.updateArgHints(this.codeMirror);   
    
    // I stole the following approach from 
    // node_modules/codemirror/addon/tern/tern.js -> updateArgHints so I could get ArgPos
    // which is otherwise not stored/exposed
    let argPos = -1
    if (!editor.somethingSelected()) {
      var state = editor.getTokenAt(editor.getCursor()).state;
      var inner = CodeMirror.innerMode(editor.getMode(), state);
      if (inner.mode.name === "javascript") {
        var lex = inner.state.lexical;
        if (lex.info === "call") 
          argPos = lex.pos || 0
      }
    }

    let functionTypeInfo = null;
    if (argPos !== -1 && ternServer.cachedArgHints && ternServer.cachedArgHints.start)
    {
      ternServer.request(editor, "type", function(error, data) {
      if (error)
        functionTypeInfo = { "error": error } 
      else
        functionTypeInfo = data
    }, ternServer.cachedArgHints.start)
    }
    
    this.setState( {  "functionHelp": functionTypeInfo ? ternServer.cachedArgHints : {}, 
                      "functionArgPos": argPos,
                      "functionTypeInfo": functionTypeInfo || {}
                  })      
  }
  
  srcUpdate_GetRelevantTypeInfo()
  {
    let ternServer=CodeMirror.tern
    let editor = this.codeMirror      
    let position = editor.getCursor()
    var self = this

    ternServer.request(editor, "type", function(error, data) {
      if (error)
        self.setState( { atCursorTypeRequestResponse: { "error": error } } ) 
      else
        self.setState( { atCursorTypeRequestResponse: { data } } )
    }, position)
  
  }
 
 
   srcUpdate_GetRefs()
   {     
    let ternServer=CodeMirror.tern
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
    let ternServer=CodeMirror.tern
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
    thisLine = this.codeMirror.getLine(this.codeMirror.getCursor().line);
    this.setState( { currentLineDeterminesGameEngine: this.detectGameEngine(thisLine, true)})    
  }

   
   
  // This gets _.debounced in componentDidMount()
  codeMirrorUpdateHints(fSourceMayHaveChanged = false) {    
    this.srcUpdate_CleanSheetCase()
    this.srcUpdate_LookForMgbAssets()
    this.srcUpdate_ShowJSHintWidgetsForCurrentLine(fSourceMayHaveChanged)
    this.srcUpdate_GetInfoForCurrentFunction()
    this.srcUpdate_GetRelevantTypeInfo()
    this.srcUpdate_GetRefs()
    this.srcUpdate_GetDef()
    this.srcUpdate_getMgbOpts()

      // TODO:  See atInterestingExpression() and findContext() which are 
      // called by TernServer.jumpToDef().. LOOK AT THESE.. USEFUL?

  }
  
	codemirrorValueChanged (doc, change) {
    // Ignore SetValue so we don't bounce changes from server back up to server
    if (change.origin !== "setValue")
    {
      const newValue = doc.getValue();
      this._currentCodemirrorValue = newValue;
      let newC2 = { src: newValue }
      this.props.handleContentChange( newC2, "", "Edit code" )
      this.codeMirrorUpdateHints(true)
    }
  }

  componentDidUpdate() {
    this.getElementReferences()
  }
  
  getElementReferences()
  {
    this.iFrameWindow = document.getElementById("iFrame1")    
  }


detectGameEngine(src, returnRawVersionNNNwithoutDefault = false) {
  let phaserVerNNN = this.state.defaultPhaserVersionNNN
  let versionArray = src.match(/^\/\/\MGBOPT_phaser_version\s*=\s*([\.\d]+)/)
  if (versionArray && versionArray.length > 1)
  {
    phaserVerNNN = versionArray[1]
    console.log(`Determined requested phaser version of ${phaserVerNNN} from ${versionArray[0]}`)  
    if (returnRawVersionNNNwithoutDefault)
      return phaserVerNNN;
  }
  else
  {
    console.log(`using default Phaser version ${phaserVerNNN} since no //MGBOPT_phaser_version=n.n.n was detected `)
    if (returnRawVersionNNNwithoutDefault)
      return null
  }
  return "//cdn.jsdelivr.net/phaser/" + phaserVerNNN + "/phaser.min.js"
}

  /** Start the code running! */
  handleRun()
  {
    let src = this.props.asset.content2.src
    let gameEngineJsToLoad = this.detectGameEngine(src)
    this.setState( {isPlaying: true } )
    this.iFrameWindow.contentWindow.postMessage( {codeToRun: src, gameEngineScriptToPreload: gameEngineJsToLoad}, "*")    
    
    // Make sure that it's really visible.. and also auto-close accordion above so there's space.
    $('.ui.accordion').accordion('close', 0);
    $('.ui.accordion').accordion('open', 1);
  }

  handleStop(e)
  {
    this.setState( { gameRenderIterationKey: this.state.gameRenderIterationKey+1, // or this.iFrameWindow.contentWindow.location.reload(); ? 
                     isPlaying: false
                   } )
  }
  
  
  pasteSampleCode(item) {   // item is one of the templateCodeChoices[] elements
    let newValue = item.code
    this.codeMirror.setValue(newValue)
    this._currentCodemirrorValue = newValue;
    let newC2 = { src: newValue }
    this.props.handleContentChange( newC2, "", `Template code: ${item.label}`)
  }

  render() {
    if (!this.props.asset) 
      return null;
      
    const templateCodeChoices = templateCode.map(item => {
      return  <a className="item" key={item.label} onClick={this.pasteSampleCode.bind(this,item)}>
                <div className="ui green horizontal label">{item.label}</div>
                {item.description}
              </a>
    })
    
    const previewIdThings = this.state.previewAssetIdsArray.map( id => {
      return <a className="ui label" key={id}>
                <img className="ui right spaced avatar image" src={`/api/asset/png/${id}`}></img>
                URL references asset ID#{id}
              </a>
    })
    
    let asset = this.props.asset
    let styleH100 = {"height": "100%"}
    let docEmpty = this.state.documentIsEmpty
    let isPlaying = this.state.isPlaying
    
    return ( 
        <div style={styleH100}>
          <SplitPane split="vertical" minSize={50}>            
            <div className="CodeMirror" style={styleH100}> 
              <textarea ref="textarea"
                        defaultValue={asset.content2.src} 
                        autoComplete="off"
                        placeholder="Start typing code here..."/>
            </div>            
            
            <div className="ui styled accordion">
                            
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

                  { this.state.currentLineDeterminesGameEngine && 
                    <div className="ui segment">
                      <p>
                        The comment
                        <code style={{color: "green"}}><small>
                          <br></br>
                          &nbsp;&nbsp;//MGBOPT_phaser_version={this.state.currentLineDeterminesGameEngine}
                          <br></br>
                        </small></code> 
                        is a special comment that MGB looks for. 
                        These comments are used just by MGB to force the usage of a specific version of the <a href="//phaser.io">Phaser</a> game engine when running your code.
                      </p>
                      <p>
                        In this file, the 
                        &nbsp;<code><small>//MGBOPT_phaser_version=...</small></code>&nbsp;
                        special comment(s) are causing the following version of phaser to be pre-loaded:&nbsp;
                        <code><small><a href={this.state.mgbopt_game_engine}>{this.state.mgbopt_game_engine}</a></small></code>
                      </p>
                      
                      <p>
                        This override is useful when working with a tutorial from an older version of Phaser, in order to avoid incompatibilities. 
                        If no version is specifically selected, the default version is {this.state.defaultPhaserVersionNNN}. 
                        The full list of <a href="//phaser.io">Phaser</a> versions is at <a href="http://phaser.io/download/archive">http://phaser.io/download/archive</a>.                  
                      </p>
                      <p>
                        NOTE: If there are multiple lines with this selection, ONLY the first one will be used.
                      </p>
                    </div>
                  }
                  <ExpressionDescription 
                    expressionTypeInfo={this.state.atCursorTypeRequestResponse.data} />
                
                  <RefsAndDefDescription 
                    refsInfo={this.state.atCursorRefRequestResponse.data} 
                    defInfo={this.state.atCursorDefRequestResponse.data} 
                    expressionTypeInfo={this.state.atCursorTypeRequestResponse.data} />
                    
                  <FunctionDescription 
                    functionHelp={this.state.functionHelp} 
                    functionArgPos={this.state.functionArgPos} 
                    functionTypeInfo={this.state.functionTypeInfo}/>

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
                  If you like, you can click one of the following buttons to past some useful template code into your empty file
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
                    Run Code&nbsp;
                    </span>
                  <div className="ui mini icon buttons">
                      { !isPlaying ? 
                      <a className={"ui mini icon button"} onClick={this.handleRun.bind(this)}>
                          <i className={"play icon"}></i>
                      </a>
                      :
                      <a className={"ui mini icon button"} onClick={this.handleStop.bind(this)}>
                          <i className={"stop icon"}></i>
                      </a>
                      }
                  </div>
                </div>
              }
              { !docEmpty &&
                // Code run/stop (body)                  
                <div className="content">
                  <iframe 
                    key={ this.state.gameRenderIterationKey } 
                    id="iFrame1" 
                    width="580" height="460" 
                    sandbox='allow-modals allow-scripts' 
                    srcDoc={iframeScripts.phaser244}>
                  </iframe>
                  { this.state.mgbopt_game_engine &&  
                      <a className="ui item"><small>Using engine {this.state.mgbopt_game_engine}</small></a>
                  }
                </div>
              }
              
              { /* Keyboard shortcuts */}
              <div className="title">
                <span className="explicittrigger">
                  <i className="dropdown icon"></i>
                  Code Editor Keyboard shortcuts
                  </span>
              </div>
              <div className="content">
                <div className="ui divided selection list">
                {/* TODO: use full list from view-source:https://codemirror.net/demo/search.html */}
                  <a className="item">
                    <div className="ui horizontal label">Cmd-Z / Ctrl-Z</div>
                    UNDO
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Cmd-Shift-Z / Ctrl-Y</div>
                    REDO
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">.</div>
                    Triggers AutoComplete whilst typing (after 1 second delay)
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Ctrl-Space</div>
                    Instant AutoComplete at cursor
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Ctrl-I</div>
                    Show 'type' of thing at cursor
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Ctrl-D</div>
                    Show 'Docs' of thing at cursor
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Ctrl-B</div>
                    Jump to definition of thing at cursor
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Alt-,</div>
                    Jump back
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Ctrl-Q</div>
                    Rename (smart refactor)
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Ctrl-S</div>
                    Show other references to current variable/property in same file
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Alt-F </div>
                    Find text
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Alt-G </div>
                    Goto Line
                  </a>
                  <a className="item">
                    <div className="ui horizontal label">Ctrl-O </div>
                    Open/Close fold at current line
                  </a>
                </div>
              </div>           

            </div>
          </SplitPane>
        </div>
    );
  }
}