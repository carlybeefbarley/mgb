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
          <h2>Skill Tree</h2>
        </QLink>
        (more to come)
      </div>
    )
  }
}
