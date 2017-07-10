import React, { PropTypes } from 'react'
import { countCurrentUserSkills } from '/imports/schemas/skills'
import { maxSkillsCount } from '/imports/Skills/SkillNodes/SkillNodes'

export default (SkillCountsLabel = ({ skills }) => {
  const mySkillCount = countCurrentUserSkills(skills)
  return (
    <span className="ui label large right floated" style={{ float: 'right', opacity: '0.75' }}>
      {mySkillCount} / {maxSkillsCount}&nbsp;&nbsp;
      <i className="check circle icon" style={{ marginRight: 0 }} />
    </span>
  )
})
