import PropTypes from 'prop-types'
import React from 'react'
import { Segment, Header } from 'semantic-ui-react'
import { withTracker } from 'meteor/react-meteor-data'
import { Skills } from '/imports/schemas'
import Helmet from 'react-helmet'
import SkillsMap from '/client/imports/components/Skills/SkillsMap'
import Spinner from '/client/imports/components/Nav/Spinner'

class SkillTreeRoute extends React.PureComponent{

  static propTypes = {
    user: PropTypes.object,
    ownsProfile: PropTypes.bool, // true IFF user is valid and asset owner is currently logged in user
    isTopLevelRoute: PropTypes.bool, // Useful so routes can be re-used for embedding.  If false, they can turn                                                  off toolbars/headings etc as appropriate
  }

  static contextTypes = {
    skills: PropTypes.object, // skills for currently loggedIn user (not necessarily the props.user user)
  }

  render() {
    const { isSuperAdmin, ownsProfile, isTopLevelRoute, loading } = this.props
    const userSkills = ownsProfile ? this.context.skills : this.props.skills

    return (
      <div className={isTopLevelRoute ? 'ui basic padded segment' : null}>
        {isTopLevelRoute && (
          <Helmet title="Skill Tree" meta={[{ name: 'description', content: 'SkillTree' }]} />
        )}
        {isTopLevelRoute && <Header as="h2" content="Skills" />}
        {isTopLevelRoute && (
          <Segment>
            <p>
              The Skill Bars below represent your progress on learning certain Skills. Skills will
              automatically advance as you complete tutorials, exercise certain skills, and as you code with
              CodeMentor. You can expand each Skill Bar to see the details of your skill progress in that
              area, and even manually change your status for each Skill.
            </p>
            <p>
              This system allows MGB to present appropriate help and tutorials to you based on your level, and
              for you to track your progress in these Skill areas.
            </p>
          </Segment>
        )}
        {loading ? (
          <Spinner />
        ) : (
          <SkillsMap isSuperAdmin={isSuperAdmin} expandable labeled skills={userSkills} />
        )}
      </div>
    )
  }
}

export default withTracker(props => {
  const { user, ownsProfile } = props
    if (ownsProfile || !user) {
      return {
        loading: false,
        skills: null, // render() should use this.context.skills instead since that's already available
      }
    }

    // Otherwise, we need to get it

    const handleForSkills = Meteor.subscribe('skills.userId', user._id)
    return {
      loading: !handleForSkills.ready(),
      skills: Skills.findOne(user._id),
    }
})(SkillTreeRoute)
