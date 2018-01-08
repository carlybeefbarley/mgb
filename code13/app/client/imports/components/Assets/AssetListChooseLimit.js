import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown } from 'semantic-ui-react'

const _assetLimitChoices = [25, 50, 100, 150, 200]

const AssetListChooseLimit = ({ chosenLimit, handleChangeLimitClick, sty }) => (
  <Dropdown
    inline
    pointing="top right"
    selectOnBlur={false}
    trigger={<small>{chosenLimit}</small>}
    id="mgbjr-asset-search-limitChooser"
    style={{ ...{ color: 'grey' }, ...sty }}
    title="Max number of Assets to list.."
    value={chosenLimit}
    onChange={(e, data) => handleChangeLimitClick(data.value)}
    options={_assetLimitChoices.map(lim => ({
      key: lim,
      text: lim,
      value: lim,
      content: <small>{lim}</small>,
    }))}
  />
)

AssetListChooseLimit.propTypes = {
  chosenLimit: PropTypes.number,
  sty: PropTypes.object,
  handleChangeLimitClick: PropTypes.func.isRequired,
}
export default AssetListChooseLimit
