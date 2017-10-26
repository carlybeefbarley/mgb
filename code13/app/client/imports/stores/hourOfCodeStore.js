import PropTypes from 'prop-types'
import { Store } from '/client/imports/stores'

class HourOfCodeStore extends Store {
  static storeShape = {
    currStepIndex: PropTypes.number,
  }

  state = {
    currStepIndex: 0,
  }

  nextStep = () => {
    this.setState({ currStepIndex: this.state.currStepIndex + 1 })
  }

  prevStep = () => {
    this.setState({ currStepIndex: this.state.currStepIndex - 1 })
  }
}

export default new HourOfCodeStore()
