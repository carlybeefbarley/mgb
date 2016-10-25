import React, { PropTypes } from 'react'
import { getCurrentReleaseVersionString } from '/imports/mgbReleaseInfo'

const DeploymentAlert = ( { deploymentVersion } ) => (
  getCurrentReleaseVersionString() === deploymentVersion ? null : 
    <a
        className='fitted item' 
        title={`MGB is updating to release: ${deploymentVersion}`}
        style={{paddingLeft: "16px", marginTop: "6px"}} >
      <i className={"circular inverted orange refresh loading icon"} />
    </a>
)

const SystemAlerts = ( { sysvars } ) => (
  !sysvars ? null : 
    <DeploymentAlert deploymentVersion={sysvars && sysvars.deploymentVersion} />
)

export default SystemAlerts