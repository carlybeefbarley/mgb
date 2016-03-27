import React, { Component, PropTypes } from 'react';
import {Link} from 'react-router';

// TODO: Format like  http://semantic-ui.com/examples/login.html

export default class AuthLinks extends Component {
  // static PropTypes = {
  //   linksToUse: React.PropTypes.array
  // }

  constructor() {
    super();
    this.getLinksToUse = this.getLinksToUse.bind(this);
  }

  render() {
    const links = this.getLinksToUse();

    return (
      <div className="ui horizontal bulleted link list">
        {links}
      </div>
    )
  }

  getLinksToUse() {
    let linksToUse = this.props.linksToUse.map((link, i) => {
      switch (link) {
        case 'join':
          return (
            <div key={i} className="ui item">
              <Link to="/join" >
                Need an account? Join Now
              </Link>
            </div>
          );
        case 'forgot':
          return (
            <div key={i} className="ui item">
            <Link to="/forgot-password">
              Forgot Password? 
            </Link>
          </div>
          );
        case 'signin':
          return (
            <div key={i} className="ui item">
            <Link to="/signin">
              Already have an account? Login
            </Link>
          </div>
          );
      }
    });
    return linksToUse
  }
}
