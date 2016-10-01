import _ from 'lodash'
import React, { PropTypes } from 'react'
import assetLicenses, { defaultAssetLicense } from '/imports/Enums/assetLicenses'

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
        <i className='ui law icon' /><small>{ actualLicense }</small>
      </div>

      { props.canEdit &&
        <div className="ui popup" style={{fontSize: '16px'}}>
          { showMicro &&
            <div className="ui left aligned header"><small>License for this Asset</small></div>
          }
          <div className="ui left aligned selection list">
          {
            _.map(_.keys(assetLicenses), key => (
                <div
                    key={key}
                    style={labelSty}
                    className={`ui item left aligned fluid ${(key === actualLicense) ? "active" : ""}`}
                    onClick={e => {
                      e.preventDefault()
                      $(this._popupInitiator).popup('hide')
                      canEdit && handleChange && handleChange(key)
                    }}>
                  <div className={`ui label`} >
                    <i className='ui law icon' /><small>{ key }</small>
                  </div>
                  &nbsp;&nbsp;
                  <small>{ assetLicenses[key].name }</small>
                </div>
              )
            )
          }
          </div>
        </div>
      }
    </span>
  )
}

AssetLicense.propTypes = _propTypes
export default AssetLicense