import React from 'react'
import { Accordion, Button, Header } from 'semantic-ui-react'
import { utilShowChatPanelChannel } from '/client/imports/routes/QLink'
import { mgbAjax } from '/client/imports/helpers/assetFetchers'

export default class FaqSegment extends React.Component {
  state = { data: [] }

  componentDidMount() {
    mgbAjax(`/api/asset/code/!vault/dashboard.faq`, (err, str) => {
      if (err) console.log('error', err)
      else {
        const data = JSON.parse(str)
        this.setState({ data })
      }
    })
  }

  openHelpChat = () => utilShowChatPanelChannel(window.location, `G_MGBHELP_`)

  render() {
    const { data } = this.state

    return (
      <div>
        <Header as="h3" color="grey" textAlign="center" content="FAQ" />
        <Accordion
          styled
          fluid
          panels={data.map(item => ({
            key: item.question,
            title: item.question,
            content: {
              key: item.question + '-content',
              content: <p style={{ wordBreak: 'break-word' }}>{item.answer}</p>,
            },
          }))}
        />
        <Button fluid attached="bottom" content="Ask for help" onClick={this.openHelpChat} />
      </div>
    )
  }
}
