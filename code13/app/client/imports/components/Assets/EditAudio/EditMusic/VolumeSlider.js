import PropTypes from 'prop-types'
import React from 'react'

export default class VolumeSlider extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      volume: this.props.volume,
    }

    this.lastUpdate = 0
  }

  componentDidUpdate(prevProps, prevState) {
    // volume changed from parent component - for example undo/redo
    if (this.props.volume != prevProps.volume) {
      this.setState({ volume: this.props.volume })
    }
  }

  changeVolume = e => {
    this.setState({ volume: parseFloat(e.target.value) })
    this.lastUpdate = Date.now()

    setTimeout(() => {
      if (Date.now() - this.lastUpdate > 500) {
        this.props.changeVolume(this.state.volume)
      }
    }, 550)
  }

  render() {
    return (
      <div>
        <input
          type="range"
          value={this.state.volume}
          min="0"
          max="1"
          step="0.05"
          onChange={this.changeVolume.bind(this)}
        />{' '}
        Volume
        <br />
      </div>
    )
  }
}
