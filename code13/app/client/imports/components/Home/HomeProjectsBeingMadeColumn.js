import React, { PropTypes, Component } from 'react'
import homeStyles from '/client/imports/routes/home.css'
import getStartedStyle from '/client/imports/routes/GetStarted.css'
import ProjectsBeingMadeGET from '/client/imports/components/Projects/ProjectsBeingMadeGET'

import QLink from '/client/imports/routes/QLink'

const _propTypes = {
}

const _hdrSpaceBelowSty = {marginBottom: "1em"}


const HomeProjectsBeingMadeColumn = () => (
  <div className="column">
    <h2 style={_hdrSpaceBelowSty}>Watch games being made</h2>
    <ProjectsBeingMadeGET numEntries={4} chosenClassName="ui very relaxed list" />
    <br />
    <QLink to={`/assets`}>
      <button className="ui black large button">See more games</button>
    </QLink>
  </div>
)

HomeProjectsBeingMadeColumn.propTypes = _propTypes
export default HomeProjectsBeingMadeColumn