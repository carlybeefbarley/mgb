import React, { PropTypes } from 'react'
import { Button, Icon, Segment, List, Header } from 'semantic-ui-react'
import FaqItem from './FaqItem'
import { utilShowChatPanelChannel } from '/client/imports/routes/QLink'
import { mgbAjax } from '/client/imports/helpers/assetFetchers'

export default class FaqSegment extends React.Component {
  state = { isCollapsed: true, data: [] }

  componentDidMount() {
    mgbAjax(`/api/asset/code/!vault/dashboard.faq`, (err, str) => {
      if (err) console.log('error', err)
      else {
        const data = JSON.parse(str)
        this.setState({ data: data })
      }
    })
  }

  toggleCollapse = () => this.setState({ isCollapsed: !this.state.isCollapsed })

  openHelpChat = () => utilShowChatPanelChannel(window.location, `G_MGBHELP_`)

  render() {
    return (
      <Segment>
        <Header as="h3">
          FAQ
          <Icon
            name={'angle double ' + (this.state.isCollapsed ? 'down' : 'up')}
            style={{ float: 'right' }}
            onClick={this.toggleCollapse}
          />
        </Header>
        <div style={{ display: this.state.isCollapsed ? 'none' : 'block' }}>
          <Button
            onClick={this.openHelpChat}
            style={{ margin: '0 auto', display: 'block' }}
            size="large"
            content="Ask for Help"
          />
          <List>
            {this.state.data.map(item => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </List>
        </div>
      </Segment>
    )
  }
}
