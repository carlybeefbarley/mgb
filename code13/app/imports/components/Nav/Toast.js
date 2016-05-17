import React, { Component } from 'react';

export default  Toast = React.createClass({
  render: function() {  
    
    let msg  
    if (this.props.type === 'success')
      msg =  <div className="ui success message">
              <div className="content">
                <div className="header">Success!</div>
                <p>{this.props.content}</p>
              </div>
            </div>
    else
      msg =  <div className="ui icon error message">
              <i className="attention circle icon"></i>
              <div className="content">
                <div className="header">Alert</div>
                <p>{this.props.content}</p>
              </div>
            </div>
            
    return <div className="ui text container">
            <div className="ui padded basic segment">
              {msg}
            </div>
          </div>
  }
})
