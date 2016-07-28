import _ from 'lodash';
import React, { PropTypes } from 'react';
import Badge, { getAllBadgesForUser } from '/client/imports/components/Controls/Badge/Badge';


export default BadgeGrid = React.createClass({

  propTypes: {
    user: PropTypes.object,
    className: PropTypes.string
  },
  

  render: function() {
    const { user } = this.props
    if (!user)
      return null
    
    const badgesPageUrl = `/u/${user.profile.name}/badges`   
    const badgesForUser = getAllBadgesForUser(user)
    const getBadgeN = idx => (<Badge name={idx < badgesForUser.length ? badgesForUser[idx] : "blank"} />)
    return (
      <div className={this.props.className}>
        <QLink to={badgesPageUrl}>
          <h2>Badges</h2>
        </QLink>
        <div className="ui equal width grid">
          <div className="equal width row">
            <div className="column">{getBadgeN(0)}</div>
            <div className="column">{getBadgeN(1)}</div>
            <div className="column">{getBadgeN(2)}</div>
          </div>
          <div className="equal width row">
            <div className="column">{getBadgeN(3)}</div>
            <div className="column">{getBadgeN(4)}</div>
            <div className="column">{getBadgeN(5)}</div>
          </div>
          <div className="equal width row">
            <div className="column">{getBadgeN(6)}</div>
            <div className="column">{getBadgeN(7)}</div>
            <div className="column">
              <QLink to={badgesPageUrl}>
                <div className="ui label">more</div>
              </QLink>
              </div>
          </div>
        </div>
      </div>
    )
  }

})