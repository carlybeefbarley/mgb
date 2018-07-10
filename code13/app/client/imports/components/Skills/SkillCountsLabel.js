import PropTypes from 'prop-types'
import React from 'react'

import { countCurrentUserSkills } from '/imports/schemas/skills'
import { maxSkillsCount } from '/imports/Skills/SkillNodes/SkillNodes'

const SkillCountsLabel = ({ skills }) => {
  const mySkillCount = countCurrentUserSkills(skills)
  return (
    <span className="ui label large right floated" style={{ float: 'right', opacity: '0.75' }}>
      {mySkillCount} / {maxSkillsCount}&nbsp;&nbsp;
      <i className="check circle icon" style={{ marginRight: 0 }} />
    </span>
  )
}

SkillCountsLabel.propTypes = {
  skills: PropTypes.object.isRequired,
}

export default SkillCountsLabel
