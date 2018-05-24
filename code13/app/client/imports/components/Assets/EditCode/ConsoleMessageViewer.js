import _ from 'lodash'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'
import React from 'react'
import moment from 'moment'

export default class ConsoleMessageViewer extends React.Component {
  state = {
    showConsole: false,
  }

  componentDidUpdate() {
    this.refs.msgContainer.scrollTop = this.refs.msgContainer.scrollHeight
  }

  cleanupMessage = argArray => {
    // Get rid of any %c modifiers, and remove the associated parameters. this is not robust, but works for the common case.
    var arg0 = argArray[0]
    if (typeof arg0 === 'string') {
      var noColor0 = arg0.replace(/%c/g, '')
      var removed = (arg0.length - noColor0.length) / 2
      var rest = argArray.slice(removed + 1)

      return (noColor0 + '  ' + rest.join(', ')).trim()
    } else return argArray.join(', ')
  }

  invokeGotoLinehandler = msg => {
    // TODO check if msg.url / show asset:line combo

    // msg.url is always reported with js extension due to babel bug stripping all extensions
    let filename = msg.file || msg.url
    if (filename.substring(filename.length - 3, filename.length) === '.js') {
      filename = filename.substring(0, filename.length - 3)
    }
    if (this.props.gotoLinehandler) this.props.gotoLinehandler(msg.line, filename)
  }

  handleOpenConsole = () => {
    this.setState({ showConsole: true })
  }

  handleToggleConsole = () => {
    this.setState({ showConsole: !this.state.showConsole })
  }

  smartRender = () => {
    if (!this.props.messages) return null

    let fmt = {
      log: { style: {}, icon: '' },
      debug: { style: {}, icon: '' },
      info: { style: { color: 'blue' }, icon: 'info ' },
      warn: { style: { color: 'orange' }, icon: 'warning ' },
      error: { style: { color: 'red' }, icon: 'x' },
      windowOnerror: { style: { color: 'red' }, icon: 'bug' },
    }

    return this.props.messages.map((msg, idx) => {
      let fn = msg.consoleFn
      let s = {
        whiteSpace: 'pre-wrap',
        marginTop: '2px',
        marginBottom: '0px',
        lineHeight: '12px',
        fontSize: '10px',
        ...fmt[fn].style,
      }
      let atLine = !msg.line ? null : (
        <span>
          {msg.url ? msg.url + ':' : ''}{' '}
          <a onClick={this.invokeGotoLinehandler.bind(this, msg)} style={{ cursor: 'pointer' }}>
            [line {msg.line}]{' '}
          </a>
        </span>
      )
      let icon = <i className={`ui ${fmt[fn].icon} icon`} />
      let time = moment(msg.timestamp).format('h:mm:ss a')
      return (
        <pre key={idx} style={s}>
          {time} {icon} {atLine}
          {this.cleanupMessage(msg.args)}
        </pre>
      )
    })
  }

  renderAccordion = (style, messages, clearConsoleHandler) => {
    return (
      <div>
        <div style={{ padding: 0 }} onClick={this.handleToggleConsole}>
          {this.state.showConsole ? (
            <Button compact fluid size="mini" icon="chevron down" />
          ) : (
            <Button compact fluid size="mini" icon="chevron up" />
          )}
        </div>
        <div style={this.state.showConsole ? { display: 'block' } : { display: 'none' }}>
          <div style={{ position: 'relative', ...style }}>
            <div className="header" style={{ position: 'absolute', top: 0, right: '1em', zIndex: 9 }}>
              {messages.length > 0 &&
              clearConsoleHandler && (
                <i
                  style={{ cursor: 'pointer' }}
                  className="ui ban outline icon"
                  title="clear console"
                  onClick={clearConsoleHandler}
                />
              )}
            </div>
            <div
              id="mgbjr-EditCode-console"
              className="ui secondary segment"
              style={{
                height: '100px',
                width: '100%',
                overflow: 'auto',
                margin: 0,
              }}
              ref="msgContainer"
            >
              <div className="message-container">{this.smartRender()}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { messages, clearConsoleHandler, style, isTutorialView } = this.props
    if (!messages) return null

    return isTutorialView ? (
      this.renderAccordion(style, messages, clearConsoleHandler)
    ) : (
      <div style={{ position: 'relative', ...style }}>
        <div className="header" style={{ position: 'absolute', top: 0, right: '1em', zIndex: 9 }}>
          {messages.length > 0 &&
          clearConsoleHandler && (
            <i
              style={{ cursor: 'pointer' }}
              className="ui ban outline icon"
              title="clear console"
              onClick={clearConsoleHandler}
            />
          )}
        </div>
        <div
          id="mgbjr-EditCode-console"
          className="ui secondary segment"
          style={{
            height: '100px',
            width: '100%',
            overflow: 'auto',
            margin: 0,
          }}
          ref="msgContainer"
        >
          <div className="message-container">{this.smartRender()}</div>
        </div>
      </div>
    )
  }
}

ConsoleMessageViewer.PropTypes = {
  messages: PropTypes.array, // of { mgbCmd: , data: }
  gotoLinehandler: PropTypes.func,
  clearConsoleHandler: PropTypes.func,
  isTutorialView: PropTypes.bool,
}
