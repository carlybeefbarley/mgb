import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import { assetSorters } from '/imports/schemas/assets'

const _choiceOptions = _.keys(assetSorters)

const AssetListSortBy = ({ chosenSortBy, handleChangeSortByClick }) => (
  <Dropdown
    inline
    pointing="top right"
    selectOnBlur={false}
    trigger={<span>{chosenSortBy}</span>}
    id="mgbjr-asset-search-orderChooser"
    style={{ float: 'right', color: 'grey' }}
    title="Sort Assets By.."
    value={chosenSortBy}
    onChange={(e, data) => handleChangeSortByClick(data.value)}
    options={_choiceOptions.map(k => ({
      key: k,
      text: k,
      value: k,
    }))}
  />
)

AssetListSortBy.propTypes = {
  chosenSortBy: PropTypes.string,
  handleChangeSortByClick: PropTypes.func.isRequired,
}

export default AssetListSortBy
