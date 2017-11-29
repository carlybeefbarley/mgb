import _ from 'lodash'
import PropTypes from 'prop-types'

import { Store } from '/client/imports/stores'

/*
For showing relevant videos for pages/components when available
*/
class videoStore extends Store {
  static storeShape = {
    state: PropTypes.shape({}),
  }

  state = {}

  storeWillReceiveState(nextState) {}

  storeDidUpdate(prevState) {}
}

export default new videoStore()
