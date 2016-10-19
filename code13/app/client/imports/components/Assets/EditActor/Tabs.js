import React from 'react'

export default class Tabs extends React.Component{
  constructor(){
    super()
    this.state = {activeTab: 0}
  }
  selectTab(index){
    this.setState({activeTab: index})
  }
  render(){
    const tabs = [];
    let content = [];
    for(let i=0; i<this.props.tabs.length; i++){

      if(this.state.activeTab === i){
        tabs.push(<div className="ui button primary" key={i}>{this.props.tabs[i].tab}</div>)
        content.push(<div className="ui content" key={i}>{this.props.tabs[i].content}</div>)
      }
      else{

        tabs.push(<div className={this.props.tabs[i].disabled ? "ui button disabled" : "ui button"} key={i}
                       onClick={!this.props.tabs[i].disabled ? this.selectTab.bind(this, i) : ''}>{this.props.tabs[i].tab}</div>)
        // this makes selecting tab quicker - but also will make all content sluggish on changes
        // content.push(<div className="ui content hidden" key={i}>{this.props.tabs[i].content}</div>)
      }
    }

    return (
      <div style={{width: "100%"}}>
        <div className="tabs">
          {tabs}
        </div>
        <div className="content" style={{padding: "10px"}}>
          {content}
        </div>
      </div>
    )
  }
}
