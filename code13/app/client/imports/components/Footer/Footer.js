import React from 'react'
import ResponsiveComponent from '/client/imports/ResponsiveComponent'
import QLink from '/client/imports/routes/QLink'


const Footer = ( { respIsRuleActive, respData }) => (
  <div className="ui large inverted grey padded vertical segment">

    <div className="ui section"></div>
    { respIsRuleActive('showCallsToAction') &&
      <div className="ui left aligned container">
        <div className="ui grid">
          <div className="seven wide column">
            <h4 className="ui inverted grey header" style={{fontSize: "1.15em"}}>Gain Skills</h4>
            <p>Learn real world skills like Javascript and software design, but without boring <em>'do this, do that'</em> lessons. Learn by making, learn from friends, pay it forwardinverted .</p>
          </div>
          <div className="three wide column">
            <h4 className="ui inverted grey header" style={{fontSize: "1.15em"}}>Make Games</h4>
            <div className="ui inverted grey link list">
              <a href="#" className="item">Make Art</a>
              <a href="#" className="item">Make Maps</a>
            </div>
          </div>
          <div className="three wide column">
            <h4 className="ui inverted grey header" style={{fontSize: "1.15em"}}>Make Friends</h4>
            <div className="ui inverted grey link list">
              <a href="#" className="item">Help each other out</a>
              <a href="#" className="item">Work in teams</a>
            </div>
          </div>
          <div className="three wide column">
            <h4 className="ui inverted grey header" style={{fontSize: "1.15em"}}>Have Fun</h4>
            <div className="ui inverted grey link list">
              <a href="#" className="item">Play Games</a>
              <a href="#" className="item">Learn the fun way</a>
            </div>
          </div>
        </div>
        <div className="ui hidden divider"></div>
        <br />
      </div>
    }

    <div className="ui section"></div>
    <div className="ui left aligned container">
      <div className={`ui inverted grey small ${respData.legalListDirection} relaxed divided link list`}>
        <QLink className="item" to="#">Copyright ©2017 MyCodeBuilder Inc. All Rights Reserved.</QLink>
        <QLink className="item" to="/legal/tos">Terms of Service</QLink>
        <QLink className="item" to="/legal/privacy">Privacy Policy</QLink>
        <QLink className="item" to="/?_fp=chat">Contact Us</QLink>
      </div>
    </div>
  </div>
)

Footer.responsiveRules = {
  'showCallsToAction': {
    minWidth: 600
  },
  'legalStuffHorizontal': {
    minWidth: 750,
    respData: { legalListDirection: 'horizontal'}
  }
}

export default ResponsiveComponent(Footer)
