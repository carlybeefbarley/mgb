import _ from 'lodash'
import axios from 'axios'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Container, Segment, Header, Grid, Icon, Button } from 'semantic-ui-react'
import StripeCheckout from 'react-stripe-checkout'
import { utilPushTo } from '/client/imports/routes/QLink'
import validate from '/imports/schemas/validate'
import HeroLayout from '/client/imports/layouts/HeroLayout'

const stripePublishableKey = 'pk_test_xQOfmCv11AbxIS3J1RABJNNP'
const stripePrivateKey = 'sk_test_cjJteocKfQaZ4WOU8Hq3ad5w' // DO NOT COMMIT FOR DEPLOYMENT

class PaymentRoute extends Component {
  constructor() {
    super()
    this.stripe
  }

  static contextTypes = {
    urlLocation: PropTypes.object,
  }

  handleToken = token => async dispatch => {
    const res = await axios.post('/api/stripe', token)

    dispatch({ payload: res.data })
  }

  render() {
    const { currUser } = this.props

    return (
      <HeroLayout
        heroContent={
          <Container>
            <Header as="h2" inverted content="Payment" />
            <Segment centered stacked>
              <Button size="huge" primary disabled>
                <Icon name="cc paypal" />
                Pay with Paypal
              </Button>
              <StripeCheckout
                ref={this.stripe}
                name="Membership Subscription"
                currency="USD"
                amount={999} // Charge value in cents USD
                description="Extend your MGB membership by a month"
                token={this.handleToken} // Obj that represents the charge
                stripeKey={stripePublishableKey} // Publishable key
              >
                <Button size="huge" primary>
                  <Icon name="credit card" />Pay with Card
                </Button>
              </StripeCheckout>
            </Segment>
          </Container>
        }
      />
    )
  }
}

export default PaymentRoute
