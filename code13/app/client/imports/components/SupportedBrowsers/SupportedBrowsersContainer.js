import axios from 'axios'
import React from 'react'

import { mgbAjax } from '/client/imports/helpers/assetFetchers'
import SpecialGlobals from '/imports/SpecialGlobals'
import SupportedBrowsers from './SupportedBrowsers'

class SupportedBrowsersContainer extends React.Component {
  state = { buttons: null, canBrowse: null, loading: true }

  componentDidMount() {
    this.check()
  }

  check = () => {
    this.setState(() => ({ buttons: null, canBrowse: null, loading: true }))

    mgbAjax(`/api/asset/code/!vault/${SpecialGlobals.SystemParams.supportedBrowsers}`, (err, res) => {
      if (err) return console.error(err)

      const { buttons, canibrowse } = JSON.parse(res)

      axios
        .get('https://canibrowse.now.sh', { params: { ...canibrowse } })
        .then(({ data }) => {
          this.setState(() => ({
            loading: false,
            buttons,
            canBrowse: data.canBrowse,
          }))
        })
        .catch(err => {
          console.error(err)
        })
    })
  }

  render() {
    const { buttons, canBrowse, loading } = this.state

    if (loading || canBrowse) return null

    return <SupportedBrowsers buttons={buttons} />
  }
}

export default SupportedBrowsersContainer
