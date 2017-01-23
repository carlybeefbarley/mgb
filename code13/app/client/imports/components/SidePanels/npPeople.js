import React from 'react'
import QLink from '/client/imports/routes/QLink'
import { Icon } from 'semantic-ui-react'

const npPeople = () => (
  <div className="ui vertical inverted fluid menu" style={{backgroundColor: "transparent"}}>
    <div className="ui item" key="authHdr">
      <h3 className="ui inverted header" style={{textAlign: "center"}}>
        <Icon name='street view' />
        Meet
      </h3>
    </div>
    <QLink id="mgbjr-np-meet-allUsers" to="/users" className="item">
      <Icon name='street view' /> All Users
    </QLink>
    <QLink id="mgbjr-np-meet-allAssets" to="/assets" className="item">
      <Icon name='pencil' /> All Assets
    </QLink>
  </div>
)

export default npPeople