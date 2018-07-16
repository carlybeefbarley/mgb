import PropTypes from 'prop-types'
import React from 'react'
//import Inspector from 'react-inspector'

export default class DebugASTview extends React.PureComponent{
  static propTypes = {
    atCursorMemberParentRequestResponse: PropTypes.object,
  }

  smartRender = () => {
    if (
      !this.props.atCursorMemberParentRequestResponse ||
      !this.props.atCursorMemberParentRequestResponse.data
    )
      return null

    const d = this.props.atCursorMemberParentRequestResponse.data

    if (d.isProperty) {
      if (d.objType && d.objType.types && d.objType.types[0]) return <p>***{d.objType.types[0].name}***</p>
    } else return null
  }

  render() {
    if (!this.props.atCursorMemberParentRequestResponse) return null

    return (
      <div className="ui green segment" style={{ backgroundColor: 'rgba(0,255,0,0.03)' }}>
        {this.smartRender()}
        <br />
        NOT ENABLED
        {/*
        <Inspector name="TernStuff" expandLevel={2} data={this.props.atCursorMemberParentRequestResponse} />
          */}
      </div>
    )
  }
}

