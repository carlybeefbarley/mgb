import _ from 'lodash';
import React, {Component, PropTypes} from 'react';
import Helmet from 'react-helmet';
import Badge, { getAllBadgesForUser } from '/client/imports/components/Controls/Badge/Badge';

export default BadgeListRoute = React.createClass({

  propTypes: {
    query: PropTypes.object,
    user: PropTypes.object,
    currUser: PropTypes.object,
    ownsProfile: PropTypes.bool
  },
  

  render: function()
  {
    const { user } = this.props

    if (!user)
      return null

    const badgesForUser = getAllBadgesForUser(user)
    const makeBadgeFromVal = val => (<Badge name={val} key={val} />)

    return (
      <div className="ui basic segment">

        <Helmet
          title="User Badge List"
          meta={[
              {"name": "description", "content": "Badges"}
          ]}
        />        
        
        <div className="ui padded images">
          { badgesForUser.map(val => makeBadgeFromVal(val) ) } 
        </div>

      </div>
    )
  }
})
