import React, { PropTypes } from 'react'

const _choiceOptions = "edited,name,kind".split(",")

const AssetListSortBy = ( { chosenSortBy, handleChangeSortByClick } ) => (
  <div 
      id='mgbjr-asset-search-orderChooser'
      className="ui small simple dropdown item" 
      style={{float: "right", color: "grey"}} 
      title="Sort Assets By..">
    { chosenSortBy }
    <i className='dropdown icon' style={{marginLeft: '0.2em'}}/>
    <div className="ui small fitted menu">
      { _choiceOptions.map((k) => (
          <a  className={"ui item"+ (k === chosenSortBy ? " active" : "")} 
              data-value={k} key={k} 
              onClick={ () => handleChangeSortByClick(k) }>
            {k}
          </a>
        ))
      }
    </div>
    &emsp;
  </div>
)

AssetListSortBy.propTypes = {
  chosenSortBy: PropTypes.string,
  handleChangeSortByClick: PropTypes.func.isRequired
}

export default AssetListSortBy