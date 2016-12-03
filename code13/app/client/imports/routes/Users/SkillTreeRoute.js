import React from 'react'
import Helmet from 'react-helmet'
import SkillsMap from '/client/imports/components/Skills/SkillsMap.js'

const SkillTreeRoute = ( { user } ) => (
  <div className="ui basic segment">
    <Helmet
        title="Skill Tree"
        meta={ [ {"name": "description", "content": "SkillTree"} ] } />
    <SkillsMap user={user} />
  </div>
)

SkillTreeRoute.propTypes = {
  user: React.PropTypes.object
}

export default SkillTreeRoute