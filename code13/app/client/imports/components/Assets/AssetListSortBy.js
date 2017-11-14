import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import { assetSorters } from '/imports/schemas/assets'

const _choiceOptions = _.keys(assetSorters)

const _menuOpenLeftSty = { left: 'auto', right: '0' } // Magic from levithomason

const AssetListSortBy = ({ chosenSortBy, handleChangeSortByClick }) => (
  <Dropdown
    inline
    trigger={<span>{chosenSortBy}</span>}
    id="mgbjr-asset-search-orderChooser"
    style={{ float: 'right', color: 'grey' }}
    title="Sort Assets By.."
  >
    <Dropdown.Menu style={_menuOpenLeftSty}>
      {_choiceOptions.map(k => (
        <Dropdown.Item
          active={k === chosenSortBy}
          value={k}
          key={k}
          content={<span>{k}</span>}
          onClick={() => handleChangeSortByClick(k)}
        />
      ))}
    </Dropdown.Menu>
  </Dropdown>
)

AssetListSortBy.propTypes = {
  chosenSortBy: PropTypes.string,
  handleChangeSortByClick: PropTypes.func.isRequired,
}

export default AssetListSortBy
