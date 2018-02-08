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
    /** Whether or not the ToolWindow can be closed */
    closable: PropTypes.bool,
    contentStyle: PropTypes.object,
    draggable: PropTypes.bool,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.element]),
    onClose: PropTypes.func,
    onHide: PropTypes.func,
    onMinimize: PropTypes.func,
    onTitleBarClick: PropTypes.func,
    onMaximize: PropTypes.func,
    onOpen: PropTypes.func,
    size: PropTypes.oneOf(['massive', 'huge', 'big', 'large', 'small', 'tiny', 'mini']),
    title: PropTypes.string,
    titleBarStyle: PropTypes.object,
  }

  static defaultProps = {
    animation: 'fade up',
    color: 'grey',
    draggable: true,
    closable: true,
  }

  state = {
    xPos: 0,
    yPos: 0,
  }

  componentWillReceiveProps(nextProps) {
    const { draggable } = this.props
    if (draggable) {
      // if our position is updated, persist it
      const xPos = _.get(nextProps, 'style.left', this.state.xPos)
      const yPos = _.get(nextProps, 'style.top', this.state.yPos)

      this.setState({ xPos, yPos })
    }

    if (nextProps.minimized !== undefined) {
      this.setState({ minimized: nextProps.minimized })
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleDocumentMouseMove)
    document.removeEventListener('mouseup', this.handleDocumentMouseUp)
  }

  handleClose = e => {
    const { onClose } = this.props

    if (onClose) return onClose(e, this.props)

    this.stopEvent(e)
  }

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

  handleMinimize = () => {
    _.invoke(this.props, 'onMinimize')

    this.setState(prevState => {
      const { minimized } = this.props
      return { minimized: minimized === undefined ? true : minimized }
    })
  }

  handleMaximize = () => {
    _.invoke(this.props, 'onMaximize')

    this.setState(prevState => {
      const { minimized } = this.props
      return { minimized: minimized === undefined ? false : minimized }
    })
  }

  handleOpen = e => _.invoke(this.props, 'onOpen', e, this.props)

  getClientXY = e => _.pick(_.get(e, 'touches[0]', e), ['clientX', 'clientY'])

  handleRef = c => (this.ref = c)

  stopEvent = e => {
    e.nativeEvent.stopImmediatePropagation()
    e.stopPropagation()
  }

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
    const { draggable } = this.props
    this.handleMaximize(e)

    if (draggable) {
      // center the portal after mount
      window.setTimeout(this.moveToScreenCenter, 1)
    }
  }

  moveToScreenCenter = () => {
    const { width } = this.ref.getBoundingClientRect()

    this.setState({
      xPos: window.innerWidth * 0.5 - width * 0.5,
      yPos: window.innerHeight * 0.25,
    })
  }

  toggleMinimize = e => {
    const { minimized } = this.state

    if (minimized) this.handleMaximize(e)
    else this.handleMinimize(e)
  }

  renderContent = () => {
    const { children, size, contentStyle } = this.props
    const { minimized } = this.state

    const style = {
      flex: '1',
      margin: 0,
      maxHeight: '30em',
      overflow: 'auto',
      ...contentStyle,
    }

    if (minimized) {
      Object.assign(style, {
        display: 'none',
      })
    }

    return (
      <Segment size={size} style={style}>
        {children}
      </Segment>
    )
  }

  renderTitleBar = () => {
    const { closable, color, icon, draggable, onTitleBarClick, size, title, titleBarStyle } = this.props
    const { minimized } = this.state
    const style = {
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      padding: '0.25em 0.5em',
      margin: 0,
      border: '1px solid transparent',
    }

    const titleStyle = {
      flex: 1,
      textAlign: 'left',
      lineHeight: 1,
      height: '1em',
      userSelect: 'none',
    }

    const props = {
      inverted: true,
      color,
      textAlign: 'right',
      size,
      onClick: onTitleBarClick,
      onDoubleClick: this.toggleMinimize,
    }

    if (draggable) {
      Object.assign(props, {
        onTouchStart: this.handleDragStart,
        onMouseDown: this.handleDragStart,
        title: 'Drag to move',
      })
      Object.assign(style, {
        cursor: 'move',
      })
    }

    return (
      <Segment {...props} style={{ ...style, ...titleBarStyle }}>
        <div style={titleStyle}>
          {Icon.create(icon)} {title}
        </div>
        <Button
          compact
          color={color}
          title={minimized ? 'Maximize' : 'Minimize'}
          size="small"
          icon={minimized ? 'window maximize' : 'window minimize'}
          onClick={this.toggleMinimize}
        />
        {closable && (
          <Button
            compact
            color={color}
            title="Close"
            size="small"
            icon="window close"
            onClick={this.handleClose}
          />
        )}
      </Segment>
    )
  }

  render() {
    const { animation, id, draggable, open, style: usersStyle } = this.props
    const { minimized, xPos, yPos } = this.state

    let ElementType = 'div'

    const style = {
      width: '25em',
      boxShadow: '0 0 0.25em rgba(0, 0, 0, 0.25)',
    }

    const props = {
      transition: { animation },
      onHide: this.handleHide,
    }

    if (draggable) {
      ElementType = TransitionablePortal

      Object.assign(style, {
        position: 'fixed',
        top: `${yPos}px`,
        left: `${xPos}px`,
        boxShadow: '0 0.125em 0.5em rgba(0, 0, 0, 0.25)',
      })

      Object.assign(props, {
        open,
        onOpen: this.handleOpen,
        onClose: this.handleClose,
        onMount: this.handleMount,
        closeOnDocumentClick: false,
        closeOnRootNodeClick: false,
      })
    }

    return (
      <ElementType {...props}>
        <div id={id} style={{ ...style, ...usersStyle }} ref={this.handleRef}>
          {this.renderTitleBar()}
          {this.renderContent()}
        </div>
      </ElementType>
    )
  }
}

export default ToolWindow
