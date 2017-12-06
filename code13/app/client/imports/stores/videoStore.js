import _ from 'lodash'
import PropTypes from 'prop-types'

import { Store } from '/client/imports/stores'
import { mgbAjax } from '/client/imports/helpers/assetFetchers'

/*
For showing relevant videos for pages/components when available
*/
class videoStore extends Store {
  static storeShape = {
    state: PropTypes.shape({
      videoData: PropTypes.object, // Object that maps component names to lists of related videos
      component: PropTypes.string, // Name of component
      videos: PropTypes.array, // Array with related video names for the component
    }),
  }

  state = {
    videoData: null,
    component: null,
    videos: null,
  }

  storeDidUpdate(prevState) {
    const { component: prevComponent } = prevState
    const { component, videoData } = this.state

    if (!videoData) return
    if (component !== prevComponent) {
      this.setState({ videos: videoData[component] })
    }
  }

  // Get the data containing components and related videoIds
  // then get the related videos for the component
  getVideoData = () => {
    return new Promise((resolve, reject) => {
      mgbAjax(`/api/asset/code/!vault/componentVideosMap.json`, (err, videoDataStr) => {
        let videoData

        try {
          videoData = JSON.parse(videoDataStr)
        } catch (err) {
          console.error('Failed to JSON parse video list:', videoData)
          reject(err)
          return
        }
        this.setState({ videoData })

        resolve(videoData)
      })
    })
  }

  getComponentName = component => {
    this.setState({ component })
  }
}

export default new videoStore()
