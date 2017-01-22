import React, { Component } from 'react'
import SwipeableViews from 'react-swipeable-views';
import { Sidebar, Segment, Button, Menu, Image, Icon, Header } from 'semantic-ui-react'
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
};




class SidebarBottomOverlay extends Component {
  state = { visible: true,
     index: 1
   }

handleChangeTabs = (value) => () => {
    this.setState({
      index: value,
    });
  };

  handleChangeIndex = (index) => {
    this.setState({
      index,
    });
  };

  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const { visible, index } = this.state
    return (
      <div>

     <SwipeableViews index={index} onChangeIndex={this.handleChangeIndex}>
    <div style={Object.assign({}, styles.slide, styles.slide1)}>
      slide n°1
    </div>
    <div style={Object.assign({}, styles.slide, styles.slide2)}>
      slide n°2
    </div>
    <div style={Object.assign({}, styles.slide, styles.slide3)}>
      slide n°3
    </div>
  </SwipeableViews>
        <Button onClick={this.toggleVisibility}>Toggle Visibility</Button>
        <Sidebar.Pushable as={Segment}>
          <Sidebar as={Menu} animation='overlay' direction='bottom' visible={visible} inverted>
            <Menu.Item name='home'onClick={this.handleChangeTabs(0)}>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item name='gamepad'onClick={this.handleChangeTabs(1)}>
              <Icon name='gamepad' />
              Games
            </Menu.Item>
            <Menu.Item name='camera'>
              <Icon name='camera' />
              Channels
            </Menu.Item>
          </Sidebar>
          <Sidebar.Pusher>
            <Segment basic>
              <Header as='h3'>Application Content</Header>
              <Image src='http://semantic-ui.com/images/wireframe/paragraph.png' />
            </Segment>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    )
  }
}

export default SidebarBottomOverlay