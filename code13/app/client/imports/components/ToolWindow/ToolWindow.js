import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button, Icon, Segment, TransitionablePortal } from 'semantic-ui-react'

class ToolWindow extends Component {
  static propTypes = {
    id: PropTypes.string,
    /** The SUIR Transition animation name */
    animation: PropTypes.string,
    /** The SUIR Segment color of the title */
    color: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.element]),
    onClose: PropTypes.func,
    onHide: PropTypes.func,
    onMinimize: PropTypes.func,
    onMaximize: PropTypes.func,
    onOpen: PropTypes.func,
    size: PropTypes.oneOf(['massive', 'huge', 'big', 'large', 'small', 'tiny', 'mini']),
    title: PropTypes.string,
  }

  static defaultProps = {
    animation: 'fade up',
    color: 'grey',
  }

  state = {
    xPos: 0,
    yPos: 0,
  }

  componentWillReceiveProps(nextProps) {
    // if our position is updated, persist it
    const xPos = _.get(nextProps, 'style.left', this.state.xPos)
    const yPos = _.get(nextProps, 'style.top', this.state.yPos)

    this.setState({ xPos, yPos })
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleDocumentMouseMove)
    document.removeEventListener('mouseup', this.handleDocumentMouseUp)
  }

  handleClose = e => _.invoke(this.props, 'onClose', e, this.props)

  handleDocumentMouseUp = () => document.removeEventListener('mousemove', this.handleDocumentMouseMove)

  handleDocumentMouseMove = e => {
    if (this.isRAFInProgress) return

    this.isRAFInProgress = true

    e.preventDefault()
    const { clientX, clientY } = this.getClientXY(e)

    window.requestAnimationFrame(() => {
      this.updatePosition({ clientX, clientY })
    })
  }

  handleDragStart = e => {
    const { clientX, clientY } = this.getClientXY(e)
    const { top, left } = this.ref.getBoundingClientRect()

    this.offsetX = clientX - left
    this.offsetY = clientY - top

    document.addEventListener('mousemove', this.handleDocumentMouseMove)
    document.addEventListener('mouseup', this.handleDocumentMouseUp)
  }

  handleHide = e => _.invoke(this.props, 'onHide', e, this.props)

  handleMinimize = () => _.invoke(this.props, 'onMinimize')

  handleMaximize = () => _.invoke(this.props, 'onMaximize')

  handleOpen = e => _.invoke(this.props, 'onOpen', e, this.props)

  getClientXY = e => _.pick(_.get(e, 'touches[0]', e), ['clientX', 'clientY'])

  handleRef = c => (this.ref = c)

  stopEvent = e => e.stopPropagation()

  updatePosition = ({ clientX, clientY }) => {
    this.setState(
      prevState => ({
        xPos: clientX - this.offsetX,
        yPos: clientY - this.offsetY,
      }),
      () => {
        this.isRAFInProgress = false
      },
    )
  }

  handleMount = e => {
    this.handleMaximize(e)

    // center the portal after mount
    window.setTimeout(() => {
      console.log('handleMount')
      const { width } = this.ref.getBoundingClientRect()

      this.setState({
        xPos: window.innerWidth * 0.5 - width * 0.5,
        yPos: window.innerHeight * 0.25,
      })
    }, 1)
  }

  toggleMinimize = e => {
    const { minimized } = this.props

    if (minimized) this.handleMaximize(e)
    else this.handleMinimize(e)
  }

  renderContent = () => {
    const { children, size } = this.props

    const style = {
      maxHeight: '30em',
      overflow: 'auto',
    }

    return (
      <Segment attached="bottom" size={size} style={style}>
        {children}
      </Segment>
    )
  }

  renderTitleBar = () => {
    const { color, icon, minimized, size, title } = this.props
    const style = {
      display: 'flex',
      alignItems: 'center',
      padding: '0.25em 0.5em',
      border: '1px solid transparent',
      cursor: 'move',
    }

    const titleStyle = {
      flex: 1,
      textAlign: 'left',
      lineHeight: 1,
      height: '1em',
      userSelect: 'none',
    }

    return (
      <Segment
        inverted
        color={color}
        attached={minimized ? false : 'top'}
        textAlign="right"
        size={size}
        style={style}
        title="Drag to move"
        onTouchStart={this.handleDragStart}
        onMouseDown={this.handleDragStart}
        onDoubleClick={this.toggleMinimize}
      >
        <div style={titleStyle}>
          {Icon.create(icon)} {title}
        </div>
        <Button
          compact
          color={color}
          title={minimized ? 'Maximize' : 'Minimize'}
          size="small"
          icon={minimized ? 'window maximize' : 'window minimize'}
          onMouseDown={this.stopEvent}
          onClick={this.toggleMinimize}
        />
        <Button
          compact
          color={color}
          title="Close"
          size="small"
          icon="window close"
          onMouseDown={this.stopEvent}
          onClick={this.handleClose}
        />
      </Segment>
    )
  }

  render() {
    const { animation, id, minimized, open, style } = this.props
    const { xPos, yPos } = this.state

    const mergedStyle = {
      position: 'fixed',
      top: `${yPos}px`,
      left: `${xPos}px`,
      width: '25em',
      boxShadow: '0 0.125em 0.5em rgba(0, 0, 0, 0.25)',
      ...style,
    }

    return (
      <TransitionablePortal
        transition={{ animation }}
        open={open}
        onOpen={this.handleOpen}
        onClose={this.handleClose}
        onHide={this.handleHide}
        onMount={this.handleMount}
        closeOnDocumentClick={false}
        closeOnRootNodeClick={false}
      >
        <div id={id} style={mergedStyle} ref={this.handleRef}>
          {this.renderTitleBar()}
          {!minimized && this.renderContent()}
        </div>
      </TransitionablePortal>
    )
  }
}

export default ToolWindow
