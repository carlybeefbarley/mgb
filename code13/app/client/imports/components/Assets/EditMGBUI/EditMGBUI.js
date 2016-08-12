import _ from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';
import { html_beautify } from 'js-beautify';

import { snapshotActivity } from '/imports/schemas/activitySnapshots.js';

import CodeMirror from '../../CodeMirror/CodeMirrorComponent.js';
import SemanticUiIconFinder from './SemanticUiIconFinder.js';
import SemanticUiDocLinks from './SemanticUiDocLinks.js';

export default class EditMGBUI extends React.Component {
  // static PropTypes = {
  //   asset: PropTypes.object.isRequired
  //   canEdit" PropTypes.bool.isRequired
  //   editDeniedReminder: PropTypes.function
  //   handleContentChange: PropTypes.function.isRequired
  //   activitySnapshots: PropTypes.array               // can be null whilst loading
  // }

  constructor(props) {
    super(props);
    this._currentCodemirrorValue = this.props.asset.content2.src || '';    

    this.state = {
      showingInJsxFormat: false
    }
  }
  


  // MGBUI asset - Data format:
  //
  // content2.src                     // String with HTML (semantic ui) in string format
  //
  // React Callback: componentDidMount()
  componentDidMount() {
  
    
    // Debounce the codeMirrorUpdateHints() function
    this.codeMirrorUpdateHints = _.debounce(this.codeMirrorUpdateHints, 100, true)

    // Semantic-UI item setup (Accordion etc)
    $('.ui.accordion').accordion({ exclusive: false, selector: { trigger: '.title .explicittrigger'} })

    // CodeMirror setup
    const textareaNode = this.refs.textarea
    let cmOpts = {  
      mode: "htmlmixed",
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
          
      gutters: [
        "CodeMirror-lint-markers", 
        "CodeMirror-linenumbers", 
        "CodeMirror-foldgutter",
        "mgb-cm-user-markers"
      ],
      extraKeys: {
        "Alt-F": "findPersistent",        
        "Ctrl-B": this.handleJsBeautify.bind(this),
        "Ctrl-O": function(cm) { cm.foldCode(cm.getCursor()); }
      },
      lint: false,
      autofocus: true,
      highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true}
    }
    
    this.codeMirror = CodeMirror.fromTextArea(textareaNode, cmOpts)
    
    this.codeMirror.on('change', this.codemirrorValueChanged.bind(this))
    this.codeMirror.on("cursorActivity", this.codeMirrorUpdateHints.bind(this, false))

