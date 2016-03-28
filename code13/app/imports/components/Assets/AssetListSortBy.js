import React from 'react';
import {Link} from 'react-router';


export default class AssetListSortBy extends React.Component {
  // propTypes:{
  //   chosenSortBy: React.PropTypes.string,
  //   handleChangeSortByClick: React.PropTypes.func
  //   }

  constructor(props) {
    super(props);
  }

  render() {
    let choiceOptions = "edited,name,kind".split(",")
    // Build the list of 'Sort By' Menu choices
    let choices = choiceOptions.map((k) => { 
      return    <a  className={"ui item"+ (k===this.props.chosenSortBy ? " active" : "")} 
                    data-value={k} key={k} 
                    onClick={this.handleChangeSortByClick.bind(this,k)}>
                    {k}
                </a>        
    })

    // Create the       | Sort By Asset v |      UI
    return (
      <div className="ui compact tiny borderless  menu">

        <div className="ui simple dropdown item">
          Sort By
          <i className="dropdown icon"></i>
          <div className="ui menu">
            {choices}
          </div>
        </div>
      </div>
    );
  }

  handleChangeSortByClick(newSortBy)
  {
    if (this.handleChangeSortByClick)
      this.props.handleChangeSortByClick(newSortBy);
  }
}
