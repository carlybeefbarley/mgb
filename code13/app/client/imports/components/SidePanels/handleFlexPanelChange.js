import { browserHistory } from 'react-router-dom'
import urlMaker from '/client/imports/routes/urlMaker'

/**
 * @param newFpView {String} the string that will be used for _fp=panel.submparam eg. "chat", or "chat.G_GENERAL_" or
 *   "assets" etc
 */
const handleFlexPanelChange = newFpView => {
  const queryParams = urlMaker.queryParams('app_flexPanel')

  const query = window.location.search
    .substr(1)
    .split('&')
    .filter(Boolean)
    .reduce((acc, next) => {
      console.log(next)
      const [key, val] = next.split('=')
      return { ...acc, [key]: decodeURIComponent(val) }
    }, {})

  browserHistory.push({
    pathname: window.location.pathname,
    search: window.location.query,
    hash: window.location.hash,
    query: { ...query, [queryParams]: newFpView },
  })
}

export default handleFlexPanelChange
