import React, { Component, PropTypes } from 'react';
import QLink from '../../routes/QLink';

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
              <QLink to="/join" >
                Need an account? Join Now
              </QLink>
            </div>
          );
        case 'forgot':
          return (
            <div key={i} className="ui item">
            <QLink to="/forgot-password">
              Forgot Password? 
            </QLink>
          </div>
          );
        case 'signin':
          return (
            <div key={i} className="ui item">
            <QLink to="/signin">
              Already have an account? Login
            </QLink>
          </div>
          );
      }
    });
    return linksToUse
  }
}
