import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Header, Icon } from 'semantic-ui-react'

import { JoyrideDisplay } from '/client/imports/components/Joyride'
import refreshBadgeStatus from '/client/imports/helpers/refreshBadgeStatus'
import { withStores } from '/client/imports/hocs'
import { showToast } from '/client/imports/modules'
import { joyrideStore } from '/client/imports/stores'
import { getFriendlyName, getFriendlyNames } from '/imports/Skills/SkillNodes/SkillNodes'
import { hasSkill, learnSkill } from '/imports/schemas/skills'
import ToolWindow from '../ToolWindow/ToolWindow'

class JoyrideRootHelper extends Component {
  static propTypes = {
    currUser: PropTypes.object,
  }

  static contextTypes = {
    /** skills for current user */
    skills: PropTypes.object,
  }

  state = {}

  componentDidMount() {
    const { joyrideStore } = this.props
    this.onFinishDisposer = joyrideStore.on('finish', this.handleFinish)
    this.computeStyle()
  }

  componentWillUnmount() {
    this.onFinishDisposer()
    this.stopPointing()
  }

  componentDidUpdate(prevProps, prevState) {
    const { joyrideStore } = this.props

    // scroll new out of view selectors into view
    const currSelector = _.get(joyrideStore.state.step, 'selector')

    if (currSelector && !_.isEqual(currSelector, _.get(prevProps.joyrideStore.state.step, 'selector'))) {
      // this.$pointerTarget = document.querySelector(joyrideStore.state.step.selector)
      if (!this.$pointerTarget) return

      this.$pointerTarget.scrollIntoView({ behavior: 'smooth' })
    }

    // handle start
    if (!prevProps.joyrideStore.state.isRunning && joyrideStore.state.isRunning) {
      this.startPointing()
    } else if (prevProps.joyrideStore.state.isRunning && !joyrideStore.state.isRunning) {
      this.stopPointing()
    }
  }

  handleFinish = () => {
    const { skills } = this.context
    const { joyrideStore: { state: { skillPathTutorial, skipped } } } = this.props

    // console.log('Finished tutorial:', skillPathTutorial)

    if (!skillPathTutorial || skipped) return

    // console.log('Completed a Skill Tutorial: ', skillPathTutorial)
    if (!hasSkill(skills, skillPathTutorial)) {
      showToast(
        <span>
          You just gained the <Icon name="plus circle" />
          {getFriendlyName(skillPathTutorial)} skill.
        </span>,
        { title: 'Congrats!' },
      )
      learnSkill(skillPathTutorial)

      // because we don't want award badge now, but wait for next tutorial
      if (skillPathTutorial !== 'getStarted.profile.avatar') {
        refreshBadgeStatus()
      }
    }
  }

  handleToolWindowMinimize = () => this.setState(() => ({ isToolWindowMinimized: true }))

  handleToolWindowMaximize = () => this.setState(() => ({ isToolWindowMinimized: false }))

  handleToolWindowClose = () => {
    const { joyrideStore } = this.props

    // This close handler gets called multiple times.
    // Ensure we only stop the tutorial once, if it is running.
    // SUIR bug, see:
    // https://github.com/Semantic-Org/Semantic-UI-React/issues/2423
    if (!joyrideStore.state.isRunning) return
    this.setState({ isClosing: true })
  }

  handleToolWindowHide = () => {
    this.setState({ isClosing: false })
  }

  startPointing = () => {
    this.$pointer = document.createElement('div')
    this.$pointer.style.position = 'fixed'
    this.$pointer.style.top = 0
    this.$pointer.style.left = 0
    this.$pointer.style.width = window.innerWidth
    this.$pointer.style.height = window.innerHeight
    this.$pointer.style.opacity = 0
    this.$pointer.style.pointerEvents = 'none'
    this.$pointer.style.transition = ['opacity', 'top', 'left', 'width', 'height']
      .map(key => `${key} 0.5s cubic-bezier(0.3, 1, 0.7, 1)`)
      .join(', ')

    document.body.appendChild(this.$pointer)

    const updatePointer = () => {
      const { joyrideStore } = this.props

      // stop the loop on tutorial stop
      if (!joyrideStore.state.isRunning) return

      this.$prevPointerSelectors = _.get(joyrideStore.state.step, 'selector')

      if (this.$prevPointerSelectors) {
        this.$prevPointerSelectors
          .split(',')
          .reverse()
          .forEach(selector => {
            const target = document.querySelector(selector)
            const isTargetVisible =
              target &&
              (target === document.body || target.offsetParent !== null || target.style.position === 'fixed')
            const isTargetNew = target !== this.$prevPointerTarget

            if (isTargetVisible && isTargetNew) {
              this.$pointerSelector = selector
              this.$pointerTarget = target
              this.$prevPointerTarget = target
            }
          })
      }

      if (this.$pointerTarget) {
        const rect = this.$pointerTarget.getBoundingClientRect()
        const isVisible = joyrideStore.state.isRunning && this.$pointerSelector !== 'body'

        this.$pointer.style.top = Math.round(rect.top - 4) + 'px'
        this.$pointer.style.left = Math.round(rect.left - 4) + 'px'
        this.$pointer.style.width = Math.round(rect.width + 8) + 'px'
        this.$pointer.style.height = Math.round(rect.height + 8) + 'px'
        this.$pointer.style.opacity = isVisible ? 1 : 0
      }

      if (this.$pointerTarget !== document.body && _.has(joyrideStore.state.step, 'awaitCompletionTag')) {
        this.$pointer.style.animation = 'mgbTutorialPointer 1.5s infinite'
        this.$pointer.style.borderStyle = 'dashed'
      } else {
        this.$pointer.style.animation = ''
        this.$pointer.style.background = 'rgba(251, 189, 8, 0.05)'
        this.$pointer.style.border = '4px solid rgb(251, 189, 8)'
      }

      requestAnimationFrame(updatePointer)
    }

    updatePointer()
  }

