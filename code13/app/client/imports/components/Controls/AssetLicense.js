import _ from 'lodash'
import React, { PropTypes } from 'react'
import assetLicenses, { defaultAssetLicense } from '/imports/Enums/assetLicenses'

import { Icon, Header, List, Label } from 'semantic-ui-react'

const _initPopup = (c, popupPosition) => (
  c && $(c).popup( {
    on: "hover",
    hoverable: true,    // So mouse-over popup keeps it visible for Edit for example
    inline: true,
    closable: true,
    position: popupPosition || "bottom right",
    lastResort: "bottom right"
  })
)

const _labelSty = {
  marginBottom:   '4px',
  textAlign:      'left',
  whiteSpace:     'nowrap'  
}

const AssetLicense = ( { license, popupPosition, handleChange, canEdit } ) => {
  const actualLicense = (!license || license.length === 0) ? defaultAssetLicense : license

  return (
    <span style={{textAlign: 'left'}}>
      <div 
          className='ui basic label' 
          style={{ borderRadius: '0px'}}
          ref={ (c) => { _initPopup(c, popupPosition); this._popupInitiator = c } }>
        <Icon name='law' /><small>{ actualLicense }</small>
      </div>
      
      <div className="ui small popup" style={canEdit ? {fontSize: '16px'} : {} }>
        <Header textAlign='left'><small>License for this Asset</small></Header>
        { !canEdit ? 
          <div>
            <p>
              <a href={assetLicenses[actualLicense].url} target='_blank'>
                {assetLicenses[actualLicense].name}
              </a>
            </p>
            <Label small color='black' >
              <Icon name='law' /><small>{ actualLicense }</small>
            </Label>
            <p>
              <br />
              Non-legal summary of license:
              <br />
              <small style={{color: 'grey'}} >{assetLicenses[actualLicense].summary}</small>
            </p>
            <p><small><a href={assetLicenses[actualLicense].url} target='_blank'>
              See the full license for the exact terms
            </a></small></p>
          </div>
        : 
          <List className="left aligned selection">
          {
            _.map(_.keys(assetLicenses), key => (
                <List.Item
                    key={key}
                    title={assetLicenses[key].summary}
                    style={_labelSty}
                    className={`left aligned fluid ${(key === actualLicense) ? "active" : ""}`} >
                  <List.Content floated='right'>
                    <a href={assetLicenses[key].url} target='_blank'>
                      <Icon name='external' style={{paddingTop: '0.25em'}} />
                    </a>
                  </List.Content>
                  <List.Content 
                      style={{paddingRight: '2em'}}
                      onClick={e => {
                        e.preventDefault()
                        $(this._popupInitiator).popup('hide')
                        canEdit && handleChange && handleChange(key)
                      }}>
                    <Label basic={key !== actualLicense} color={(key === actualLicense) ? 'black' : null} style={{width: '9em'}}>
                      <Icon name='law' /><small>{ key }</small>
                    </Label>
                    &nbsp;&nbsp;
                    <small>{ assetLicenses[key].name }</small>
                  </List.Content>
                </List.Item>
              )
            )
          }
          </List>
        }
      </div>
    </span>
  )
}

AssetLicense.propTypes = {
  license:        PropTypes.string,                 // Can be null - which will be defaultAssetLicense
  popupPosition:  PropTypes.string,
  handleChange:   PropTypes.func,                   // Callback function - single param is new workState string. Only called if CanEdit is true
  canEdit:        PropTypes.bool                    // If false, then don't allow popup/change
}

export default AssetLicense