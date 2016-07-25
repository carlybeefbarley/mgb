import React, {Component} from 'react';
import styles from './home.css';
import QLink from './QLink';
import Footer from '/client/imports/components/Footer/Footer';

export default class NotFoundPage extends Component {

  render() {
    const currUser = this.props.currUser;

    return (
          
      <div>
        <div className="pusher">
          <div className="ui  vertical masthead center aligned segment">

            <div className="ui text container">
              <h1 className="ui  header">
                My Game Builder
              </h1>
              <h2>404 - Page Not Found</h2>
              { currUser ?
                <QLink to={`/u/${currUser.profile.name}/assets`}>
                  <div className="ui huge primary button">Keep Going <i className="right arrow icon"></i></div>
                </QLink>
                : 
                <QLink to={`/assets`}>
                  <div className="ui huge primary button">Get Started <i className="right arrow icon"></i></div>
                </QLink>
              }
              
            </div>

          </div>

        </div>
    <Footer />
    </div>
    );
  }
}
