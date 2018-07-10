import PropTypes from 'prop-types'
import React from 'react'
import { Popup, Button } from 'semantic-ui-react'

const ProjectsShowForkableSelector = ({ showForkable, handleChangeFlag }) => {
  const active = showForkable === '1'
  const button = (
    <Button
      icon="fork"
      color={active ? 'green' : null}
      onClick={() => handleChangeFlag(active ? '0' : '1')}
    />
  )

  return (
    <Popup
      size="small"
      trigger={button}
      on="hover"
      position="bottom left"
      header="Show/hide forkable Projects"
      content={
        active ? (
          "Currently showing ONLY 'Forkable' Projects. Click here to ALSO show non-forkable Projects"
        ) : (
          "Currently showing 'Forkable' AND 'non-Forkable' Projects. Click here to ONLY show 'Forkable' Projects"
        )
      }
    />
  )
}

ProjectsShowForkableSelector.propTypes = {
  showForkableFlag: PropTypes.string, // "1" or "0". If "1", show only stable assets
  handleChangeFlag: PropTypes.func, // params = newShowStableFlag.. should be "1" or "0"
}

export default ProjectsShowForkableSelector
