import React from "react"
import Helmet from 'react-helmet';
import SkillTree from '/client/imports/components/Users/SkillTree.js';

export default class SkillTreePage extends React.Component{
  static propTypes = {
    user: React.PropTypes.object
  }

  render(){
    return (
      <div className="ui basic segment">
        <Helmet
          title="Skill Tree"
          meta={[
              {"name": "description", "content": "SkillTree"}
          ]}
          />
        <SkillTree user={this.props.user} />
      </div>
    )
  }
}
