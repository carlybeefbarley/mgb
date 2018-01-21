import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOM from 'react-dom'

export default class Timeline extends React.Component {
  constructor(props) {
    super(props)
    // console.log(props)

    this.state = {}

    this.viewOffsetX = 0
  }

  componentDidMount() {
    this.timelineCanvas = ReactDOM.findDOMNode(this.refs.timeline)
    this.timelineCtx = this.timelineCanvas.getContext('2d')
    this.timelineDiv = ReactDOM.findDOMNode(this.refs.timelineDiv)
    this.setState({ viewWidth: this.timelineDiv.offsetWidth })
    this.draw()
  }

  componentDidUpdate(prevProps, prevState) {
    this.draw()
  }

  setViewOffset = viewOffset => {
    this.viewOffsetX = viewOffset * this.props.pxPerSecond
    this.draw()
  }

  draw = () => {
    this.timelineCtx.clearRect(0, 0, this.props.viewWidth, 50)
    if (!this.props.duration) return
    let count = Math.floor(this.props.duration) + 1
    this.timelineCtx.save()
    this.timelineCtx.strokeStyle = '#333'
    this.timelineCtx.globalAlpha = 0.4
    for (let i = 0; i < count; i++) {
      const x = i * this.props.pxPerSecond + 0.5 // 0.5 for 1px line instead of 2px
      const y = i % 5 == 0 ? 10 : 5
      this.timelineCtx.beginPath()
      this.timelineCtx.moveTo(x - this.viewOffsetX, 0)
      this.timelineCtx.lineTo(x - this.viewOffsetX, y)
      this.timelineCtx.stroke()
    }
    this.timelineCtx.restore()
  }

  render() {
    return (
      <div className="timeline" ref="timelineDiv">
        <canvas ref="timeline" width={this.props.viewWidth} height="50px" />
      </div>
    )
  }
}
