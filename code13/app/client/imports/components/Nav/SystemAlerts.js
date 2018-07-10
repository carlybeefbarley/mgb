import React from 'react'
import { getCurrentReleaseVersionString } from '/imports/mgbReleaseInfo'
import { Icon, Popup } from 'semantic-ui-react'

const DeploymentAlert = ({ deploymentVersion }) => {
  if (getCurrentReleaseVersionString() === deploymentVersion) return null

  return (
    <Popup
      inverted
      position="bottom left"
      mouseEnterDelay={500}
      size="tiny"
      wide="very"
      trigger={
        <Icon fitted loading size="large" name="refresh" color="orange" style={{ marginRight: '1rem' }} />
      }
      content={
        <span>
          <strong>MGB is upgrading!</strong>
          <p>Release: {deploymentVersion} will deploy in a few minutes</p>
        </span>
      }
    />
  )
}

const SystemAlerts = ({ sysvars = {} }) => {
  const { deploymentVersion } = sysvars

  if (!deploymentVersion) return null

  return <DeploymentAlert deploymentVersion={deploymentVersion} />
}

export default SystemAlerts
