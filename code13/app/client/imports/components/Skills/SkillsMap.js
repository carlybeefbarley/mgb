import './SkillsMap.less'
import _ from 'lodash'
import React, { PropTypes } from 'react'
import { Icon, Message } from 'semantic-ui-react'

import * as skillsModel from '/imports/Skills/SkillNodes/SkillNodes'
import * as skillsSchema from '/imports/schemas/skills'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const rootSkillPaths = [
  'getStarted',
  'code',
  'art',
  'design',
  'audio',
  'analytics',
  'writing',
  'marketing',
  'community',
  'legal',
  'business',
]

/**
 * An individual SkillsMapNode for use inside of the SkillsMap
 */
class SkillsMapNode extends React.Component {
  static propTypes = {
    toggleable: PropTypes.bool,        // whether or not skills can be learned/forgotten
    expandable: PropTypes.bool,        // whether or not nodes can be expanded to show children
    skills: PropTypes.object,          // user's skills object from context
    skillPath: PropTypes.string,       // the skill path within skills that this node should show
    userCanManuallyClaimSkill : PropTypes.bool,
    ownsProfile: PropTypes.bool        //prevent user other than one who owns profile from seeing messages and checkmark boxes
  }

  state = {
    isExpanded: false,
  }

  toggleSkill = skillPath => () => {
    const { skills, toggleable } = this.props
    if (!toggleable) return

    skillsSchema.toggleSkill( skills, skillPath )
  }

  toggleExpand = () => {
    const { expandable } = this.props
    if (!expandable) return

    this.setState( { isExpanded: !this.state.isExpanded } )
  }

  renderChildLeaves = childLeaves => {
    if (_.isEmpty( childLeaves ))
      return null

    const { skills, userCanManuallyClaimSkill, ownsProfile } = this.props

    return (
      <div className='leaves'>
        {_.map( childLeaves, skillPath => {
          const hasSkill = skillsSchema.hasSkill( skills, skillPath )
          const iconProps = hasSkill ? { name: 'checkmark', color: 'green' } : { name: 'square outline' }
          const classes = _.compact( [hasSkill && 'active', 'leaf'] ).join( ' ' )

          return (
            <div key={skillPath} className={classes} 
              data-tooltip={(hasSkill && ownsProfile) ? "Warning: Unchecking means you must earn the skill again" : null} 
              data-inverted=""
              onClick={(userCanManuallyClaimSkill || hasSkill) ? this.toggleSkill(skillPath) : null}
            >
              <Icon { ...iconProps } />
              {skillsModel.getFriendlyName( skillPath )}
            </div>
          )
        } )}
      </div>
    )
  }

  renderChildTree = (skillPath) => {
    const { expandable, skills, toggleable, userCanManuallyClaimSkill, ownsProfile } = this.props
    return (
      <SkillsMapNode
        key={skillPath}
        expandable={expandable}
        toggleable={toggleable}
        skills={skills}
        skillPath={skillPath}
        userCanManuallyClaimSkill={userCanManuallyClaimSkill}
        ownsProfile={ownsProfile}
      />
    )
  }

  render() {
    const { expandable, skills, skillPath, toggleable } = this.props
    const { isExpanded } = this.state

    const skillPathRoot = _.head( _.split( skillPath, '.' ) )

    const childPaths = skillsModel.getChildPaths( skillPath )
    const [childLeaves, childTrees] = _.partition( childPaths, skillsModel.isLeafPath )

    const totalSkills = skillsModel.countMaxUserSkills( skillPath )
    const completedSkills = skillsSchema.countCurrentUserSkills( skills, skillPath )

    const classes = _.compact( [
      'mgb-skillmap',
      skillPathRoot,
      isExpanded && 'active',
      expandable && 'expandable',
      toggleable && 'toggleable',
    ] ).join( ' ' )

    return (
      <div className={classes}>
        <div className='progress' onClick={this.toggleExpand}>
          <div className='label'>
            <Icon name={isExpanded ? 'minus' : 'plus'} />
            {skillsModel.getFriendlyName( skillPath )}
          </div>
          <div className='cells'>
            {_.times( totalSkills, (i) => (
              <div key={i} className={[completedSkills > i ? 'active' : '', 'cell'].join( ' ' )} />
            ) )}
          </div>
        </div>
        {isExpanded && (
          <div className='content'>
            {this.renderChildLeaves( childLeaves )}
            {!_.isEmpty( childTrees ) && childTrees.map( this.renderChildTree )}
          </div>
        )}
      </div>
    )
  }
}

/**
 * A SkillsMap displays the skills for a user.
 */
export default class SkillsMap extends React.Component {
  static propTypes = {
    toggleable: PropTypes.bool,                       // whether or not skills can be learned/forgotten
    expandable: PropTypes.bool,                       // whether or not nodes can be expanded to show children
    skills: PropTypes.object,                         // user's skills object from context
    skillPaths: PropTypes.arrayOf( PropTypes.string ) // which skill paths to show from the skills object
  }

  static defaultProps = {
    skillPaths: rootSkillPaths
  }

  render() {
    const { expandable, toggleable, skills, skillPaths, userCanManuallyClaimSkill, ownsProfile } = this.props

    if (!skills)
      return (
        <Message warning>
          This user does not yet have any Skills stored in our database. But I'm sure they are awesome anyway.
        </Message>
      )

    return (
      <div className='mgb-skillsmap-container'>
        {_.map( skillPaths, skillPath => (
          <SkillsMapNode
            key={skillPath}
            userCanManuallyClaimSkill={userCanManuallyClaimSkill}
            expandable={expandable}
            toggleable={toggleable}
            skills={skills}
            skillPath={skillPath}
            ownsProfile={ownsProfile}
          />
        ) )}
      </div>
    )
  }
}
