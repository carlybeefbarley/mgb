import React from 'react'

export default class SkillGrid extends React.Component{
  static propTypes = {
    user: React.PropTypes.object,
    className: React.PropTypes.string
  }

  render(){
    const user = this.props.user
    const page = `/u/${user.profile.name}/skilltree`

    return (
      <div className={this.props.className}>
        <QLink to={page}>
          <h2>Skills</h2>
        </QLink>
        <div className="ui fluid" style={{height: "200px", background: "#c5c5c5", display: "block"}}>
          <p>Skills map summary (more to come)</p>
        </div>
      </div>
    )
  }
}
