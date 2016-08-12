import React from 'react'

export default class AssetListSortBy extends React.Component {
  // propTypes:{
  //   chosenSortBy: React.PropTypes.string,
  //   handleChangeSortByClick: React.PropTypes.func
  //   }

  constructor(props) {
    super(props)
  }

  render() {
    let choiceOptions = "edited,name,kind".split(",")
    // Build the list of 'Sort By' Menu choices
    let choices = choiceOptions.map((k) => { 
      return (
        <a  className={"ui item"+ (k===this.props.chosenSortBy ? " active" : "")} 
            data-value={k} key={k} 
            onClick={this.handleChangeSortByClick.bind(this,k)}>
          {k}
        </a>        
      )
    })


    // Create the       | Sort By Asset v |     Dropdown UI
    return (
      <div className="ui small simple dropdown item" style={{float: "right", color: "grey"}} title="Sort Assets By..">
        { this.props.chosenSortBy }
        <i className="dropdown icon"></i>&nbsp;
        <div className="ui small menu">
          {choices}
        </div>
      </div>
    )
  }

  handleChangeSortByClick(newSortBy)
  {
    if (this.handleChangeSortByClick)
      this.props.handleChangeSortByClick(newSortBy)
  }
}
