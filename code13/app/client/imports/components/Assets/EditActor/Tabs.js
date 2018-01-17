import React from 'react'

import { joyrideStore } from '/client/imports/stores'

export default class Tabs extends React.Component {
  constructor() {
    super()
    this.state = { activeTab: 0 }
  }

  render() {
    const tabsJsx = []
    let content = []
    const { tabs } = this.props
    for (let i = 0; i < tabs.length; i++) {
      const disabled = tabs[i].disabled
      if (this.state.activeTab === i) {
        tabsJsx.push(
          <div className="item active primary" key={i}>
            {tabs[i].tab}
          </div>,
        )
        if (disabled)
          content.push(
            <div className="ui message " key={i}>
              This ActorType doesn't use this set of options
            </div>,
          )
        else
          content.push(
            <div className="ui content" key={i}>
              {tabs[i].content}
            </div>,
          )
      } else {
        const id = `mgbjr-edit-actor-tab-${tabs[i].tab.replace(/[^A-Z0-9]/gi, '')}` // #mgbjr-edit-actor-tab-(tab name with whitespace & special chars removed, capitalization preserved)
        tabsJsx.push(
          <div
            id={id}
            className="ui item"
            key={i}
            style={{ color: disabled ? 'gray' : 'black', cursor: disabled ? 'auto' : 'pointer' }}
            onClick={() => {
              joyrideStore.completeTag(`mgbjr-CT-edit-actor-tab-${tabs[i].tab.replace(/[^A-Z0-9]/gi, '')}`)
              this.setState({ activeTab: i })
            }}
          >
            {tabs[i].tab}
          </div>,
        )
        // this makes selecting tab quicker - but also will make all content sluggish on changes
        // content.push(<div className="ui content mgb-hidden" key={i}>{tabs[i].content}</div>)
      }
    }

    return (
      <div style={{ width: '100%', marginTop: '0.75em' }}>
        <div className="tabs ui top attached tabular menu">{tabsJsx}</div>
        <div className="content" style={{ padding: '10px' }}>
          {content}
        </div>
      </div>
    )
  }
}
