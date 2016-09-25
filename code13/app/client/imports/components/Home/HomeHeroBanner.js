import React, { PropTypes, Component } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'

import QLink from '/client/imports/routes/QLink'
import RecentlyEditedAssetGET from '/client/imports/components/Nav/RecentlyEditedAssetGET'

const _propTypes = {
  userId:   PropTypes.string,       // Can be null/undefined
  username: PropTypes.string,       // If no-one logged in, shoudl be something like 'guest'
}

const HomeHeroBanner = (props) => (
  <div className="ui basic segment slim" style={{ margin: '0 auto', paddingTop: '2.5em', paddingBottom: '4em' }}>
    <div className="row">
      <div className="column">
        <img className="ui small right floated image" src="/images/mascots/team.png" style={{width: "480px"}} />
        <h1 className="ui huge header" style={{fontSize: '3em', marginBottom: '0.5em'}}>
          My Game Builder
          <em className="sub header" style={{fontSize: '0.5em'}}>The Online Game-builder</em>
        </h1>
      { props.userId ?
        <p style={{fontSize: '1.5em', maxWidth: '450px'}}>
          Welcome back, {props.username}!
          <br />
          Last time you were working
          <br />
          on <em><RecentlyEditedAssetGET userId={props.userId} /></em>.
          <br />
          <QLink to={`/u/${props.username}/assets`}>
            <button className="ui teal huge button" style={{ marginTop: '1.5em' }}>Keep going</button>
          </QLink>
          <QLink to={`/getstarted`}>
            <button className="ui teal huge button" style={{ marginTop: '1.5em', marginLeft: '0.5em' }}>Learn new skills</button>
          </QLink>
        </p>
        :
        <p style={{ fontSize: '1.5em', maxWidth: '450px' }}>
          Creating a game is now an MMO:<br />Make, watch, chat and play games with friends so you learn together.
          <br />
          <QLink to={`/getstarted`}>
            <button className="ui teal huge button" style={{ marginTop: '1.5em' }}>Get started</button>
          </QLink>
        </p>
      }
      </div>
    </div>
  </div>
)


HomeHeroBanner.propTypes = _propTypes
export default HomeHeroBanner