  stopPointing = () => {
    this.$pointerSelector = null
    this.$pointerTarget = null
    this.$prevPointerSelectors = null
    this.$prevPointerTarget = null
    document.body.removeChild(this.$pointer)
  }

  computeStyle = () => {
    const style = {
      boxShadow: '0 0.5em 2em rgba(0, 0, 0, 0.35)',
      zIndex: 999999,
    }

    const $this = document.querySelector('#mgb-learn-toolwindow')

    // move the tool window if it overlapping the pointer target
    // don't move it for overlapping the body, when the body is the selector
    if (this.$pointerTarget && this.$pointerTarget !== document.body) {
      const { top, bottom, left, right, width, height } = $this.getBoundingClientRect()
      const {
        top: pointerTop,
        bottom: pointerBottom,
        left: pointerLeft,
        right: pointerRight,
      } = this.$pointerTarget.getBoundingClientRect()

      const intersectsVertically = top < pointerBottom && top + height >= pointerTop
      const intersectsHorizontally = left <= pointerRight && left + width >= pointerLeft
      const intersects = intersectsVertically && intersectsHorizontally

      if (intersects) {
        const margin = 10
        const { moveStyle } = [
          // move down
          {
            distance: pointerBottom - top - margin,
            moveStyle: {
              top: pointerBottom + margin,
              transition: 'top 0.5s cubic-bezier(0.3, 1, 0.7, 1)',
            },
            isInsideWindow: pointerBottom + height + margin < window.innerHeight,
          },
          // move up
          {
            distance: bottom - pointerTop,
            moveStyle: {
              top: pointerTop - height - margin,
              transition: 'top 0.5s cubic-bezier(0.3, 1, 0.7, 1)',
            },
            isInsideWindow: pointerTop - height - margin > 0,
          },
          // move right
          {
            distance: pointerRight - left - margin,
            moveStyle: {
              left: pointerRight + margin,
              transition: 'left 0.5s cubic-bezier(0.3, 1, 0.7, 1)',
            },
            isInsideWindow: pointerRight + width + margin < window.innerWidth,
          },
          // move left
          {
            distance: right - pointerLeft,
            moveStyle: {
              left: pointerLeft - width - margin,
              transition: 'left 0.5s cubic-bezier(0.3, 1, 0.7, 1)',
            },
            isInsideWindow: pointerLeft - width - margin > 0,
          },
        ]
          .filter(x => x.isInsideWindow)
          .reduce((acc, next) => (acc.distance < next.distance ? acc : next), { distance: Infinity })

        Object.assign(style, moveStyle)
      }
    }

    this.setState({ style })
    setTimeout(this.computeStyle, 500)
  }

  handleCloseCancel = () => this.setState({ isClosing: false })

  handleCloseConfirm = () => joyrideStore.stop()

  render() {
    const { currUser, joyrideStore } = this.props
    const { isClosing, isToolWindowMinimized, style } = this.state
    const [section, heading, title] = getFriendlyNames(joyrideStore.state.skillPathTutorial)

    return (
      <ToolWindow
        id="mgb-learn-toolwindow"
        open={joyrideStore.state.isRunning}
        icon="student"
        color="yellow"
        title={title}
        style={style}
        size="large"
        minimized={isToolWindowMinimized}
        onClose={this.handleToolWindowClose}
        onHide={this.handleToolWindowHide}
        onMaximize={this.handleToolWindowMaximize}
        onMinimize={this.handleToolWindowMinimize}
      >
        {isClosing ? (
          <div>
            <Header>Are you sure you want to quit?</Header>
            <p style={{ textAlign: 'right' }}>
              <Button basic content="Never mind" onClick={this.handleCloseCancel} />
              <Button negative content="Yes, quit" onClick={this.handleCloseConfirm} />
            </p>
          </div>
        ) : (
          <JoyrideDisplay currUser={currUser} />
        )}
      </ToolWindow>
    )
  }
}

export default withStores({ joyrideStore })(JoyrideRootHelper)
