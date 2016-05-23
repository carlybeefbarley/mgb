import React, { PropTypes } from 'react';
var update = require('react-addons-update');
import moment from 'moment';
import { html_beautify } from 'js-beautify';

import { snapshotActivity } from '../../../schemas/activitySnapshots.js';

import CodeMirror from '../../CodeMirror/CodeMirrorComponent.js';
import SemanticUiIconFinder from './SemanticUiIconFinder.js';

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
    this._currentCodemirrorValue = this.props.asset.content2.src || '';    
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
  
  
  handleJsBeautify()
  {    
    let newValue = html_beautify(this._currentCodemirrorValue, {indent_size: 2})
    this.codeMirror.setValue(newValue)
    this._currentCodemirrorValue = newValue;
    let newC2 = { src: newValue }
    this.props.handleContentChange( newC2, "", `Beautify code`)
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


  createMarkup (){
    return {__html: this._currentCodemirrorValue};
  }


  render() {
    let asset = this.props.asset;

    if (!asset) 
      return null;

    return (
        <div className="ui grid">
          <div className="eight wide column">
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
                  Preview
                  </span>                
              </div>
              <div className="active content">
                
						    <div className="ui raised segment" dangerouslySetInnerHTML={this.createMarkup()}/>
              </div>
            
              <div className="active title">
                <span className="explicittrigger">
                  <i className="dropdown icon"></i>
                  Icon Finder
                  </span>                
              </div>
              <div className="active content">
                <SemanticUiIconFinder />
              </div>                
            </div>
          </div>
        </div>
      </div>
    );
  }
}