import React, { PropTypes } from 'react';


export default FunctionDescription = React.createClass({
  propTypes: {
    functionHelp: PropTypes.object,
    functionArgPos: PropTypes.number
},

render: function() {
  let fh = this.props.functionHelp;
  if (!fh || this.props.functionArgPos === -1)
    return null;
    
    
  let paramInfo = fh.type.args.map((x,idx) => { 
            let paramColor = (idx == this.props.functionArgPos) ? "green" : "";
            return (
              <a className="item" key={x.name}>
                #{idx}&nbsp;<div className={`ui ${paramColor} horizontal label`}>{x.name}</div>
                {x.type}
              </a> 
            ) 
          })
  return (
    <div className="ui compact segment">
      <div className="ui header">
        Function: { `${fh.name}()` }
      </div>    
        {fh.type.rettype ? `return type: ${fh.type.retval}` : "(no return value from function)"}
      <div className="ui divided selection list">
        { (paramInfo && paramInfo.length > 0) ? paramInfo : <a className="item">(function takes no parameters</a> }   
      </div>
    </div>)
}
  
  
  
})