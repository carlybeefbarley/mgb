import React, { Component } from 'react'
import { Grid, Sidebar, Segment, Button, Menu, Image, Icon, Header } from 'semantic-ui-react'
import SwipeableViews from 'react-swipeable-views'

const GridExamplePadded = () => (
  <div>
    <Grid columns={3} padded>
      <Grid.Row>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="user" size="huge" />
            Profile
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="bullhorn" size="huge" />
            What's New
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="map" size="huge" />
            Roadmap
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="users" size="huge" />
            Users
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="feed" size="huge" />
            Feed
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="exclamation" size="huge" />
            Dailies
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="star" size="huge" />
            Badges
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="sitemap" size="huge" />
            Projects
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="winner" size="huge" />
            Competitions
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="mail outline" size="huge" />
            Send Feedback
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="bell outline" size="huge" />
            Notifications
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="graduation" size="huge" />
            Learn
          </Header>
        </Grid.Column>
      </Grid.Row>

      <Grid.Row>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="question" size="huge" />
            Help
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="setting" size="huge" />
            Settings
          </Header>
        </Grid.Column>
        <Grid.Column>
          <Header as="h3" icon>
            <Icon circular inverted name="log out" size="huge" />
            Log Out
          </Header>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  </div>
)

const styles = {
  slide: {
    padding: 15,
    minHeight: 100,
    color: '#fff',
  },
  slide1: {
    background: '#FEA900',
  },
  slide2: {
    background: '#B3DC4A',
  },
  slide3: {
    background: '#6AC0FF',
  },
}

class SidebarBottomOverlay extends Component {
  state = {
    visible: true,
    index: 1,
  }

  handleChangeTabs = value => () => {
    this.setState({
      index: value,
    })
  }

  handleChangeIndex = index => {
    this.setState({
      index: 0,
    })
  }

  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const { visible, index } = this.state
    return (
      <div>
        {this.state.showButtons && <GridExamplePadded />}
        {!this.state.showButtons && (
          <div>
            <SwipeableViews index={index} onChangeIndex={this.handleChangeIndex}>
              <div style={Object.assign({}, styles.slide, styles.slide1)}>slide n°1</div>
              <div style={Object.assign({}, styles.slide, styles.slide2)}>slide n°2</div>
              <div style={Object.assign({}, styles.slide, styles.slide3)}>slide n°3</div>
            </SwipeableViews>
            <Button onClick={this.toggleVisibility}>Toggle Visibility</Button>
            <Sidebar.Pushable as={Segment}>
              <Sidebar as={Menu} animation="overlay" direction="bottom" visible={visible} inverted>
                <Menu.Item name="home" onClick={this.handleChangeTabs(0)}>
                  <Icon name="home" />
                  Home
                </Menu.Item>
                <Menu.Item name="gamepad" onClick={this.handleChangeTabs(1)}>
                  <Icon name="gamepad" />
                  Games
                </Menu.Item>
                <Menu.Item name="camera" onClick={this.handleChangeTabs(2)}>
                  <Icon name="camera" />
                  Channels
                </Menu.Item>
              </Sidebar>
              <Sidebar.Pusher>
                <Segment basic>
                  <Header as="h3">Application Content</Header>
                  <Image src="http://semantic-ui.com/images/wireframe/paragraph.png" />
                </Segment>
              </Sidebar.Pusher>
            </Sidebar.Pushable>
          </div>
        )}
        <Button onClick={() => this.setState({ showButtons: !this.state.showButtons })}>...</Button>
      </div>
    )
  }
}

export default SidebarBottomOverlay
