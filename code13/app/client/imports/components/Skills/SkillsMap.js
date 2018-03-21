import './SkillsMap.less'
import _ from 'lodash'
import cx from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Message, Popup } from 'semantic-ui-react'

import * as skillsModel from '/imports/Skills/SkillNodes/SkillNodes'
import * as skillsSchema from '/imports/schemas/skills'

// [[THIS FILE IS PART OF AND MUST OBEY THE SKILLS_MODEL_TRIFECTA constraints as described in SkillNodes.js]]

const rootSkillPaths = [
  'getStarted',
  'code',
  'art',
  // 'design',
  // 'audio',
  // 'analytics',
  // 'writing',
  // 'marketing',
  // 'community',
  // 'legal',
  // 'business',
]

/**
 * An individual SkillsMapNode for use inside of the SkillsMap
 */
class SkillsMapNode extends React.Component {
  static propTypes = {
    expandable: PropTypes.bool, // whether or not nodes can be expanded to show children
    isSuperAdmin: PropTypes.bool.isRequired,
    labeled: PropTypes.bool, // whether or not the skill node friendly name is shown within the progress bar
    skills: PropTypes.object, // user's skills object from context
    skillPath: PropTypes.string, // the skill path within skills that this node should show
  }

  state = {
    isExpanded: false,
  }

  isToggleable = () => {
    const { isSuperAdmin } = this.props

    return isSuperAdmin === true
  }

  toggleExpand = () => {
    const { expandable } = this.props
    if (!expandable) return

    this.setState({ isExpanded: !this.state.isExpanded })
  }

  handleClick = skillPath => e => {
    if (!this.isToggleable()) return

    const { skills } = this.props

    skillsSchema.toggleSkill(skills, skillPath)
  }

  renderChildLeaves = childLeaves => {
    if (_.isEmpty(childLeaves)) return null

    const { skills } = this.props

    return (
      <div className="leaves">
        {_.map(childLeaves, skillPath => {
          const hasSkill = skillsSchema.hasSkill(skills, skillPath)
          const iconProps = hasSkill ? { name: 'checkmark', color: 'green' } : { name: 'square outline' }
          const classes = cx(hasSkill && 'active', 'leaf')

          const skillElement = (
            <div key={skillPath} className={classes} onClick={this.handleClick(skillPath)}>
              <Icon {...iconProps} />
              {skillsModel.getFriendlyName(skillPath)}
            </div>
          )

          if (this.isToggleable()) {
            return (
              <Popup
                key={skillPath}
                trigger={skillElement}
                content="Super Admin: Click to toggle"
                inverted
                size="mini"
                position="bottom left"
                mouseEnterDelay={800}
              />
            )
          }

          return skillElement
        })}
      </div>
    )
  }

  renderChildTree = skillPath => {
    const { expandable, isSuperAdmin, labeled, skills } = this.props
    return (
      <SkillsMapNode
        key={skillPath}
        expandable={expandable}
        isSuperAdmin={isSuperAdmin}
        labeled={labeled}
        skills={skills}
        skillPath={skillPath}
      />
    )
  }

  render() {
    const { expandable, labeled, skills, skillPath } = this.props
    const { isExpanded } = this.state

    const skillPathRoot = _.head(_.split(skillPath, '.'))

    const childPaths = skillsModel.getChildPaths(skillPath)
    const [childLeaves, childTrees] = _.partition(childPaths, skillsModel.isLeafPath)

    const totalSkills = skillsModel.countMaxUserSkills(skillPath)
    const completedSkills = skillsSchema.countCurrentUserSkills(skills, skillPath)

    const classes = cx(
      'mgb-skillmap',
      _.kebabCase(skillPathRoot),
      isExpanded && 'active',
      expandable && 'expandable',
      this.isToggleable() && 'toggleable',
    )

    return (
      <div className={classes}>
        <div className="progress" onClick={this.toggleExpand}>
          {labeled && (
            <div className="label">
              <Icon name={isExpanded ? 'minus' : 'plus'} size="small" />
              {skillsModel.getFriendlyName(skillPath)}
            </div>
          )}
          <div className="cells">
            {_.times(totalSkills, i => (
              <div key={i} className={[completedSkills > i ? 'active' : '', 'cell'].join(' ')} />
            ))}
          </div>
        </div>
        {isExpanded && (
          <div className="content">
            {this.renderChildLeaves(childLeaves)}
            {!_.isEmpty(childTrees) && childTrees.map(this.renderChildTree)}
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
    expandable: PropTypes.bool, // whether or not nodes can be expanded to show children
    isSuperAdmin: PropTypes.bool.isRequired,
    labeled: PropTypes.bool, // whether or not the skill node friendly name is shown within the progress bar
    skills: PropTypes.object, // user's skills object from context
    skillPaths: PropTypes.arrayOf(PropTypes.string), // which skill paths to show from the skills object
  }

  static defaultProps = {
    skillPaths: rootSkillPaths,
    expandable: false,
    labeled: false,
  }

  render() {
    const { expandable, isSuperAdmin, labeled, skills, skillPaths } = this.props

    if (!skills)
      return (
        <Message warning>
          This user does not yet have any Skills stored in our database. But I'm sure they are awesome anyway.
        </Message>
      )

    return (
      <div className="mgb-skillsmap-container">
        {_.map(skillPaths, skillPath => (
          <SkillsMapNode
            key={skillPath}
            expandable={expandable}
            isSuperAdmin={isSuperAdmin}
            labeled={labeled}
            skills={skills}
            skillPath={skillPath}
          />
        ))}
      </div>
    )
  }
}
