import React, { PropTypes } from 'react'
import QLink from '../QLink'
import { Container } from 'semantic-ui-react'

const LoginLinks = props => {
  const { showLogin, showSignup, showForgot } = props
  const sty = { paddingBottom: '0.7em' }

  return (
    <Container fluid textAlign="right" style={{ marginTop: '1em' }}>
      {showLogin && (
        <div style={sty}>
          <QLink to="/login">
            Already have an account? <u>Log In</u>
          </QLink>
        </div>
      )}
      {showSignup && (
        <div style={sty}>
          <QLink to="/signup">
            Not a member yet? <u>Sign up now!</u>
          </QLink>
        </div>
      )}
      {showForgot && (
        <div style={sty}>
          <QLink to="/forgot-password">
            <u>Forgot password?</u>
          </QLink>
        </div>
      )}
    </Container>
  )
}

LoginLinks.propTypes = {
  showLogin: PropTypes.bool,
  showSignup: PropTypes.bool,
  showForgot: PropTypes.bool,
}

export default LoginLinks
