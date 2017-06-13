import React from 'react'
import NavBar from '/client/imports/components/Nav/NavBar'
import { Icon } from 'semantic-ui-react'


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
      <div className="locationPopup" id="locationPopup">
        <Icon window name="close" onClick={this.onClose} className="head big outline"/>
        {/*<NavBar {...p} currentlyEditingAssetInfo={p.state.currentlyEditingAssetInfo}/>*/}
        <div>{React.cloneElement(p.children, p)}</div>
      </div>
    )
  }
}

export default RouterWrap
