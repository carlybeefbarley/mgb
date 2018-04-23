import PropTypes from 'prop-types'
import React from 'react'
import { Icon, Button, Segment } from 'semantic-ui-react'
import _ from 'lodash'
import './editcode.css'

// Workaround for SUIR Tabs not working with Code Runner
export default class CodeEditorTabs extends React.Component {
  static propTypes = {
    panes: PropTypes.array,
    openCodeRunner: PropTypes.func,
  }

  constructor(props) {
    super(props)
    this.state = { activeIndex: 0 }
  }

  openTabByKey = key => {
    const index = _.findIndex(this.props.panes, { key })
    this.setState({ activeIndex: index })
  }

  handleTabClick = i => {
    this.setState({ activeIndex: i })
  }

  renderTabs = panes => {
    return (
      <Button.Group>
        {_.map(panes, (pane, i) => {
          return (
            <Button
              compact
              size="small"
              floated="right"
              key={i}
              style={{ margin: 0 }}
              active={this.state.activeIndex === i}
              title={pane.title}
              icon={pane.icon}
              onClick={() => this.handleTabClick(i)}
            />
          )
        })}
      </Button.Group>
    )
  }

  // Due to how GameScreen works, all panes have to be
  // mounted, not just the active tab pane
  renderPanes = panes => {
    return (
      <div
        style={{
          display: 'flex',
          flexFlow: 'column',
          height: '100%',
          overflowY: 'auto',
        }}
      >
        {_.map(panes, (pane, i) => {
          return (
            <div
              key={i}
              style={this.state.activeIndex === i ? { display: 'block', flex: '1' } : { display: 'none' }}
            >
              {pane.content}
            </div>
          )
        })}
      </div>
    )
  }

  render() {
    const { panes } = this.props
    return (
      <div style={{ display: 'flex', flexFlow: 'column', height: '100%' }}>
        {this.renderTabs(panes)}
        <Segment className="pane-container" style={{ flex: '1', margin: 0 }}>
          {this.renderPanes(panes)}
        </Segment>
      </div>
    )
  }
}
