import React, { Component } from 'react';

// TODO: CloseToast support

export default  Toast = React.createClass({
  render: function() {
    
    let {type} = this.props;
    let msgClass = "ui message";
    if (type === 'success')
      msgClass = "ui succcess message"
     else if (type === 'error')
      msgClass = "ui negative message"
     
    if (type === 'success')
    return (
      <div className={msgClass}>
        {this.props.content}
      </div>
    );
  }
})
