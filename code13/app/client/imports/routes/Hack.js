import React, { PropTypes } from 'react'
import { Segment } from 'semantic-ui-react'
import Mage from '/client/imports/components/MapActorGameEngine/Mage'

const _fetchAssetByUri = uri => {
  var promise = new Promise( function (resolve, reject) {
    var client = new XMLHttpRequest()
    client.open('GET', uri)
    client.send()
    client.onload = function () {
      if (this.status >= 200 && this.status < 300) 
        resolve(this.response)  // Performs the function "resolve" when this.status is equal to 2xx
      else
        reject(this.statusText) // Performs the function "reject" when this.status is different than 2xx
    }
    client.onerror = function () { reject(this.statusText) }
  })
  return promise
}



const Hack = props => 
{
  const { params, user, currUser } = props

  return (
    <Segment basic padded>
      <Mage 
          ownerName={user.profile.name}
          startMapName={params.map || 'mechanix2.Start Game Demos'}
          isPaused={false}
          fetchAssetByUri={ uri => _fetchAssetByUri(uri) }
      />
    </Segment>
  )
}

Hack.propTypes = {
  params: PropTypes.object,             // params.id is the USER id  OR  params.username is the username
  user: PropTypes.object,               // This is the related user record. We list the projects for this user
  currUser: PropTypes.object            // Currently Logged in user. Can be null
}
export default Hack