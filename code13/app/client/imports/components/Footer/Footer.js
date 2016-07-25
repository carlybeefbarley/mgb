import React from 'react';

export default class Footer extends React.Component {

  render() {
    return (
      <div className="ui  vertical footer segment" style={{marginTop: "20px"}}>
        <div className="ui center aligned container">
          <div className="ui stackable divided grid">
            <div className="three wide column">
              <h4 className="ui header">Make Games</h4>
              <div className="ui link list">
                <a href="#" className="item">Make Art</a>
                <a href="#" className="item">Make Maps</a>
              </div>
            </div>
            <div className="three wide column">
              <h4 className="ui header">Make Friends</h4>
              <div className="ui link list">
                <a href="#" className="item">Help each other out</a>
                <a href="#" className="item">Work in teams</a>
              </div>
            </div>
            <div className="three wide column">
              <h4 className="ui header">Have Fun</h4>
              <div className="ui link list">
                <a href="#" className="item">Play Games</a>
                <a href="#" className="item">Learn the fun way</a>
              </div>
            </div>
            <div className="seven wide column">
              <h4 className="ui header">Gain Skills</h4>
              <p>Learn real world skills like Javscript and CSS, but without boring 'do this, do that' lessons. Learn by making, learn from friends, pay it forward.</p>
            </div>
          </div>
          <div className="ui section divider"></div>
          {/*<img src="assets/images/logo.png" className="ui centered mini image"></img>*/}
            <div className="ui horizontal small divided link list">
              <a className="item" href="#">Site Map</a>
              <a className="item" href="#">Contact Us</a>
              <a className="item" href="#">Terms and Conditions</a>
              <a className="item" href="#">Privacy Policy</a>
            </div>
        </div>
      </div>

    );
  }
}
