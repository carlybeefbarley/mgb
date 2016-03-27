import React, {Component} from 'react';
import styles from './home.css';
import {Link} from 'react-router';
import Footer from '../components/Footer/Footer';


export default class Home extends Component {

  render() {
    const currUser = this.props.currUser;

    return (
      <div>
        <div className="pusher">
          <div className="ui inverted vertical masthead center aligned segment">

            <div className="ui text container">
              <h1 className="ui inverted header">
                My Game Builder
              </h1>
              <h2>The Game-building Game</h2>
              { currUser ?
                <Link to={`/user/${currUser._id}/assets`}>
                  <div className="ui huge primary button">Keep Going <i className="right arrow icon"></i></div>
                </Link>
                : 
                <Link to={`/assets`}>
                  <div className="ui huge primary button">Get Started <i className="right arrow icon"></i></div>
                </Link>
              }
              
            </div>

          </div>

          <div className="ui vertical stripe segment">
            <div className="ui middle aligned stackable grid container">
              <div className="row">
                <div className="nine wide column">
                  <h3 className="ui header">Level Up from Noob to Guru</h3>
                  <p>Grow your REAL skill tree: javascript programming, pixel art animation, game design, story writing and more.</p>
                  <h3 className="ui header">Multimaker collaboration</h3>
                  <p>Making a game is now an MMO in itself: Make, watch, chat and play games with friends so you learn together.</p>
                </div>
                <div className="five wide right floated column">
                  <img src="/images/frontpage_mgb1.png" className="ui huge bordered rounded image"></img>
                </div>
              </div>
              <div className="row">
                <div className="center aligned column">
                  <Link to={`/assets`}>
                    <div className="ui huge button">See Games Being Built</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
    <Footer />
    </div>
    );
  }
}
