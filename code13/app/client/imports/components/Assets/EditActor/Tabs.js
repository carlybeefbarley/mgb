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
      const disabled = this.props.tabs[i].disabled;
      if(this.state.activeTab === i){
        tabs.push(<div className="item active primary" key={i}>{this.props.tabs[i].tab}</div>)
        content.push(<div className="ui content" key={i}>{this.props.tabs[i].content}</div>)
      }
      else{

        tabs.push(<div className={disabled ? "ui item disabled" : "ui item"}
                       style={{color: disabled ? "gray" : "black", cursor: disabled ? "auto": "pointer"}}
                       key={i}
                       onClick={!disabled ? this.selectTab.bind(this, i) : ''}>{this.props.tabs[i].tab}</div>)
        // this makes selecting tab quicker - but also will make all content sluggish on changes
        // content.push(<div className="ui content hidden" key={i}>{this.props.tabs[i].content}</div>)
      }
    }

    return (
      <div style={{width: "100%"}}>
        <div className="tabs ui top attached tabular menu">
          {tabs}
        </div>
        <div className="content" style={{padding: "10px"}}>
          {content}
        </div>
      </div>
    )
  }
}
