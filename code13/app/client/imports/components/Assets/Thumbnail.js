import React from 'react'

export default class Thumbnail extends React.Component {
  defaultProps = {
    id: React.PropTypes.string.required,
    className: React.PropTypes.string,
    style: React.PropTypes.string
  }

  render(){
    return <img className={this.props.className} style={this.props.style} src={`/api/asset/thumbnail/png/${this.props.id}`}></img>
  }
}
