import React, { Component } from 'react'
import { Segment } from 'semantic-ui-react'

export default class Spinner extends Component {
  state = {
    hiddenInitially: true, // Used for delayed display
  }

  componentDidMount() {
    // Spinner will show after 400ms, so it flickers less in most cases
    this.spinnerTimeoutId = setTimeout(() => {
      this.setState({ hiddenInitially: false })
    }, 400)
  }

  componentWillUnmount() {
    if (this.spinnerTimeoutId) clearTimeout(this.spinnerTimeoutId)
  }

  render() {
    const hide = this.state.hiddenInitially
    return hide ? null : (
      <Segment basic className="animated fadeIn" style={{ minHeight: '15em' }}>
        <div className={`ui ${hide ? '' : 'active'} inverted dimmer`}>
          <div className="ui text indeterminate loader">{this.props.loadingMsg || 'Loading'}</div>
        </div>
        <p />
      </Segment>
    )
  }
}
