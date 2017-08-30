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
    window.particlesJS('particles-js', particlesConfig)
  }

  render() {
    const { heroContent, mainContent } = this.props
    return (
      <div style={style}>
        <div className="hero">
          <div id="particles-js" style={particlesStyle} />
          <Container>{heroContent}</Container>
        </div>
        {mainContent}
        <Footer />
      </div>
    )
  }
}

export default HeroLayout
