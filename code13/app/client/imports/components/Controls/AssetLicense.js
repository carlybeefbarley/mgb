import _ from 'lodash'
import React, { PropTypes } from 'react'
import assetLicenses, { defaultAssetLicense } from '/imports/Enums/assetLicenses'

import { Icon, Header, List, Label } from 'semantic-ui-react'
const _propTypes = {
  license:        PropTypes.string,                 // Can be null - which will be defaultAssetLicense
  popupPosition:  PropTypes.string,
  showMicro:      PropTypes.bool,                   // If true then show really compactly (single char in circular label)
  handleChange:   PropTypes.func,                   // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit:        PropTypes.bool                    // If false, then don't allow popup/change
}

const _initPopup = (c, popupPosition, isHoverable) => (
  c && $(c).popup( {
    on: "hover",
    hoverable: isHoverable,    // So mouse-over popup keeps it visible for Edit for example
    inline: true,
    closable: true,
    position: popupPosition || "bottom right",
    lastResort: "bottom right"
  })
)

const AssetLicense = (props) => {
  const { license, popupPosition, showMicro, handleChange, canEdit } = props
  const labelSty = {
    marginBottom: "4px",
    textAlign: "left",
    whiteSpace: "nowrap"
  }

  const actualLicense = (!license || license.length === 0) ? defaultAssetLicense : license

  return (
    <span>
      <div className={`ui label`}
          title={ canEdit ? null : assetLicenses[actualLicense].name }
          ref={ (c) => { _initPopup(c, popupPosition, canEdit); this._popupInitiator = c } }>
        <Icon name='law' /><small>{ actualLicense }</small>
      </div>

      { props.canEdit &&
        <div className="ui popup" style={{fontSize: '16px'}}>
          { showMicro &&
            <Header textAlign='left'><small>License for this Asset</small></Header>
          }
          <List className="left aligned selection">
          {
            _.map(_.keys(assetLicenses), key => (
                <List.Item
                    key={key}
                    style={labelSty}
                    className={`left aligned fluid ${(key === actualLicense) ? "active" : ""}`}
                    onClick={e => {
                      e.preventDefault()
                      $(this._popupInitiator).popup('hide')
                      canEdit && handleChange && handleChange(key)
                    }}>
                  <Label>
                    <Icon name='law' /><small>{ key }</small>
                  </Label>
                  &nbsp;&nbsp;
                  <small>{ assetLicenses[key].name }</small>
                </List.Item>
              )
            )
          }
          </List>
        </div>
      }
    </span>
  )
}

AssetLicense.propTypes = _propTypes
export default AssetLicense