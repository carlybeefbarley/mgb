import 'particles.js'
import PropTypes from 'prop-types'
import React from 'react'
import { Container } from 'semantic-ui-react'
import particlesConfig from '/client/imports/particlesjs-config'

import Footer from '/client/imports/components/Footer/Footer'

const style = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflowY: 'auto',
}
const particlesStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
}

class HeroLayout extends React.Component {
  static propTypes = {
    heroContent: PropTypes.node,
    mainContent: PropTypes.node,
  }

  componentDidMount() {
    window.particlesJS('particlesContainer', particlesConfig)
    this.container = document.querySelector('#particlesContainer')
    this.handleParticleResize()
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this.frame)
  }

  // Particles need to resize when the container resizes, but they only listen to document resize.
  // Detect particleContainer resizes and dispatch window resize events to trigger particle resize.
  // ...yucky, but required
  handleParticleResize = () => {
    const { offsetWidth, offsetHeight } = this.container
    const didWidthChange = offsetWidth !== this.prevContainerWidth
    const didHeightChange = offsetHeight !== this.prevContainerHeight

    if (didWidthChange || didHeightChange) {
      this.prevContainerWidth = offsetWidth
      this.prevContainerHeight = offsetHeight

      window.dispatchEvent(new Event('resize'))
    }

    this.frame = window.requestAnimationFrame(this.handleParticleResize)
  }

  render() {
    const { heroContent, mainContent } = this.props
    return (
      <div style={style}>
        <div className="hero">
          <div id="particlesContainer" style={particlesStyle} />
          <Container>{heroContent}</Container>
        </div>
        {mainContent}
        <Footer />
      </div>
    )
  }
}

export default HeroLayout
