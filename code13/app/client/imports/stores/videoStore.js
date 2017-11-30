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
      // object with components as keys and videoIds as values
      videos: PropTypes.object,
      // videoId of related video
      // must match this.constructor.name
      relatedVideoId: PropTypes.string,
    }),
  }

  state = {
    videos: null,
    relatedVideoId: null,
  }

  storeWillReceiveState(nextState) {}

  storeDidUpdate(prevState) {
    const { relatedVideoId: prevVideoId } = prevState
    const { relatedVideoId } = this.state
    if (relatedVideoId !== prevVideoId) {
      console.log(relatedVideoId)
    }
  }

  getVideoData = (isActivitySetup = false) => {
    return new Promise((resolve, reject) => {
      mgbAjax(`/api/asset/code/!vault/videoListData.json`, (err, videoListString) => {
        let videoList

        try {
          videoList = JSON.parse(videoListString)
        } catch (err) {
          console.error('Failed to JSON parse video list:', videoList)
          reject(err)
          return
        }
        this.setState({ videos: videoList.videos })

        resolve(videoList)
      })
    })
  }

  getRelatedVideoByComponent = component => {
    if (!this.state.videoList) return

    this.setState({ relatedVideoId: this.state.videoList[component] })
  }
}

export default new videoStore()
