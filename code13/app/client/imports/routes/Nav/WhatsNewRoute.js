import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '../QLink'
import Footer from '/client/imports/components/Footer/Footer'
import mgbReleaseInfo, { olderHistoryPath } from '/imports/mgbReleaseInfo'
import { fetchAssetByUri } from '/client/imports/helpers/assetFetchers'
import moment from 'moment'
import { Segment, Container, Header, List, Item, Grid, Icon } from 'semantic-ui-react'
import AboutHeader from './AboutHeader'

const _releaseStateSymbols = {
  alpha: 'α',
  beta: 'β',
}

const ReleaseId = ({ releaseId }) =>
  <span title={`${releaseId.state} #${releaseId.iteration}`}>
    <i>
      Release {_releaseStateSymbols[releaseId.state] || releaseId.state}
      {releaseId.iteration}
    </i>
  </span>

const _icons = {
  feature: { color: 'green', name: 'plus' },
  improvement: { color: 'grey', name: 'plus' },
  bugfix: { color: 'red', name: 'bug' },
  removed: { color: 'red', name: 'remove' },
}
const _getIconForChangeType = (ct, size) =>
  <Icon size={size} color={_icons[ct].color} name={_icons[ct].name} />

export default (WhatsNewRoute = React.createClass({
  propTypes: {
    currUser: PropTypes.object, // Can be null (if user is not logged in)
  },

  /** React callback - before render() is called */
  getInitialState: function() {
    return {
      releaseIdx: 0, // Index into mgbReleaseInfo[] for currently viewed release
      olderHistoryJsonResult: null, // Will be the data loaded from ${olderHistoryPath} once loaded
    }
  },

  getCombinedReleaseInfo() {
    const { olderHistoryJsonResult } = this.state

    return olderHistoryJsonResult
      ? _.concat(mgbReleaseInfo.releases, olderHistoryJsonResult.releases)
      : mgbReleaseInfo.releases
  },

  componentDidMount: function() {
    if (olderHistoryPath && !this.state.olderHistoryJsonResult) {
      fetchAssetByUri(olderHistoryPath)
        .then(data => this.setState({ olderHistoryJsonResult: JSON.parse(data) }))
        .catch(err => console.error(`Unable to load olderHistoryPath via ajax: ${err.toString()}`))
    }
    this.handleUserSawNews(this.latestRelTimestamp())
  },

  /** This is called when the WhatsNew popup has been clicked and shown. 
   *  We are to note the current timestamp of the latest release in the user profile 
   */
  handleUserSawNews: function(latestNewsTimestampSeen) {
    let currUser = this.props.currUser
    if (currUser && currUser.profile.latestNewsTimestampSeen !== latestNewsTimestampSeen) {
      Meteor.call(
        'User.updateProfile',
        currUser._id,
        {
          'profile.latestNewsTimestampSeen': latestNewsTimestampSeen,
        },
        error => {
          if (error) console.error("Could not update profile with What's New timestamp")
        },
      )
    }
  },

  latestRelTimestamp: function() {
    return mgbReleaseInfo.releases[0].timestamp
  },

  handleReleaseClicked: function(releaseIdx) {
    this.setState({ releaseIdx: releaseIdx })
  },

  render: function() {
    return (
      <div>
        <Segment basic>
          <Container>
            <Header as="h2">
              <Icon name="info circle" />What's New
            </Header>
            <AboutHeader />
            <p>
              See what's coming soon in our <QLink to="/roadmap">feature roadmap</QLink>.
            </p>
            {this.renderNews()}
          </Container>
        </Segment>
        <Footer />
      </div>
    )
  },

  // Some sub-functions to render various bits of this control.
  // They are called (directly, or indirectly) by render() above
  // They use   state.releaseIdx   to know what is being selected

  /** This renders the 2 column structure for update info */

  renderNews: function() {
    const { releaseIdx } = this.state
    const rel = this.getCombinedReleaseInfo()[releaseIdx]
    const ago = moment(new Date(rel.timestamp)).fromNow()

    return (
      <Grid columns={2} padded relaxed divided className="equal height">
        <Grid.Column>
          <Header as="h4" content="MGB updates" />
          <div style={{ maxHeight: '800px', overflowY: 'scroll' }}>
            {this.renderNewsMgbVersionsColumn()}
          </div>
        </Grid.Column>
        <Grid.Column>
          <Header as="h4">
            Changes in v{rel.id.ver}&nbsp;&nbsp;&nbsp;<small>
              <ReleaseId releaseId={rel.id} />&emsp;{ago}
            </small>
          </Header>
          {this.renderNewsRelChangesColumn()}
        </Grid.Column>
      </Grid>
    )
  },

  /** This is the left column. Uses React's state.releaseIdx */
  renderNewsMgbVersionsColumn: function() {
    const rels = this.getCombinedReleaseInfo()
    const activeRelIdx = this.state.releaseIdx

    return (
      <Item.Group link>
        {rels.map((r, idx) => {
          const sty = {
            backgroundColor: `rgba(0,0,0, ${activeRelIdx === idx ? 0.08 : 0})`,
            padding: '6px',
          }
          const ago = moment(new Date(r.timestamp)).fromNow()
          return (
            <Item key={r.timestamp} style={sty} onClick={this.handleReleaseClicked.bind(this, idx)}>
              <Item.Content>
                <Item.Header>
                  v{r.id.ver}&nbsp;&nbsp;&nbsp;<small>
                    <ReleaseId releaseId={r.id} />
                  </small>
                </Item.Header>
                <Item.Meta>
                  {ago}
                </Item.Meta>
                <Item.Description>
                  <List>
                    {r.changes.map((c, idx) =>
                      <List.Item key={idx} icon={_getIconForChangeType(c.type)} description={c.changeName} />,
                    )}
                    <br />
                  </List>
                </Item.Description>
              </Item.Content>
            </Item>
          )
        })}
      </Item.Group>
    )
  },

  /** This is the right column. Uses React's state.releaseIdx */
  renderNewsRelChangesColumn: function() {
    const relIdx = this.state.releaseIdx
    const rel = this.getCombinedReleaseInfo()[relIdx]

    return (
      <Item.Group icon>
        {rel.changes.map(c => {
          return (
            <Item key={c.changeName} className="animated fadeIn">
              {_getIconForChangeType(c.type, 'large')}&emsp;
              <Item.Content>
                <Item.Header>
                  <small>
                    {c.changeName}
                  </small>
                </Item.Header>
                <Item.Meta>
                  <p>
                    {c.changeSummary}
                  </p>
                  {c.otherUrls && c.otherUrls.length && c.otherUrls.length > 0
                    ? <ul>
                        {c.otherUrls.map((u, idx) =>
                          <li key={idx}>
                            <a href={u.href} key={idx} target="_blank">
                              {u.txt}
                            </a>
                          </li>,
                        )}
                      </ul>
                    : null}
                </Item.Meta>
              </Item.Content>
            </Item>
          )
        })}
      </Item.Group>
    )
  },
}))
