import React, { PropTypes } from 'react'
import QLink from '../QLink'
import Footer from '/client/imports/components/Footer/Footer'
import mgbReleaseInfo from '/imports/mgbReleaseInfo'
import moment from 'moment'
import { Segment, Container, Header, List, Item, Grid, Icon, Message } from 'semantic-ui-react'

const _releaseStateSymbols = {
  'alpha':  'α',
  'beta':   'β'
}

const ReleaseId = ( { releaseId } ) => (
  <span title={`${releaseId.state} #${releaseId.iteration}`}>
    <i>Release {_releaseStateSymbols[releaseId.state]||releaseId.state}{releaseId.iteration}</i>
  </span>
)


const UserLink = ( { u } ) => (<QLink to={`/u/${u}`}>@{u}</QLink>)

export default WhatsNewRoute = React.createClass({

  propTypes: {
    currUser: PropTypes.object          // Can be null (if user is not logged in)
  },
  
  /** React callback - before render() is called */
  getInitialState: function() {
    return {
      releaseIdx: 0       // Index into mgbReleaseInfo[] for currently viewed release
    }
  },

  componentDidMount: function() {
    this.handleUserSawNews(this.latestRelTimestamp())
  },
  
  /** This is called when the WhatsNew popup has been clicked and shown. 
   *  We are to note the current timestamp of the latest release in the user profile 
   */
  handleUserSawNews: function(latestNewsTimestampSeen)
  {
    let currUser = this.props.currUser
    if (currUser && currUser.profile.latestNewsTimestampSeen !== latestNewsTimestampSeen)
    {      
      Meteor.call('User.updateProfile', currUser._id, {
        "profile.latestNewsTimestampSeen": latestNewsTimestampSeen
      }, (error) => {
        if (error)
          console.error("Could not update profile with What's New timestamp")      
      })      
    }
  },  
  
  latestRelTimestamp: function()
  {
    return mgbReleaseInfo.releases[0].timestamp
  },

  handleReleaseClicked: function (releaseIdx)
  {
    this.setState( { "releaseIdx": releaseIdx} )
  },

  headerMessage: (
    <Segment raised padded>
      <Header>
        My Game Builder is in <em>Semi-Secret Beta</em> test...
        <br />
        <small>
          ...actively developed by <UserLink u='dgolds'/>, <UserLink u='stauzs'/> and <UserLink u='guntis'/>
        </small>
      </Header>
      <p>
        You are very welcome to use this new MyGameBuilder site and give us feedback 
        using the <i className="chat icon" />chat panel on the right hand side of the screen
      </p>
      <List className='bulleted'>
        <List.Item>We are testing with Chrome, Firefox and Safari, but for best results now, use <a href='https://www.google.com/chrome/'> Google's Chrome browser</a> on Windows/Mac/Linux.</List.Item>
      </List>
      <Message warning icon>
        <Icon name='spy' />
        <Message.Content>
          <Message.Header>Shhh</Message.Header>
          <p>
            Please <em>do NOT</em> post our <a href='https://v2.mygamebuilder.com'>v2.mygamebuilder.com</a> link to public sites like Forums, Facebook, ProductHunt, Reddit, SlashDot, HackerNews etc <em>YET</em>. We aren't quite ready for big groups yet!
          </p>
          <p>
            It's OK to directly ask some friends or family to try it though if you like, as long as they follow this rule.
          </p>
        </Message.Content>
      </Message>        
      <p>
        See what's coming soon in our <QLink to="/roadmap">feature roadmap</QLink>.
      </p>
    </Segment>
  ),

  render: function() {
    return (
      <div>
        <Segment basic>
          <Container>
            <Header as='h2'><Icon name='info circle' />What's New</Header>
            { this.headerMessage }
            { this.renderNews() }
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
    const rel = mgbReleaseInfo.releases[releaseIdx]
    const ago = moment(new Date(rel.timestamp)).fromNow() 

    return (
      <Grid columns={2} padded relaxed divided className='equal height'>
        <Grid.Column>
          <Header as='h4' content='MGB updates' />
          { this.renderNewsMgbVersionsColumn() }
        </Grid.Column>
        <Grid.Column>
          <Header as='h4'>
            Changes in v{rel.id.ver}&nbsp;&nbsp;&nbsp;<small><ReleaseId releaseId={rel.id}/>&emsp;{ago}</small>
          </Header>
          { this.renderNewsRelChangesColumn() }
        </Grid.Column>
      </Grid>
    )
  },
    
  /** ct is a string from mgbReleaseInfo.releases[].changes[].type */
  getIconNameForChangeType: function(ct) {
    const iconNames = 
      { 
        "feature":     "green plus",
        "improvement": "grey plus",
        "bugfix":      "red bug", 
        "removed":     "red remove" 
      }

    return iconNames[ct]
  },

  /** This is the left column. Uses React's state.releaseIdx */
  renderNewsMgbVersionsColumn: function() {
    const rels = mgbReleaseInfo.releases
    const activeRelIdx = this.state.releaseIdx

    return (
      <Item.Group link >
        { rels.map( (r, idx) =>  {
          const sty = { 
            backgroundColor: `rgba(0,0,0, ${activeRelIdx === idx ? 0.08 : 0})`,
            padding: '6px'
          }
          const ago = moment(new Date(r.timestamp)).fromNow()
          return (
            <Item key={r.timestamp} style={sty} onClick={this.handleReleaseClicked.bind(this, idx)}>
              <Item.Content>
                <Item.Header>
                  v{r.id.ver}&nbsp;&nbsp;&nbsp;<small><ReleaseId releaseId={r.id}/></small>
                </Item.Header>
                <Item.Meta>
                  {ago}
                </Item.Meta>
                <Item.Description>
                  <List>
                    { r.changes.map( (c,idx) => (
                      <List.Item key={idx} icon={ this.getIconNameForChangeType(c.type)} description={c.changeName} />
                      ) )  }
                    <br />
                  </List>
                </Item.Description>
              </Item.Content>
            </Item>
          )
        })
        }
      </Item.Group>
    )
  },
  
  /** This is the right column. Uses React's state.releaseIdx */
  renderNewsRelChangesColumn: function() {
    const relIdx = this.state.releaseIdx
    const rel = mgbReleaseInfo.releases[relIdx]
    
    return (
      <Item.Group icon>
        { rel.changes.map( (c) => {
          return (
            <Item key={c.changeName} className='animated fadeIn'>
              <Icon size='large' name={ this.getIconNameForChangeType(c.type) } />&emsp;
              <Item.Content>
                <Item.Header><small>{c.changeName}</small></Item.Header>
                <Item.Meta>
                  <p>{ c.changeSummary }</p>
                  { c.otherUrls && c.otherUrls.length && c.otherUrls.length > 0 ?  
                    (
                      <ul>
                      { c.otherUrls.map( (u, idx) => (<li key={idx}><a href={u.href} key={idx} target="_blank">{u.txt}</a></li>) )
                      }
                    </ul>
                    ) : null
                  }
                </Item.Meta>
              </Item.Content>
            </Item>
          )
        })
        }
      </Item.Group>
    )
  }
})