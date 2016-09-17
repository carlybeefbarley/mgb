import _ from 'lodash';
import React, {Component} from 'react';
import styles from './home.css';
import QLink from './QLink';
import getStartedStyle from './GetStarted.css';


export default class GetStarted extends Component {

  render() {
    const currUser = this.props.currUser
    const username = currUser ? currUser.profile.name : "guest"

    const cardStyle = {
      color: "#2e2e2e",
    }

    const mascotStyle = {
      maxWidth: "8em",
      paddingRight: "0.5em",
      marginBottom: "0",
    }

    const headerStyle = {
      marginTop: "0.15em",
      marginBottom: "0.4em",
    }

    const descStyle = {
      fontSize: "1.25em",
      lineHeight: "1.5em",
    }

    return (
      <div className="ui container slim">
        <div className="ui grid stackable" style={{marginTop: '3.5em'}}>
          <div className="row">
            <div className="column">
              <h1 className="ui huge header" style={{fontSize: '2.5em'}}>
                What would you like to try?
                <em className="sub header">There are lots of skills to learn</em>
              </h1>
            </div>
          </div>
          <div className="row">
            <div className="column">
              <div className="ui two cards stackable skills">
                <QLink className="card" style={cardStyle} to={`/assets/create`}>
                  <div className="content">
                    <div className="ui left floated image" style={mascotStyle}>
                      <img src="/images/mascots/alien.png" />
                    </div>
                    <h2 style={headerStyle}><i className="code icon" />&nbsp;Coding</h2>
                    <p style={descStyle}>Code using JavaScript and game engines like Phaser and others.</p>
                  </div>
                </QLink>
                <QLink className="card" style={cardStyle} to={`/assets/create`}>
                  <div className="content">
                    <div className="ui left floated image" style={mascotStyle}>
                      <img src="/images/mascots/penguin.png" />
                    </div>
                    <h2 style={headerStyle}><i className="paint brush icon" />&nbsp;Pixel art</h2>
                    <p style={descStyle}>Code using JavaScript and game engines like Phaser and others.</p>
                  </div>
                </QLink>
                <QLink className="card" style={cardStyle} to={`/assets/create`}>
                  <div className="content">
                    <div className="ui left floated image" style={mascotStyle}>
                      <img src="/images/mascots/samurai.png" />
                    </div>
                    <h2 style={headerStyle}><i className="music icon" />&nbsp;Audio &amp; music</h2>
                    <p style={descStyle}>Code using JavaScript and game engines like Phaser and others.</p>
                  </div>
                </QLink>
                <QLink className="card" style={cardStyle} to={`/assets/create`}>
                  <div className="content">
                    <div className="ui left floated image" style={mascotStyle}>
                      <img src="/images/mascots/slimy.png" />
                    </div>
                    <h2 style={headerStyle}><i className="idea icon" />&nbsp;Game design</h2>
                    <p style={descStyle}>Code using JavaScript and game engines like Phaser and others.</p>
                  </div>
                </QLink>
                <QLink className="card" style={cardStyle} to={`/assets/create`}>
                  <div className="content">
                    <div className="ui left floated image" style={mascotStyle}>
                      <img src="/images/mascots/vampire.png" />
                    </div>
                    <h2 style={headerStyle}><i className="write icon" />&nbsp;Story writing</h2>
                    <p style={descStyle}>Code using JavaScript and game engines like Phaser and others.</p>
                  </div>
                </QLink>
                <QLink className="card" style={cardStyle} to={`/assets/create`}>
                  <div className="content">
                    <div className="ui left floated image" style={mascotStyle}>
                      <img src="/images/mascots/shark.png" />
                    </div>
                    <h2 style={headerStyle}><i className="area chart icon" />&nbsp;Analytics</h2>
                    <p style={descStyle}>Code using JavaScript and game engines like Phaser and others.</p>
                  </div>
                </QLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
