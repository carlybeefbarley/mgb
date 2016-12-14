import React, { PropTypes } from 'react'
import reactMixin from 'react-mixin'
import { ReactMeteorData } from 'meteor/react-meteor-data'
import { Skills } from '/imports/schemas'

import Helmet from 'react-helmet'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'


export default SkillTreeRoute = React.createClass({
  mixins: [ReactMeteorData],

  propTypes: {
    user:         PropTypes.object,
    ownsProfile:  PropTypes.bool,        // true IFF user is valid and asset owner is currently logged in user
  },

  contextTypes: {
    skills:       PropTypes.object       // skills for currently loggedIn user (not necessarily the props.user user)
  },

  getMeteorData() {
    const { user, ownsProfile } = this.props
    if (ownsProfile || !user)
    {
      return {
        loading: false,
        skills:  null        // render() should use this.context.skills instead since that's already available
      }
    }

    // Otherwise, we need to get it

    const handleForSkills = Meteor.subscribe("skills.userId", user._id)
    return {
      loading:  !handleForSkills.ready(),
      skills:   Skills.findOne(user._id) 
    }
  },


  render: function() {
    const { user, ownsProfile } = this.props

    const userSkills = ownsProfile ? this.context.skills : this.data.skills

    return (
      <div className="ui basic segment">
        <Helmet
            title="Skill Tree"
            meta={ [ {"name": "description", "content": "SkillTree"} ] } />
        <SkillsMap user={user} userSkills={userSkills} ownsProfile={ownsProfile}/>
      </div>
    )
  }
})