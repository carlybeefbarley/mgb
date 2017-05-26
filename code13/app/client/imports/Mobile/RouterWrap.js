import React from 'react'
import NavBar from '/client/imports/components/Nav/NavBar'

class RouterWrap extends React.PureComponent {

  constructor(...p){
    super(...p)
    this.state = {disabled: false}
  }

  onClose = () => {
    this.props.onClose()
    this.setState({disabled: true})
  }

  render(){
    if(this.state.disabled || !this.props.location)
      return null

    const p = this.props
    return (
      <div className="locationPopup">
        <div className="head" onClick={this.onClose}></div>
        {/*<NavBar {...p} currentlyEditingAssetInfo={p.state.currentlyEditingAssetInfo}/>*/}
        <div>{React.cloneElement(p.children, p)}</div>
      </div>
    )
  }
}

export default RouterWrap
