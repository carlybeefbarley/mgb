import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import { assetViewChoices } from '/client/imports/components/Assets/AssetCard'

const AssetListChooseView = ({ chosenView, handleChangeViewClick, sty }) => (
  <Dropdown
    inline
    pointing="top right"
    selectOnBlur={false}
    trigger={<small>{chosenView.toUpperCase()}</small>}
    id="mgbjr-asset-search-viewFormatChooser"
    style={{ ...{ color: 'grey' }, ...sty }}
    title="View Assets as.."
    value={chosenView}
    onChange={(e, data) => handleChangeViewClick(data.value)}
    options={_.map(assetViewChoices, (val, k) => ({
      key: k,
      text: k,
      value: k,
      content: <small>{k.toUpperCase()}</small>,
    }))}
  />
)

AssetListChooseView.propTypes = {
  chosenView: PropTypes.string,
  sty: PropTypes.object,
  handleChangeViewClick: PropTypes.func.isRequired,
}
export default AssetListChooseView
