import React, { PropTypes } from 'react'
import QLink from '../QLink'
import Footer from '/client/imports/components/Footer/Footer'
import mgbReleaseInfo from '/imports/mgbReleaseInfo'
import moment from 'moment'
import { Segment, Container, Header, List, Item, Grid, Icon } from 'semantic-ui-react'

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
          console.log("Could not update profile with What's New timestamp")      
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
      <Header>My Game Builder v2 is ALPHA and in active development</Header>
      <p>
        You are very welcome to use this new MyGameBuilder site and give us feedback 
        using the <i className="chat icon" />chat panel on the right hand side of the screen
      </p>
      <List className='bulleted'>
        <List.Item>The Sounds, Music, Graphic, Map and Code Asset types are quite stable and can be used safely</List.Item>
        <List.Item>iPad/Tablet usage is quirky/buggy at present (we are working on it)</List.Item>
        <List.Item>For best results now, use Google's Chrome browser on Windows/Mac/Linux.</List.Item>
      </List>
      <p title="However, if you want to help us get the word out when we are ready, message us in Chat!">
        Please do NOT post this v2.mygamebuilder.com link to news sites like 
        Facebook/ProductHunt/Reddit/SlashDot/HackerNews etc. - we aren't ready for prime time yet!
      </p>
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
            <Header as='h2'><Icon name='announcement' />What's New</Header>
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
    const state = rel.id.state === 'alpha' ? 'α' : (rel.id.state + "#")
    const ago = moment(new Date(rel.timestamp)).fromNow() 

    return (
      <Grid columns={2} padded relaxed divided className='equal height'>
        <Grid.Column>
          <Header as='h4' content='MGBv2 updates' />
          { this.renderNewsMgbVersionsColumn() }
        </Grid.Column>
        <Grid.Column>
          <Header as='h4'>
            Changes in v{rel.id.ver}&nbsp;&nbsp;&nbsp;<small><i>{state + rel.id.iteration}</i>&emsp;{ago}</small>
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
          const state = r.id.state === 'alpha' ? 'α' : (r.id.state + "#")
          return (
            <Item key={r.timestamp} style={sty} onClick={this.handleReleaseClicked.bind(this, idx)}>
              <Item.Content>
                <Item.Header>
                  v{r.id.ver}&nbsp;&nbsp;&nbsp;<small><i>{state + r.id.iteration}</i></small>
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
            <Item key={c.changeName} >
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