import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Header, Icon, Item } from 'semantic-ui-react'

const npLearn = ( { currUser } ) => (
  <div className="ui large vertical attached inverted fluid menu" style={{backgroundColor: "transparent"}}>
    <Item>
      <Header as='h3' inverted style={{textAlign: "center"}}>
        <Icon name='student' />
        Learn
      </Header>
    </Item>

    <div className="header item">Tutorials</div>
    <div className="menu">
      <QLink to="/learn/getStarted" className="item">
        <Icon color='yellow' name='rocket' />
        Get Started
      </QLink>
      <QLink to="/learn/games" className="item">
        <Icon name='game' />
        Make/Mod games
      </QLink>
      <QLink to="/learn/skills" className="item">
        <Icon color='green' name='student' />
        Learn skills
      </QLink>
      <QLink to="/learn" className="item">
        <Icon color='orange' name='map signs' />
        All Learning paths
      </QLink>
    </div>

    { currUser && 
      <div className="header item">Skills</div>
    }
    { currUser && 
      <div className="menu">
        <QLink to={`/u/${currUser.username}/skilltree`} className="item">
          <Icon name='plus circle' />
          My Skills
        </QLink>
      </div>
    }

  </div>
)

npLearn.propTypes = {
  currUser:           PropTypes.object,             // Currently Logged in user. Can be null/undefined
  panelWidth:         PropTypes.string.isRequired   // Typically something like "200px".
}

export default npLearn