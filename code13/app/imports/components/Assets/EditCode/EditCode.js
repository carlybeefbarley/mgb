import React, { PropTypes } from 'react';
import SplitPane from 'react-split-pane';

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

//import cm_closebrackets from 'codemirror/addon/edit/closetag';
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

import Defs_phaser from "./tern/DefsPhaser";
import Defs_ecma5 from "./tern/DefsEcma5";

import cm_tern_lib_comment from "tern/lib/comment";

// ?  <script src="/tern/lib/infer.js"></script>  
// ?  <script src="/tern/plugin/doc_comment.js"></script>
  
// Official CodeMirror Tern addon (so Tern smartness can show in CodeMirror)
import cm_addon_tern from "codemirror/addon/tern/tern";

// (END OF CODEMIRROR/TERN imports)


import { iframeScripts } from './sandbox/SandboxScripts.js';
import { templateCode } from './templates/TemplateCode.js'

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
      isPlaying: false
    }
    this.hintWidgets = [];
  }


  componentDidMount() {
    this.getElementReferences()
    
    // Debounce the codeMirrorUpdateHints() function
    this.codeMirrorUpdateHints = _.debounce(this.codeMirrorUpdateHints, 100, true)
    
    // Semantic-UI item setup (Accordion etc)
    $('.ui.accordion').accordion({ selector: { trigger: '.title .explicittrigger'} })

    // Tern setup
    var myTernConfig = {
      defs: [Defs_phaser, Defs_ecma5],
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
      viewportMargin: Infinity,
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
        "Ctrl-B": function(cm) { CodeMirror.tern.jumpToDef(cm); },
        "Alt-,": function(cm) { CodeMirror.tern.jumpBack(cm); },
        "Ctrl-Q": function(cm) { CodeMirror.tern.rename(cm); },
        "Ctrl-O": function(cm) { cm.foldCode(cm.getCursor()); }
      },
      lint: true,
      autofocus: true,
      highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true},
    }
		this.codeMirror = CodeMirror.fromTextArea(textareaNode, cmOpts)
    
    this.codeMirror.on('change', this.codemirrorValueChanged.bind(this))
		this._currentCodemirrorValue = this.props.asset.content2.src || '';
    
    this.codeMirror.on("cursorActivity", this.codeMirrorUpdateHints.bind(this, false))
    this.codeMirrorUpdateHints(true)
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
  
  // This gets _.debounced in componentDidMount()
  codeMirrorUpdateHints(fSourceMayHaveChanged) {
    
    CodeMirror.tern.updateArgHints(this.codeMirror);
    // adapted from https://codemirror.net/demo/widget.html
    // TODO: Can we look at the JSHINT results that Codemirror has instead of re-running it?
    var editor = this.codeMirror
    var widgets = this.hintWidgets
    this.codeMirror.operation(function() {

      let cpos = editor.getCursor()
      for (var i = 0; i < widgets.length; ++i)
        editor.removeLineWidget(widgets[i]);
        
      widgets.length = 0;

      if (fSourceMayHaveChanged === true)
        JSHINT(editor.getValue());
        
      for (var i = 0; i < JSHINT.errors.length; ++i) {
        var err = JSHINT.errors[i];
        if (!err || err.line !== cpos.line+1)   // We only show widget for our current line
          continue;
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
  var after = editor.charCoords({line: editor.getCursor().line + 1, ch: 0}, "local").top;
  if (info.top + info.clientHeight < after)
    editor.scrollTo(null, after - info.clientHeight + 3);
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

  handleRun()
  {
    this.setState( {isPlaying: true } )
    this.iFrameWindow.contentWindow.postMessage(this.props.asset.content2.src, "*")    
  }

  handleStop(e)
  {
    this.setState( { gameRenderIterationKey: this.state.gameRenderIterationKey+1,
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
                <div className="ui horizontal label">{item.label}</div>
                {item.description}
              </a>
    })

    let asset = this.props.asset
    let styleH100 = {"height": "100%"}
       
    return ( 
        <div style={styleH100}>
          <SplitPane split="vertical" minSize="50">            
            <div className="CodeMirror" style={styleH100}> 
              <textarea ref="textarea"
                        defaultValue={asset.content2.src} 
                        autoComplete="off"/>
            </div>            
            
            <div className="ui styled accordion">
              
              { /* Clean sheet helper! */}                   
              <div className="title">
                <span className="explicittrigger">
                  <i className="dropdown icon"></i>
                  Clean Sheet helper
                  </span>                
              </div>
              <div className="content">
                <div className="ui divided selection list">
                  {templateCodeChoices}
                </div>
              </div>
              
              { /* Code run/stop */}                   
              <div className="active title">
                <span className="explicittrigger">
                  <i className="dropdown icon"></i>
                  Run Code&nbsp;
                  </span>
                <div className="ui mini icon buttons">
                    { !this.state.isPlaying ? 
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
              <div className="active content">
                <iframe 
                  key={ this.state.gameRenderIterationKey } 
                  id="iFrame1" 
                  width="580" height="460" 
                  sandbox='allow-modals allow-scripts' 
                  srcDoc={iframeScripts.phaser244}>
                </iframe>
              </div>
              
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