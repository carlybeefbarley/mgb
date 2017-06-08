import React, { PropTypes } from 'react'
import {mgbAjaxCached} from '../helpers/assetFetchers'

import './loadMore.css'

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

    this.onScroll = this.onScroll.bind(this)
  }
  src = '/api/assets'
  scrollThreshold = 150
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

  /* TODO: animate without jQuery */
  scrollToTop(e){
    $(e.target.parentElement).animate({"scrollTop": 0})
    //e.target.parentElement.scrollTop = 0
  }

  onScroll(e){
    const current = e.target.scrollTop + e.target.clientHeight
    if(e.target.scrollTop > 0)
      e.target.classList.add('scrollback')
    else
      e.target.classList.remove('scrollback')

    const max = e.target.scrollHeight
    console.log("Scrolling:", `max: ${max}, current: ${current}`)
    if(max - current < this.scrollThreshold)
      this.loadMore()

  }

  loadMoreReset(){
    this._loadMoreState.page = 1
    this._loadMoreState.isLoading = false
    this._loadMoreState.data = []
  }

  renderDebug(){
    return <pre>{JSON.stringify(this._loadMoreState, null, "\t")}</pre>
  }


  render(){
    return <div className="scrollToTop" onClick={(e) => {this.scrollToTop(e)}}>&#8679;</div>
  }
}

export default LoadMore
