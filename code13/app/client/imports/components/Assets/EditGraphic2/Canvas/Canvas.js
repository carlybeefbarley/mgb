import React, { Component } from 'react'

/**
 * React friendly
 */
class Canvas extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    // updating destroys the canvas node
    return false
  }

  componentDidMount() {
    this.scaleForHiDPI()
  }

  /**
   * Scale the canvas to account for high DPI screens.
   * @see www.html5rocks.com/en/tutorials/canvas/hidpi
   */
  scaleForHiDPI = () => {
    const canvas = this.ref
    const ctx = canvas.getContext('2d')

    // query the various pixel ratios
    const devicePixelRatio = window.devicePixelRatio || 1
    const backingStoreRatio =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1

    this.dpiRatio = devicePixelRatio / backingStoreRatio

    // no scaling required, exit
    if (devicePixelRatio === backingStoreRatio) return

    // upscale the canvas if the two ratios don't match
    const { width, height } = canvas

    canvas.width = width * this.dpiRatio
    canvas.height = height * this.dpiRatio

    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'

    // now scale the ctx to counter the fact that we've manually scaled our canvas element
    ctx.scale(this.dpiRatio, this.dpiRatio)
  }

  handleRef = c => (this.ref = c)

  render() {
    return <canvas ref={this.handleRef} />
  }
}

export default Canvas
