import _ from 'lodash'
import React, { PropTypes } from 'react'
import moment from 'moment'

const ConsoleMessageViewer = React.createClass({
  propTypes: {
    messages: PropTypes.array, // of { mgbCmd: , data: }
    gotoLinehandler: PropTypes.func,
    clearConsoleHandler: PropTypes.func,
  },

  cleanupMessage(argArray) {
    // Get rid of any %c modifiers, and remove the associated parameters. this is not robust, but works for the common case.
    var arg0 = argArray[0]
    if (typeof arg0 === 'string') {
      var noColor0 = arg0.replace(/%c/g, '')
      var removed = (arg0.length - noColor0.length) / 2
      var rest = argArray.slice(removed + 1)

      return (noColor0 + '  ' + rest.join(', ')).trim()
    } else return argArray.join(', ')
  },

  invokeGotoLinehandler(msg) {
    // TODO check if msg.url / show asset:line combo
    if (this.props.gotoLinehandler) this.props.gotoLinehandler(msg.line, msg.file)
  },

  componentDidUpdate() {
    this.refs.msgContainer.scrollTop = this.refs.msgContainer.scrollHeight
  },
  smartRender() {
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
      }
      $.extend(s, fmt[fn].style)
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
  },

  render() {
    const { messages, clearConsoleHandler } = this.props
    if (!messages) return null

    return (
      <div
        id="mgbjr-EditCode-console"
        className="ui secondary segment"
        style={{
          // maxHeight: "200px",
          // overflow: "auto",
          height: '100%',
          margin: 0,
        }}
      >
        <div className="header">
          {messages.length > 0 &&
          clearConsoleHandler && (
            <i
              style={{ position: 'absolute', top: '0', right: '0' }}
              className="ui ban outline icon"
              title="clear console"
              onClick={clearConsoleHandler}
            />
          )}
        </div>
        <div
          className="message-container"
          ref="msgContainer"
          style={{
            overflow: 'auto',
            width: '100%',
            height: '100px',
          }}
        >
          {this.smartRender()}
        </div>
      </div>
    )
  },
})

export default ConsoleMessageViewer
