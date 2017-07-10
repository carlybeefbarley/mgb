import _ from 'lodash'
import React, { PropTypes } from 'react'

const _propTypes = {
  // These are applied to the class at the bottom of this file
  context: PropTypes.string.isRequired, // Something that will match checks.contexts[] below
}

const checks = [
  // This one looks ok now!
  // {
  //   browserCheck: !window.OfflineAudioContext,
  //   contexts: [ "edit.sound", "edit.music" ],
  //   msg: "Audio generation, import and playback are not working correctly on Safari currently. "
  // }
  // {
  //   browserCheck: !window.OfflineAudioContext,
  //   contexts: [ "edit.sound", "edit.music" ],
  //   msg: "Audio generation, import and playback are not working correctly on Safari currently. "
  // }
]

// Detect IE (not Edge)
export function detectIE() {
  var ua = window.navigator.userAgent

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf('MSIE ')
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
  }

  var trident = ua.indexOf('Trident/')
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:')
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
  }

  // var edge = ua.indexOf('Edge/')
  // if (edge > 0) {
  //   // Edge (IE 12+) => return version number
  //   return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10)
  // }

  // other browser
  return false
}

export default class BrowserCompat extends React.Component {
  constructor(props) {
    super(props)
  }

  testCheck(check) {
    const matchesContext = _.includes(check.contexts, this.props.context)
    return check.browserCheck && matchesContext
  }

  makeMessage(msg) {
    return (
      <div className="ui small floating negative icon message" style={{ margin: '1em' }}>
        <i className="warning sign icon" />
        <div className="content">
          <div className="header">
            {msg}
          </div>
          <p>
            For best results we recommend you use the{' '}
            <a href="https://www.google.com/chrome/">Google Chrome</a> browser.
          </p>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div>
        {checks.map(c => {
          return this.testCheck(c) && this.makeMessage(c.msg)
        })}
      </div>
    )
  }
}

BrowserCompat.propTypes = _propTypes