    this._currentCodemirrorValue = this.props.asset.content2.src || '';
    this.codeMirrorUpdateHints(true)

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
  }
  
  applyChangeToSrc(newValue, changeActivityDescription)
  {
    this.codeMirror.setValue(newValue)
    this._currentCodemirrorValue = newValue;
    let newC2 = { src: newValue }
    this.props.handleContentChange( newC2, "", changeActivityDescription)
  }
  
  handleJsBeautify()
  {    
    let newValue = html_beautify(this._currentCodemirrorValue, {indent_size: 2})
    this.applyChangeToSrc(newValue, "Beautify code")
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
   

  codemirrorValueChanged (doc, change) {
    // Ignore SetValue so we don't bounce changes from server back up to server
    if (change.origin !== "setValue")
    {
      const newValue = doc.getValue();
      this._currentCodemirrorValue = newValue;
      let newC2 = { src: newValue }
      this.props.handleContentChange( newC2, "", "Edit code" )
    }
  }


  componentDidUpdate() {
    this.cm_updateActivityMarkers()
  }
  

  componentWillUnmount()
  {
    $(window).off("resize", this.edResizeHandler)
    // TODO: Destroy CodeMirror editor instance?
  }
  
  
  handleOnChange(updatedSourceCodeAsString) {
    let newC2 = { src: updatedSourceCodeAsString }
    this.props.handleContentChange( newC2, "" ) // TODO: Thumbnail is second param
  }

  /** 
   * @param markupString - the HTML text
   * @param flavor - either 'html' or 'jsx'
   */
  ensureHtmlIsOfFlavor(markupString, flavor)
  {
    let newMarkup
    if (flavor === 'jsx')
      newMarkup = markupString.replace(/class=/g, 'className=')
    else if (flavor === 'html')
      newMarkup = markupString.replace(/className=/g, 'class=')
    else
      newMarkup = `ERROR. Unknown Markup flavor "${flavor}"`
    return newMarkup
  }
  
  handleStripReactComments()
  {
    let oldMarkup = this._currentCodemirrorValue
    let newMarkup = oldMarkup.replace(/<!-- \/?react-[\s\S]*?-->/g, '')
    this.applyChangeToSrc(newMarkup, "Remove React Comments")
  }

  createMarkup (){
    return {__html: this.ensureHtmlIsOfFlavor(this._currentCodemirrorValue, "html")};
  }

  ToggleJsxHtml () {
    var wantJsx = !this.state.showingInJsxFormat    // ! because we will toggle here

    let newMarkup = this.ensureHtmlIsOfFlavor(this._currentCodemirrorValue, wantJsx ? "jsx" : "html")
    let changeActivityDescription = "Convert to " + (wantJsx ? "JSX": "HTML")
    this.applyChangeToSrc(newMarkup, changeActivityDescription)
    this.setState( {showingInJsxFormat : wantJsx})    
  }

  /** React callback when props are going to change.
   *  We do some dirty tricks here because we are trying to reduce codeMirror updates causing redraws
   */
  componentWillReceiveProps (nextProps) {
    let currentCursor = this.codeMirror.getCursor()
    let newVal = nextProps.asset.content2.src
    
    if (this.codeMirror && newVal !== undefined && this._currentCodemirrorValue !== newVal) {
      this.codeMirror.setValue(newVal)
      this._currentCodemirrorValue = newVal
      this.codeMirror.setCursor(currentCursor)
    }  
  }

  render() {
    let asset = this.props.asset;

    if (!asset) 
      return null;

    return (
        <div className="ui grid">
          <div className="eight wide column">
            <div className="ui row">
            
              <span title='"Semantic UI" prototyper only for MGB dev team'><b>MGB UI scratchpad</b></span>
              
              <button className="ui right floated mini labeled icon button" 
                      onClick={this.handleJsBeautify.bind(this)}
                      title="convert between HTML's class= and React/JSX's className= formats">
                <i className="indent icon"></i>
                Beautify
              </button>
              
              <button className="ui right floated mini labeled icon button" 
                      onClick={this.ToggleJsxHtml.bind(this)}
                      title="Convert code between HTML and JSX styles of expressing class attributes for HTML elements">
                <i className="exchange icon"></i>
                {this.state.showingInJsxFormat ? "JSX ClassNames" : "HTML classes"}
              </button>

              <button className="ui right floated mini labeled icon button" 
                      onClick={this.handleStripReactComments.bind(this)}
                      title="Remove the <-- react- ... --> comments that can appear when pasting React-generated code from Chrome Dev Tools">
                <i className="compress icon"></i>
                Strip React comments
              </button>



            </div>
            <textarea ref="textarea"
                      defaultValue={asset.content2.src} 
                      autoComplete="off"
                      placeholder="Start typing code here..."/>
          </div>
        
        <div className="eight wide column">
        
          <div className="mgbAccordionScroller">
            <div className="ui fluid styled accordion">
                            
              <div className="active title">
                <span className="explicittrigger">
                  <i className="dropdown icon"></i>
                  Semantic UI - Rendered Preview
                  </span>                
              </div>
              <div className="active content">
                
						    <div className="ui raised segment" dangerouslySetInnerHTML={this.createMarkup()}/>
              </div>
            
              <div className="title">
                <span className="explicittrigger">
                  <i className="dropdown icon"></i>
                  Semantic UI - Documentation Links
                  </span>                
              </div>
              <div className="content">
                <SemanticUiDocLinks />
              </div>                

              <div className="title">
                <span className="explicittrigger">
                  <i className="dropdown icon"></i>
                  Semantic UI - Icon Finder tool
                  </span>                
              </div>
              <div className="content">
                <SemanticUiIconFinder />
              </div>                


            </div>
          </div>
        </div>
      </div>
    );
  }
}