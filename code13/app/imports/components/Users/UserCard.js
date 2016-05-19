import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import {browserHistory} from 'react-router';
import InlineEdit from 'react-edit-inline';


export default UserProfile = React.createClass({
  propTypes : {
    makeClickable: PropTypes.bool,
    name: PropTypes.string,
    bio: PropTypes.string,
    title: PropTypes.string,
//    createdAt: PropTypes.date
  },  

  dataChanged: function(data) {
      // data = { description: "New validated text comes here" }
      // Update your model from here
      console.log(data)
      this.setState({...data})
  },


  customValidateText: function(text) {
    return (text.length > 0 && text.length < 64);
  },


  render: function() {
    const createdAt = this.props.createdAt;

    return (
      <div className="ui card" 
           onClick={this.props.makeClickable ? browserHistory.push(`/user/${this.props.user._id}`) : ''}>
        <div className="ui image">
          <img src={this.props.avatar} />
        </div>
        <div className="ui content">
          <div className="ui header">{this.props.name}</div>
          <div className="ui meta">
            
            <InlineEdit
              validate={this.customValidateText}
              activeClassName="editing"
              text={this.props.title ? this.props.title: "(no title)"}
              paramName="message"
              change={this.dataChanged}
              isDisabled={true}
              style={{
                //backgroundColor: 'yellow',
                minWidth: 150,
                display: 'inline-block',
                margin: 0,
                padding: 0,
                fontSize: 15,
                outline: 0,
                border: 0
              }}
              />
            
          </div>
          <div className="ui description">
            {this.props.bio ?  this.props.bio : "(no description)" }
          </div>
        </div>
        <div className="ui extra content">
            <span className="ui right floated">
              Joined {moment(createdAt).format('MMMM DD, YYYY')}
            </span>
            <span>
              <i className="ui user icon"></i>
            </span>            
          </div>    
      </div>
    );
  }
})
