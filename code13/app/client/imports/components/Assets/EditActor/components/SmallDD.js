import React from 'react'
export default class SmallDD extends React.Component{
  state = {hasTriggered: false}
  render(){
    const items = []
    if(this.state.hasTriggered){
      for(let i=0; i<this.props.options.length; i++){
        items.push(
          <div className="item" onClick={
            (e) => {
                  console.log(e.target.dataset.value);
                  this.props.onchange && this.props.onchange(e.target.dataset.value)

             }
          }
                        data-value={this.props.options[i].value == void(0) ? this.props.options[i].text : this.props.options[i].value}
                        key={i}
          >
          {this.props.options[i].text}
        </div>)
      }
    }
    return (
      <div className="ui fluid selection dropdown"
           onMouseOver={ this.state.hasTriggered ? null : (e) => {
                 console.log("initialized dropdown!!", $(e.target).closest(".selection.dropdown"))
                 $(e.target).closest(".selection.dropdown").dropdown()
                 this.setState({hasTriggered: true});
               }
           }
        >
        <input type="hidden" name="country" value="0" />
        <i className="dropdown icon"></i>

        {this.props.value != void(0) ?
          <div className="text">{
            this.props.options.find( o => o.value !== void(0) ? o.value == this.props.value : o.text == this.props.value).text
          }</div> : <div className="default text">Select...</div>
        }
        <div className="menu" ref="menu">
          {this.state.hasTriggered && items}
        </div>
      </div>
    )
  }
}
