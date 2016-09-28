import _ from 'lodash'
import React, { PropTypes } from 'react'
import { assetViewChoices } from '/client/imports/components/Assets/AssetCard'

export default AssetListChooseView = props => {
  const { chosenView, handleChangeViewClick, sty } = props
  const choiceOptions = Object.keys(assetViewChoices)

  // Create the       | View  v |     Dropdown UI
  return (
    <div 
        className="ui small simple dropdown item" 
        style={_.merge({color: 'grey'}, sty)} 
        title="View Assets as..">
      <small>{chosenView.toUpperCase()}</small>
      <i className="dropdown icon" style={{marginLeft: '0.2em'}} />
      <div className="ui small menu">
      {
        choiceOptions.map((k) => (
          <a  className={"ui item"+ (k === chosenView ? " active" : "")} 
              data-value={k} key={k} 
              onClick={() => handleChangeViewClick(k) }>
            <small>{k.toUpperCase()}</small>
          </a>
        ))
      }
      </div>
    </div>
  )
}

AssetListChooseView.propTypes = {
  chosenView:             PropTypes.string,
  sty:                    PropTypes.object,
  handleChangeViewClick:  PropTypes.func.isRequired
}