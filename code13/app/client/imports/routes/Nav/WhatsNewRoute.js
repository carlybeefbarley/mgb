import _ from 'lodash'
import React, { PropTypes } from 'react'
import QLink from '../QLink'
import Footer from '/client/imports/components/Footer/Footer'
import mgbReleaseInfo, { olderHistoryPath } from '/imports/mgbReleaseInfo'
import { fetchAssetByUri } from '/client/imports/helpers/assetFetchers'
import moment from 'moment'
import { Segment, Container, Header, List, Message, Item, Grid, Icon } from 'semantic-ui-react'
import AboutHeader from './AboutHeader'

const _releaseStateSymbols = {
  alpha: 'α',
  beta: 'β',
}

const ReleaseId = ({ releaseId }) => (
  <span title={`${releaseId.state} #${releaseId.iteration}`}>
    <i>
      Release {_releaseStateSymbols[releaseId.state] || releaseId.state}
      {releaseId.iteration}
    </i>
  </span>
)

const _icons = {
  feature: { color: 'green', name: 'plus' },
  improvement: { color: 'grey', name: 'plus' },
  bugfix: { color: 'red', name: 'bug' },
  removed: { color: 'red', name: 'remove' },
}
const _getIconForChangeType = (ct, size) => (
  <Icon size={size} color={_icons[ct].color} name={_icons[ct].name} />
)

const WhatsNewRoute = React.createClass({
  propTypes: {
    currUser: PropTypes.object, // Can be null (if user is not logged in)
  },

  /** React callback - before render() is called */
  getInitialState() {
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

  componentDidMount() {
    if (olderHistoryPath && !this.state.olderHistoryJsonResult) {
      fetchAssetByUri(olderHistoryPath)
        .then(data => this.setState({ olderHistoryJsonResult: JSON.parse(data) }))
        .catch(err => console.error(`Unable to load olderHistoryPath via ajax: ${err.toString()}`))
    }
    this.handleUserSawNews(this.latestReleaseTimestamp())
  },

  /** This is called when the WhatsNew popup has been clicked and shown.
   *  We are to note the current timestamp of the latest release in the user profile
   */
  handleUserSawNews(latestNewsTimestampSeen) {
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

  latestReleaseTimestamp() {
    return mgbReleaseInfo.releases[0].timestamp
  },

  handleReleaseClicked(releaseIdx) {
    this.setState({ releaseIdx })
  },

  render() {
    return (
      <div>
        <Segment basic>
          <Container>
            <Header as="h1" icon="gift" content="What's New" />
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

  renderNews() {
    const { releaseIdx } = this.state
    const release = this.getCombinedReleaseInfo()[releaseIdx]
    const ago = moment(new Date(release.timestamp)).fromNow()

    return (
      <Grid columns={2} padded relaxed divided className="equal height">
        <Grid.Column>
          <Header as="h2" content="MGB updates" />
          <div style={{ maxHeight: '800px', overflowY: 'scroll' }}>{this.renderNewsMgbVersionsColumn()}</div>
        </Grid.Column>
        <Grid.Column>
          <Header as="h2">
            Changes in v{release.id.ver}
            <Header.Subheader>
              <ReleaseId releaseId={release.id} />&emsp;{ago}
            </Header.Subheader>
          </Header>
          {release.summary && <Message info icon="bullhorn" content={release.summary} />}
          {this.renderNewsReleaseChangesColumn()}
        </Grid.Column>
      </Grid>
    )
  },

  /** This is the left column. Uses React's state.releaseIdx */
  renderNewsMgbVersionsColumn() {
    const releases = this.getCombinedReleaseInfo()
    const activeReleaseIdx = this.state.releaseIdx

    return (
      <Item.Group link>
        {releases.map((release, idx) => {
          const sty = {
            backgroundColor: `rgba(0,0,0, ${activeReleaseIdx === idx ? 0.08 : 0})`,
            padding: '6px',
          }
          const ago = moment(new Date(release.timestamp)).fromNow()
          return (
            <Item key={release.timestamp} style={sty} onClick={this.handleReleaseClicked.bind(this, idx)}>
              <Item.Content>
                <Item.Header>
                  v{release.id.ver}&nbsp;&nbsp;&nbsp;<small>
                    <ReleaseId releaseId={release.id} />
                  </small>
                </Item.Header>
                <Item.Meta>{ago}</Item.Meta>
                <Item.Description>
                  <List>
                    {release.changes.map((c, idx) => (
                      <List.Item key={idx} icon={_getIconForChangeType(c.type)} description={c.changeName} />
                    ))}
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
  renderNewsReleaseChangesColumn() {
    const { releaseIdx } = this.state
    const release = this.getCombinedReleaseInfo()[releaseIdx]

    return (
      <Item.Group>
        {release.changes.map(change => {
          return (
            <Item key={change.changeName} className="animated fadeIn">
              {_getIconForChangeType(change.type, 'large')}&emsp;
              <Item.Content>
                <Item.Header>
                  <small>{change.changeName}</small>
                </Item.Header>
                <Item.Meta>
                  <p>{change.changeSummary}</p>
                  {!_.isEmpty(change.otherUrls) && (
                    <ul>
                      {change.otherUrls.map((otherUrl, idx) => (
                        <li key={idx}>
                          <a href={otherUrl.href} target="_blank" rel="noopener noreferrer">
                            {otherUrl.txt}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </Item.Meta>
              </Item.Content>
            </Item>
          )
        })}
      </Item.Group>
    )
  },
})

export default WhatsNewRoute
