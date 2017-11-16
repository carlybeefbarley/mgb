import PropTypes from 'prop-types'
import React from 'react'
import { Label } from 'semantic-ui-react'

const ProgressLabel = ({ subSkillsComplete, subSkillTotal }) => (
  <Label attached="top right">
    {subSkillsComplete} / {subSkillTotal}
  </Label>
)

ProgressLabel.propTypes = {
  subSkillsComplete: PropTypes.number.isRequired,
  subSkillTotal: PropTypes.number.isRequired,
}

export default ProgressLabel
