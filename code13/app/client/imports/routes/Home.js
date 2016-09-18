import React, { PropTypes, Component } from 'react'
import styles from './home.css'
import QLink from './QLink'
import Footer from '/client/imports/components/Footer/Footer'
import getStartedStyle from './GetStarted.css'
import RecentlyEditedAssetGET from '/client/imports/components/Nav/RecentlyEditedAssetGET'
import ProjectsBeingMadeGET from '/client/imports/components/Projects/ProjectsBeingMadeGET'


const _propTypes = {
  params: PropTypes.object,           // params.assetId is the ASSET id
  currUser: PropTypes.object,
  currUserProjects: PropTypes.array   // Both Owned and memberOf. Check ownerName / ownerId fields to know which
}

const _hdrSpaceBelowSty = {marginBottom: "1em"}

const HeroBanner = (props) => (
  <div className="ui basic padded segment slim" style={{ margin: '0 auto', paddingTop: '1.25em', paddingBottom: '1.75em' }}>
    <div className="row">
      <div className="column">
        <img className="ui small right floated image" src="/images/mascots/team.png" style={{width: "480px", marginTop: "1.5em"}} />
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

const SkillTreeColumn = (props) => (
  <div className="column">
    <h2 style={_hdrSpaceBelowSty}>Grow your <em>real</em> skill tree</h2>
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
    <br />
    <QLink to={`/getstarted`}>
    { props.userId ?
      <button className="ui teal large button">Set skill goals</button>
      :
      <button className="ui teal large button">Build a game</button>
    }
    </QLink>
  </div>
)

const ProjectsBeingMadeColumn = () => (
  <div className="column">
    <h2 style={_hdrSpaceBelowSty}>Watch games being made</h2>
    <ProjectsBeingMadeGET numEntries={4} chosenClassName="ui very relaxed list" />
    <br />
    <QLink to={`/assets`}>
      <button className="ui black large button">See more games</button>
    </QLink>
  </div>
)


const MeetFriendsColumn = () => (
  <div className="column">
    <h2 style={_hdrSpaceBelowSty}>Meet creative friends</h2>
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
    <br />
    <QLink to={`/users`}>
      <button className="ui black large button">See more creators</button>
    </QLink>
  </div>
)

export default class Home extends Component {

  render() {
    const { currUser } = this.props
    const username = currUser ? currUser.profile.name : "guest"
    const userId = currUser ? currUser._id : null

    return (
      <div>
        <div className="hero">
          <div className="ui container slim">
            <HeroBanner username={username} userId={userId} />
          </div>
        </div>
        <div className="ui container slim" style={{paddingTop: "2.5em", paddingBottom: "2em"}}>
          <div className="ui padded grid stackable">
            <div className="equal width row">
              <div className="ui stackable three column grid">
                <SkillTreeColumn userId={userId}/>
                <ProjectsBeingMadeColumn />
                <MeetFriendsColumn />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}
