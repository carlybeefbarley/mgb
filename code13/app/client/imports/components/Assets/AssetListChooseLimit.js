import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown } from 'semantic-ui-react'

const _menuOpenLeftSty = { left: 'auto', right: '0' } // Magic from levithomason

const _assetLimitChoices = [25, 50, 100, 150, 200]

const AssetListChooseLimit = ({ chosenLimit, handleChangeLimitClick, sty }) => (
  <Dropdown
    inline
    trigger={<small>{chosenLimit}</small>}
    id="mgbjr-asset-search-limitChooser"
    style={{ ...{ color: 'grey' }, ...sty }}
    title="Max number of Assets to list.."
  >
    <Dropdown.Menu style={_menuOpenLeftSty}>
      {_assetLimitChoices.map(lim => (
        <Dropdown.Item
          active={lim === chosenLimit}
          value={lim}
          key={lim}
          content={<small>{lim}</small>}
          onClick={() => {
            handleChangeLimitClick(lim)
          }}
        />
      ))}
    </Dropdown.Menu>
  </Dropdown>
)

AssetListChooseLimit.propTypes = {
  chosenLimit: PropTypes.number,
  sty: PropTypes.object,
  handleChangeLimitClick: PropTypes.func.isRequired,
}
export default AssetListChooseLimit
