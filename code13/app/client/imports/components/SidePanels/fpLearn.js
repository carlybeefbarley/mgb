import PropTypes from 'prop-types'
import React from 'react'
import { Button, Divider } from 'semantic-ui-react'

import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import { withStores } from '/client/imports/hocs'
import { joyrideStore } from '/client/imports/stores'
import { StartDefaultNextTutorial } from '/client/imports/components/Learn'
import UX from '/client/imports/UX'

class fpLearn extends React.Component {
  static propTypes = {
    currUser: PropTypes.object, // Currently Logged in user. Can be null/undefined
    panelWidth: PropTypes.string.isRequired, // Typically something like "200px".
  }

  static contextTypes = {
    skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
  }

  renderSkills = () => {
    const { isSuperAdmin } = this.props
    const { skills } = this.context

    return (
      <div>
        <SkillsMap isSuperAdmin={isSuperAdmin} expandable labeled skills={skills} />
        <Divider hidden fitted />
      </div>
    )
  }

  renderActions = () => {
    const { currUser, joyride } = this.props
    const { skills } = this.context

    if (!currUser) return null

    return (
      <div>
        {joyride.state.isRunning ? (
          <Button fluid color="yellow" content="Stop tutorial" icon="stop" onClick={joyride.stop} />
        ) : (
          <StartDefaultNextTutorial currUser={currUser} userSkills={skills} />
        )}
        <Divider hidden />
      </div>
    )
  }

  renderMascot = () => {
    const style = {
      overflow: 'hidden',
    }

    const mascotSrc = UX.makeMascotImgLink('bigguy')
    const mascotStyle = {
      float: 'left',
      width: '30%',
      background: 'radial-gradient(50% 3% at 50% 97%, rgba(0, 0, 0, 0.5), transparent)',
    }

    const commentBubbleStyle = {
      position: 'relative',
      padding: '0.5em',
      background: '#fff',
      float: 'right',
      width: '70%',
      border: 'none',
    }

    return (
      <div style={style}>
        <img src={mascotSrc} style={mascotStyle} />
        <div style={commentBubbleStyle}>
          <p>This is your learning progress. Let's start learning your next skill!</p>
        </div>
        <Divider hidden clearing />
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderMascot()}
        {this.renderActions()}
        {this.renderSkills()}
      </div>
    )
  }
}

export default withStores({ joyride: joyrideStore })(fpLearn)
