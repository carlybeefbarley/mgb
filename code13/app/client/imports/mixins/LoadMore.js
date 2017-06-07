import React, { PropTypes } from 'react'
import {mgbAjaxCached} from '../helpers/assetFetchers'

class LoadMore extends React.Component {
  propTypes = {
    limit: PropTypes.number,  // Items to load per page request
  }
  constructor(...a){
    super(...a)
    this.state = {page: 0, loading: false}
    this._loadMoreState = {
      isLoading: false,
      page: 1,
      data: []
    }
  }
  src = '/api/assets'

  loadMore(page = this.state.page + 1, limit = this.props.limit){
    if(this._loadMoreState.isLoading)
      return

    this._loadMoreState.isLoading = true
    this._loadMoreState.page++

    console.log("Loading more!")
    this.setState({loading: true}, () => {
      this.loadMoreData(page, limit)
    })
  }

  loadMoreData(page, limit){
    const p = this.getQueryParams()
    p.page = this._loadMoreState.page
    mgbAjaxCached(`${this.src}/${encodeURIComponent(JSON.stringify(p))}`, 120, (error, data) => {
      if(error){
        console.error("ERROR:", error)
        return
      }
      this.loadMoreAdd(data)
    })
  }

  loadMoreAdd(data){
    // return
    this._loadMoreState.data = this._loadMoreState.data.concat(JSON.parse(data))
    this.setState({loading: false}, () => {
      this._loadMoreState.isLoading = false
      console.log("Loaded more:", data)
    })
  }

  loadMoreReset(){
    this._loadMoreState.page = 1
    this._loadMoreState.isLoading = false
    this._loadMoreState.data = []
  }

  render(){
    return <pre>{JSON.stringify(this._loadMoreState, null, "\t")}</pre>
  }
}

export default LoadMore
