import PropTypes from 'prop-types'
import React from 'react'
import { Popup, Button } from 'semantic-ui-react'

const AssetShowChallengeAssetsSelector = ({ showChallengeAssetsFlag, handleChangeFlag }) => {
  const active = showChallengeAssetsFlag === '1'
  const button = (
    <Button
      size="small"
      icon="checked calendar"
      color={active ? 'orange' : null}
      onClick={() => handleChangeFlag(active ? '0' : '1')}
    />
  )
  return (
    <Popup
      size="small"
      trigger={button}
      on="hover"
      position="bottom center"
      header="Show/hide Challenge Assets"
      content={
        active ? (
          'Currently only showing Assets created by Skill Challenge Tutorials. Click to show normally-created Assets instead'
        ) : (
          'Currently only showing normally-created Assets. Click to show Assets created by Skill Challenges instead'
        )
      }
    />
  )
}

AssetShowChallengeAssetsSelector.propTypes = {
  showChallengeAssetsFlag: PropTypes.string, // "1" or "0". If "1", show only ChallengeAssets
  handleChangeFlag: PropTypes.func, // params = new showChallengeAssetsFlag.. should be "1" or "0"
}

export default AssetShowChallengeAssetsSelector
