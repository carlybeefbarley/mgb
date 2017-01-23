import React from 'react'
import { Header, List } from 'semantic-ui-react'

const _getFlipsideUrl = () => {
  const l = window.location
  const newHost = l.host.startsWith("localhost") ? "https://v2.mygamebuilder.com" : "http://localhost:3000"
  return `${newHost}${l.pathname}${l.search}`
}

export default fpSuperAdmin = () => {
  const linkLi = (txt, url) => (<List.Item><a target="_blank" href={url}>{txt}</a></List.Item>)

  return (
    <div>
      <Header sub>Dev Quicklinks</Header>
      <List className='bulleted'>
        { linkLi("localhost/v2 flipside", _getFlipsideUrl()) }
        { linkLi("Slack", "https://devlapse.slack.com/messages/mgb-dev") }
        { linkLi("Github", "https://github.com/devlapse/mgb") }
        { linkLi("Stardust", "https://technologyadvice.github.io/stardust/") }
        { linkLi("SemanticUI", "http://semantic-ui.com/") }
        { linkLi("TimeTracker spreadsheet", "https://docs.google.com/spreadsheets/d/1dq1FjxoHfMl49R-dIoxi7kpTZFi6HCHlz78-9QUO-Ds/edit#gid=131993583")}
      </List>

      <Header sub>Stock Assets Quicklinks</Header>
      <List className='bulleted'>
        { linkLi("Stock Assets spreadsheet", "https://docs.google.com/spreadsheets/d/1LMmh_dTbBS51Nus8zLfXNAusoiUodBcJSMFzJz1agsg/edit#gid=1512032697")}
        { linkLi("'!vault/Stock Assets' view", "/u/!vault/assets?project=Stock+Assets")}
        { linkLi("'!vault/Tutorial Assets' view", "/u/!vault/assets?project=Tutorial+Data")}
        
      </List>

      <Header sub>Deployment/Monitoring Quicklinks</Header>
      <List className='bulleted'>
        { linkLi("Google Analytics (RT)", "https://analytics.google.com/analytics/web/?authuser=0#realtime/rt-overview/a82379171w121883491p127579308/%3F_r.dsa%3D1%26_.advseg%3D%26_.useg%3D%26_.sectionId%3D/") }
        { linkLi("TrackJs (client errors)", "https://my.trackjs.com/messages") }
        { linkLi("Galaxy (PaaS)", "https://galaxy.meteor.com/app/v2.mygamebuilder.com") }
        { linkLi("Kadira (Meteor stats)", "https://ui.kadira.io/apps/e7zK3YN4QZijYhpmY/dashboard/overview") }
        { linkLi("mLab telemetry", "https://mlab.com/realtime-dashboard?server=s-ds021730-a0") }
        { linkLi("mLab cluster", "https://mlab.com/clusters/rs-ds021730") }
      </List>
    </div>
  )
}