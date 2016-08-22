import _ from 'lodash'
import React, { PropTypes } from 'react'


const _propTypes = {    // These are applied to the class at the bottom of this file
  context: PropTypes.string.isRequired    // Something that will match checks.contexts[] below
}

const checks = [
  {
    browserCheck: !window.OfflineAudioContext,
    contexts: [ "edit.sound", "edit.music" ],
    msg: "Audio generation, import and playback are not working correctly on Safari currently. "
  }
]

export default class BrowserCompat extends React.Component {

  constructor(props) {
    super(props)
  }


  testCheck(check)
  {
    const matchesContext = _.includes(check.contexts, this.props.context)
    return check.browserCheck && matchesContext
  }

  makeMessage(msg)
  {
    return (
      <div className="ui small floating negative icon message" style={{ margin: "1em" }}>
        <i className="warning sign icon"></i>
        <div className="content">
          <div className="header">
            {msg}
          </div>
          <p>For best results we recommend you use the <a href="https://www.google.com/chrome/">Google Chrome</a> browser.</p>
        </div>
      </div>
    )

  }

  render()
  {
    return (
      <div>
        { checks.map( 
            (c) => { 
              return this.testCheck(c) && this.makeMessage(c.msg)
            } 
          ) 
        }
      </div>
    )
  }
}

BrowserCompat.propTypes = _propTypes