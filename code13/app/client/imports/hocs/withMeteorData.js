/**
 * Make createContainer composable.
 *
 * See: https://github.com/meteor/react-packages/pull/234
 * Our version of Meteor does not include withTracker.
 */
import { createContainer } from 'meteor/react-meteor-data'
import { getDisplayName } from '/client/imports/hocs/hocUtils'

const withMeteorData = fn => WrappedComponent => {
  const WithMeteorData = createContainer(fn, WrappedComponent)

  WithMeteorData.displayName = `withMeteorData(${getDisplayName(WrappedComponent)})`

  return WithMeteorData
}

export default withMeteorData
