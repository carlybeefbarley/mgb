import _ from 'lodash';
import React, {Component} from 'react';
import styles from './home.css';
import QLink from './QLink';


export default class GetStarted_Z2 extends Component {

  render() {
    const currUser = this.props.currUser
    const username = currUser ? currUser.profile.name : "guest"

    return (
      // TODO: JSX does not seem to allow !important overrides, so either we need to add some global styling for
      // narrow containers or handle the centering some other way
      <div className="ui container" style={{padding: '0 52px'}}>
        <div className="ui grid stackable" style={{marginTop: '1em'}}>
          <div className="row">
            <div className="column">
              <h1 className="ui huge header" style={{fontSize: '2.5em'}}>
                What would you like to do?
                <em className="sub header">There are lots of skills needed to make a game</em>
              </h1>
            </div>
          </div>
          <div className="row">
            <div className="column">
              <div className="ui three doubling cards">
                <a className="card">
                  <div className="image" style={{padding: '1em'}}>
                    <img src="images/mascots/slimy2.png" />
                  </div>
                  <div className="content">
                    <h3><i className="code icon" />&nbsp;Coding</h3>
                  </div>
                </a>
                <a className="card">
                  <div className="image" style={{padding: '1em'}}>
                    <img src="images/mascots/slimy2.png" />
                  </div>
                  <div className="content">
                    <h3><i className="paint brush icon" />&nbsp;Pixel art</h3>
                  </div>
                </a>
                <a className="card">
                  <div className="image" style={{padding: '1em'}}>
                    <img src="images/mascots/slimy2.png" />
                  </div>
                  <div className="content">
                    <h3><i className="music icon" />&nbsp;Music &amp; audio</h3>
                  </div>
                </a>
                <a className="card">
                  <div className="image" style={{padding: '1em'}}>
                    <img src="images/mascots/slimy2.png" />
                  </div>
                  <div className="content">
                    <h3><i className="idea icon" />&nbsp;Game design</h3>
                  </div>
                </a>
                <a className="card">
                  <div className="image" style={{padding: '1em'}}>
                    <img src="images/mascots/slimy2.png" />
                  </div>
                  <div className="content">
                    <h3><i className="write icon" />&nbsp;Story writing</h3>
                  </div>
                </a>
                <a className="card">
                  <div className="image" style={{padding: '1em'}}>
                    <img src="images/mascots/slimy2.png" />
                  </div>
                  <div className="content">
                    <h3><i className="area chart icon" />&nbsp;Analytics</h3>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
