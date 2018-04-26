import PropTypes from 'prop-types'
import React from 'react'
import { Button, Segment, Popup } from 'semantic-ui-react'
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
          return pane.tooltip ? (
            <Popup
              trigger={
                <Button
                  compact
                  size="small"
                  floated="right"
                  key={i}
                  style={{ margin: 0 }}
                  active={this.state.activeIndex === i}
                  icon={pane.icon}
                  onClick={() => this.handleTabClick(i)}
                />
              }
              header={pane.title}
              content={pane.tooltip}
            />
          ) : (
            <Button
              compact
              size="small"
              floated="right"
              key={i}
              title={pane.title}
              style={{ margin: 0 }}
              active={this.state.activeIndex === i}
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
      <div style={{ height: '100%' }}>
        {_.map(panes, (pane, i) => {
          return (
            <div
              key={i}
              style={
                this.state.activeIndex === i ? (
                  {
                    display: 'block',
                  }
                ) : (
                  { display: 'none' }
                )
              }
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
      <div
        style={{
          display: 'flex',
          flexFlow: 'column',
          height: '100%',
        }}
      >
        {this.renderTabs(panes)}
        <Segment raised style={{ height: '100%', margin: 0, overflowY: 'auto' }}>
          {this.renderPanes(panes)}
        </Segment>
      </div>
    )
  }
}
