import React, { PropTypes } from 'react'
import Helmet from 'react-helmet'
import { showToast } from '/client/imports/routes/App'
import { Segment, Header, Message, Icon } from 'semantic-ui-react'
import { logActivity } from '/imports/schemas/activity'
import { utilPushTo } from '/client/imports/routes/QLink'


export default ProjectImportMgb1Route = React.createClass({

  propTypes: {
    user:             PropTypes.object,         // Maybe absent if route is /assets
    currUser:         PropTypes.object,         // Currently Logged in user
    currUserProjects: PropTypes.array,          // Projects list for currently logged in user
    ownsProfile:      PropTypes.bool
  },

  contextTypes: {
    urlLocation: React.PropTypes.object
  },

  render: function() {
    return (
      <Segment basic>
        <Helmet
          title="Import MGB1 Project"
          meta={[
              {"name": "description", "content": "Project"}
          ]}
        />
        <Header as='h2' content='Import MGB1 Project'/>
        <Segment raised>
          <Message info icon>
            <Icon name="sign in" />
            <Message.Content>
              <Message.Header>At your service!</Message.Header>
              <p>
                All projects currently hosted in the legacy flash-based 'MGB1' system are going be imported into the new system soon..
              </p>
              <p>
                Contact us in chat to request having your project imported immediately
              </p>
            </Message.Content>
          </Message>
        </Segment>
      </Segment>
    )
  }
})