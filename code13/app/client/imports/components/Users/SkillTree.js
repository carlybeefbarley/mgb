
import React from 'react'

export default class SkillTree extends React.Component{
  static propTypes = {
    user: React.PropTypes.object
  }

  render(){
    return (
      <div>
        Here will be {this.props.user.profile.name}'s skill tree
      </div>
    )
  }
}
