import React from 'react'

export default (props) => {
  if (!props.flexPanelChoice) {
    return null
  }
  const flexHeaderStyle = {
    float: 'right',
    marginRight: props.fpIsFooter ? '0px' : '60px',
    width: '285px',
    zIndex: 301     // Temp Hack
  }
  const panelScrollContainerStyle = {
    position: props.fpIsFooter ? '' : 'fixed',
    top: '50px',                /// TODO calculate this
    bottom: props.fpIsFooter ? '10px' : '0px',
    //right: props.fpIsFooter ? '0px' : '60px',
    //width: '100%',
    width: '285px',
    overflowY: 'scroll',
    zIndex: 301     // Temp Hack

  }
  const panelInnerStyle = {
    padding: '10px',
    paddingBottom: '24px',
    height: 'auto',
    zIndex: 302     // Temp Hack
  }
  const ElementFP = (!props.isSuperAdmin && props.flexPanelChoice.superAdminOnly) ? null : props.flexPanelChoice.el
  const flexPanelIcon = props.flexPanelChoice.icon
  const flexPanelHdr = props.flexPanelChoice.hdr
  return (
    <div>
      <div className="flex header" style={flexHeaderStyle}>
        <span className="title">
          <i className={flexPanelIcon + " icon"} />&nbsp;&nbsp;{flexPanelHdr}
        </span>
        <span style={{ "float": "right", padding: "3px" }} onClick={() => handleFlexPanelToggle}>
          <i className="ui grey small close icon" />
        </span>
      </div>

      <div style={panelScrollContainerStyle}>
        <div style={panelInnerStyle}>
          {!ElementFP ? <div className="ui fluid label">TODO: {flexPanelHdr} FlexPanel</div> :
            <ElementFP {...props}/>
          }
        </div>
      </div>
    </div>
  )
}