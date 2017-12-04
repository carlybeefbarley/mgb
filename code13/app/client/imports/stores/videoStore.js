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
      videos: PropTypes.object, // object with components as keys and videoIds as values
      relatedVideoId: PropTypes.string, // videoId of related video
      componentName: PropTypes.string, // component name
    }),
  }

  state = {
    videos: null,
    relatedVideoId: null,
    componentName: null,
  }

  storeWillReceiveState(nextState) {}

  storeDidUpdate(prevState) {
    const { componentName: prevComponentName } = prevState
    const { componentName, videos } = this.state
    console.log(videos)
    if (!videos) return
    if (componentName !== prevComponentName) {
      console.log(3)
      this.setState({ relatedVideoId: videos[componentName] })
    }
  }

  // Get the data containing components and related videoIds
  getVideoData = () => {
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
        console.log(1)
        this.setState({ videos: videoList.videos })

        resolve(videoList)
      })
    })
  }

  // Get the component name from the component
  getComponentName = componentName => {
    console.log(2, componentName)
    this.setState({ componentName })
  }
}

export default new videoStore()
