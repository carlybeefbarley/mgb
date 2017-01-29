import React, { PropTypes } from 'react'
import { getCurrentReleaseVersionString } from '/imports/mgbReleaseInfo'

const DeploymentAlert = ( { deploymentVersion } ) => (
  getCurrentReleaseVersionString() === deploymentVersion ? null :
    <a
        className='fitted item'
        title={`MGB is upgrading! Release: ${deploymentVersion} will deploy in a few minutes`}
        style={ { paddingLeft: '14px', marginTop: '4px' } } >
      <i className='orange refresh loading icon' />
    </a>
)

const SystemAlerts = ( { sysvars } ) => (
  !sysvars ? null :
    <DeploymentAlert deploymentVersion={sysvars && sysvars.deploymentVersion} />
)

export default SystemAlerts
