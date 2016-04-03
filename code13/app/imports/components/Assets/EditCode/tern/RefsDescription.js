import React, { PropTypes } from 'react';

export default FunctionDescription = React.createClass({
  propTypes: {
    RefsInfo: PropTypes.object       // This is the data from ternServer REFS request
},

render: function() {
  if (!this.props.RefsInfo)
    return null

  let refs = this.props.RefsInfo.refs;
  let otherRefs = refs.length-1;

  if (otherRefs < 1)
    return null
    
    
  return (
    <div className="ui segment">
    { otherRefs === 1 ? 
      <span>There is 1 other reference to this variable/property. Press CTRL-S to highlight it</span> : 
      <span>There are {otherRefs} other references to this variable/property. Press CTRL-S to highlight them</span>
    }
    </div>)
  }
  
})