import _ from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Dropdown } from 'semantic-ui-react'
import { assetViewChoices } from '/client/imports/components/Assets/AssetCard'

const _menuOpenLeftSty = { left: 'auto', right: '0' } // Magic from levithomason

const AssetListChooseView = ({ chosenView, handleChangeViewClick, sty }) => (
  <Dropdown
    inline
    trigger={<small>{chosenView.toUpperCase()}</small>}
    id="mgbjr-asset-search-viewFormatChooser"
    style={{ ...{ color: 'grey' }, ...sty }}
    title="View Assets as.."
  >
    <Dropdown.Menu style={_menuOpenLeftSty}>
      {_.map(
        _.keys(assetViewChoices).map(k => (
          <Dropdown.Item
            active={k === chosenView}
            value={k}
            key={k}
            content={<small>{k.toUpperCase()}</small>}
            onClick={() => {
              handleChangeViewClick(k)
            }}
          />
        )),
      )}
    </Dropdown.Menu>
  </Dropdown>
)

AssetListChooseView.propTypes = {
  chosenView: PropTypes.string,
  sty: PropTypes.object,
  handleChangeViewClick: PropTypes.func.isRequired,
}
export default AssetListChooseView
