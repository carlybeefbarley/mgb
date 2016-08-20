import _ from 'lodash';
import React, {Component} from 'react';
import styles from './home.css';
import QLink from './QLink';
import Footer from '/client/imports/components/Footer/Footer';


export default class Home_Z2 extends Component {

  render() {
    const currUser = this.props.currUser
    const username = currUser ? currUser.profile.name : "guest"

    return (
      <div>
        <div className="ui container">
          <div className="ui padded grid stackable" style={{ marginTop: '4.5em', marginBottom: '4.5em' }}>
            <div className="row" style={ currUser ? { maxWidth:"768px" } : { maxWidth:"512px" }}>
              <div className="column">
                <h1 className="ui huge header" style={{fontSize: '3em'}}>
                  My Game Builder
                  <em className="sub header">The Online Game-builder</em>
                </h1>
                <img className="ui tiny left floated image" src="/images/mascots/slimy.png" style={{ width: 160, marginTop: '2em', paddingRight: '1em' }} />
              { currUser ?
                <p style={{fontSize: '1.5em', marginTop: '1.75em'}}>
                  Welcome back, {username}!
                  <br />
                  Last time you were working on ImportTestSize.
                  <br />
                  Want to keep going?
                  <br />
                  <button className="ui primary large button" style={{ marginTop: '1em' }}>Get back to work</button>
                </p>
                :
                <p style={{ fontSize: '1.5em', marginTop: '1.75em' }}>
                  Creating a game is now an MMO:<br />Make, watch, chat and play games with friends so you learn together.
                  <br />
                  <button className="ui primary large button" style={{ marginTop: '1em' }}>Get started</button>
                </p>
              }
              </div>
            </div>
            <div className="equal width row">
              <div className="ui stackable three column grid">
                <div className="column">
                  <h2>Grow your <em>real</em> skill tree</h2>
                  <div className="ui very relaxed list">
                    <div className="item">
                      <i className="code large icon" />
                      <div className="content">
                        <h3>Programming</h3>
                      </div>
                    </div>
                    <div className="item">
                      <i className="paint brush large icon" />
                      <div className="content">
                        <h3>Pixel art</h3>
                      </div>
                    </div>
                    <div className="item">
                      <i className="music large icon" />
                      <div className="content">
                        <h3>Music &amp; audio</h3>
                      </div>
                    </div>
                    <div className="item">
                      <i className="idea large icon" />
                      <div className="content">
                        <h3>Game design</h3>
                      </div>
                    </div>
                    <div className="item">
                      <i className="write large icon" />
                      <div className="content">
                        <h3>Story writing</h3>
                      </div>
                    </div>
                    <div className="item">
                      <i className="area chart large icon" />
                      <div className="content">
                        <h3>Analytics</h3>
                      </div>
                    </div>
                  </div>
                { currUser ?
                  <button className="ui teal large button">Set skill goals</button>
                  :
                  <button className="ui teal large button">Make a game</button>
                }
                </div>
                <div className="column">
                  <h2>Watch games being made</h2>
                  <div className="ui very relaxed list">
                    <div className="item">
                      <img className="ui small middle aligned image rounded bordered" style={{ width: 120 }} src="/images/frontpage_mgb1.png" />
                      <div className="content middle aligned" style={{ marginLeft: '1em' }}>
                        <h3>Maze escape 3</h3>
                        <p><i className="play icon" />10,510 Plays</p>
                      </div>
                    </div>
                    <div className="item">
                      <img className="ui small middle aligned image rounded bordered" style={{ width: 120 }} src="/images/frontpage_mgb1.png" />
                      <div className="content middle aligned" style={{ marginLeft: '1em' }}>
                        <h3>Snail racer</h3>
                        <p><i className="play icon" />3,489 Plays</p>
                      </div>
                    </div>
                    <div className="item">
                      <img className="ui small middle aligned image rounded bordered" style={{ width: 120 }} src="/images/frontpage_mgb1.png" />
                      <div className="content middle aligned" style={{ marginLeft: '1em' }}>
                        <h3>untitled_4</h3>
                        <p><i className="play icon" />1,302 Plays</p>
                      </div>
                    </div>
                  </div>
                  <button className="ui black large button">See more games</button>
                </div>
                <div className="column">
                  <h2>Meet creative friends</h2>
                  <div className="ui very relaxed list">
                    <div className="item">
                      <img className="ui image avatar middle aligned" style={{ height: 60, width: 60 }} src="http://semantic-ui.com/images/avatar/small/helen.jpg" />
                      <div className="content middle aligned" style={{ marginLeft: '1em' }}>
                        <h3>azurehaze</h3>
                        <p><i className="trophy icon" />10 badges</p>
                      </div>
                    </div>
                    <div className="item">
                      <img className="ui image avatar middle aligned" style={{ height: 60, width: 60 }} src="http://semantic-ui.com/images/avatar/small/daniel.jpg" />
                      <div className="content middle aligned" style={{ marginLeft: '1em' }}>
                        <h3>bossmaker</h3>
                        <p><i className="trophy icon" />9 badges</p>
                      </div>
                    </div>
                    <div className="item">
                      <img className="ui image avatar middle aligned" style={{ height: 60, width: 60 }} src="http://semantic-ui.com/images/avatar/small/christian.jpg" />
                      <div className="tiny content middle aligned" style={{ marginLeft: '1em' }}>
                        <h3>uggy</h3>
                        <p><i className="trophy icon" />6 badges</p>
                      </div>
                    </div>
                  </div>
                  <button className="ui black large button">See more creators</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}
