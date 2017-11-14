import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import autobind from 'react-autobind'
import { Segment, Icon, Label, Header, Popup } from 'semantic-ui-react'

// MapActorGameEngine NPC Dialog
// This will be used as a modal/popup, and is instantiated when the game needs it.

const _imgSty = { margin: 'auto 24px auto 24px' }

const actorImgSrc = (actor, loadedGraphics) =>
  actor ? loadedGraphics[actor.content2.databag.all.defaultGraphicName].thumbnail : null

class MageNpcDialogText extends React.Component {
  constructor(props) {
    super(props)
    this.state = { shownChars: 0 }
    this._rafId = null
    autobind(this)
  }

  componentDidMount() {
    this._rafId = requestAnimationFrame(this.showNextChar_loopWithRAF)
  }

  componentWillUnmount() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.message !== this.props.message) {
      this.setState({ shownChars: 0 })
      this._rafId = requestAnimationFrame(this.showNextChar_loopWithRAF)
    }
  }

  showNextChar_loopWithRAF() {
    const msg = this.props.message
    let { shownChars } = this.state
    if (shownChars < msg.length) {
      shownChars++
      // Double text speed; In the future, can make text speed an option the user can change
      if (shownChars + 1 <= msg.length) shownChars++

      this.setState({ shownChars })
      this._rafId = requestAnimationFrame(this.showNextChar_loopWithRAF)
    } else this._rafId = null
  }

  render() {
    const { message } = this.props

    return (
      <Header as="h4">
        <span>{message.slice(0, this.state.shownChars)}</span>
        <span style={{ opacity: 0.1 }}>{message.slice(this.state.shownChars)}</span>
      </Header>
    )
  }
}

const MageNpcDialog = ({ leftActor, message, choices, responseCallbackFn, graphics }) => (
  <Segment.Group horizontal>
    <img style={_imgSty} src={actorImgSrc(leftActor, graphics)} />
    <Segment>
      <MageNpcDialogText message={message} />
      {_.map(
        choices,
        (choice, idx) =>
          choice && (
            <div key={idx}>
              <Label onClick={() => responseCallbackFn(idx + 1)}>{choice}</Label>
            </div>
          ),
      )}
    </Segment>
    <Popup
      trigger={<Icon name="remove" className="right floated" onClick={() => responseCallbackFn(0)} />}
      content="Click here or press CTRL to close dialog"
    />
  </Segment.Group>
)

MageNpcDialog.propTypes = {
  message: PropTypes.string,
  choices: PropTypes.array,
  responseCallbackFn: PropTypes.func,
  leftActor: PropTypes.object,
  graphics: PropTypes.object,
}

export default MageNpcDialog
