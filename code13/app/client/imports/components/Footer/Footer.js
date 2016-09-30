import React from 'react'

const footerStyle = {
  marginTop: "10px",
  paddingTop: "2.5em",
  backgroundColor: "#f3f3f3",
  fontSize: "1.15em"
}

export default Footer = () => (
  <div className="ui padded vertical footer segment" style={footerStyle}>

    <div className="ui section"></div>
    <div className="ui left aligned container">
      <div className="ui stackable grid">
        <div className="seven wide column">
          <h4 className="ui header" style={{fontSize: "1.15em"}}>Gain Skills</h4>
          <p>Learn real world skills like Javscript and CSS, but without boring <em>'do this, do that'</em> lessons. Learn by making, learn from friends, pay it forward.</p>
        </div>
        <div className="three wide column">
          <h4 className="ui header" style={{fontSize: "1.15em"}}>Make Games</h4>
          <div className="ui link list">
            <a href="#" className="item">Make Art</a>
            <a href="#" className="item">Make Maps</a>
          </div>
        </div>
        <div className="three wide column">
          <h4 className="ui header" style={{fontSize: "1.15em"}}>Make Friends</h4>
          <div className="ui link list">
            <a href="#" className="item">Help each other out</a>
            <a href="#" className="item">Work in teams</a>
          </div>
        </div>
        <div className="three wide column">
          <h4 className="ui header" style={{fontSize: "1.15em"}}>Have Fun</h4>
          <div className="ui link list">
            <a href="#" className="item">Play Games</a>
            <a href="#" className="item">Learn the fun way</a>
          </div>
        </div>
      </div>
      <div className="ui hidden divider"></div>
      <br />
    </div>

    <div className="ui section"></div>
    <div className="ui left aligned container">
      <div className="ui horizontal small relaxed divided link list">
        <a className="item" href="#">Copyright ©2016 MyCodeBuilder Inc. All Rights Reserved.</a>
        <a className="item" href="/legal/tos">Terms and Conditions</a>
        <a className="item" href="/legal/privacy">Privacy Policy</a>
        <a className="item" href="#">Contact Us</a>
      </div>
    </div>
  </div>
)