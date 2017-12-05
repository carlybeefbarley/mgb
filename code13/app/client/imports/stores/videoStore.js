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
      videos: PropTypes.array, // Array with related video names for the component
    }),
  }

  state = {
    videos: null,
  }

  // Get the data containing components and related videoIds
  // then get the related videos for the component
  getVideosForComponent = componentName => {
    return new Promise((resolve, reject) => {
      mgbAjax(`/api/asset/code/!vault/videoListData.json`, (err, videoDataStr) => {
        let videoData

        try {
          videoData = JSON.parse(videoDataStr)
        } catch (err) {
          console.error('Failed to JSON parse video list:', videoData)
          reject(err)
          return
        }
        this.setState({ videos: videoData.videos[componentName] })

        resolve(videoData.videos[componentName])
      })
    })
  }
}

export default new videoStore()
