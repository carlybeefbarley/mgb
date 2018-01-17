import { browserHistory } from 'react-router'
import urlMaker from '/client/imports/routes/urlMaker'

/**
 * @param newFpView {String} the string that will be used for _fp=panel.submparam eg. "chat", or "chat.G_GENERAL_" or
 *   "assets" etc
 */
const handleFlexPanelChange = newFpView => {
  const queryParams = urlMaker.queryParams('app_flexPanel')

  browserHistory.push({
    pathname: window.location.pathname,
    search: window.location.query,
    hash: window.location.hash,
    query: { ...location.search, [queryParams]: newFpView },
  })
}

export default handleFlexPanelChange
