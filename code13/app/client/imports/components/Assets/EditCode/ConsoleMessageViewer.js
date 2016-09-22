import _ from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';

export default ConsoleMessageViewer = React.createClass({
  propTypes: {
    messages: PropTypes.array, // of { mgbCmd: , data: }
    gotoLinehandler: PropTypes.func
  },

  cleanupMessage(argArray)
  {
     // Get rid of any %c modifiers, and remove the associated parameters. this is not robust, but works for the common case.
    var arg0 = argArray[0]		
    if (typeof arg0 === "string")
    {
      var noColor0 = arg0.replace(/%c/g, "")
      var removed = (arg0.length - noColor0.length)/2;
      var rest = argArray.slice(removed+1)
    
      return (noColor0 + "  " + rest.join(", ")).trim()
    }
    else
      return argArray.join(", ")
  },
  
  invokeGotoLinehandler(line)
  {
    if (this.props.gotoLinehandler)
      this.props.gotoLinehandler(line)
  },
  
  
  smartRender: function () {
    if (!this.props.messages)
      return null
      
    let fmt = { "log":  { style: {}, icon: "" },
                "debug": { style: {}, icon: "" },
                "info":  { style: {}, icon: "" },
                "warn":  { style: {color: "orange"}, icon: "warning " },
                "error": { style: {color: "red"}, icon: "x" },
                "windowOnerror": { style: {color: "red"}, icon: "bug" }
              }              

    return this.props.messages.map( (msg, idx) => {
      let fn = msg.consoleFn
      let s = { whiteSpace: "pre-wrap", marginTop: "2px", marginBottom: "0px", lineHeight: "12px", fontSize: "10px"}
      $.extend(s, fmt[fn].style)
      let atLine = !msg.line ? null : <a onClick={this.invokeGotoLinehandler.bind(this, msg.line)}>[line {msg.line}] </a>    
      let icon = <i className={`ui ${fmt[fn].icon} icon`}></i>
      let time = moment(msg.timestamp).format('h:mm:ss a')
      return <pre key={idx} style={s}>{time} {icon} {atLine}{this.cleanupMessage(msg.args)}</pre>
    })
  },

  render: function() {
    if (!this.props.messages)
      return null

    return (
        <div className="ui grey segment" style={{backgroundColor: "rgba(0,0,0,0.03)", maxHeight: "200px", overflow: "scroll"}}>
          <div className="header">Latest Console output from program</div>
          { this.smartRender() }
        </div>
      )
  }

})
