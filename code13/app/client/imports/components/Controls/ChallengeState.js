import React from 'react'
import { Popup, Label, Icon } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const ChallengeState = ({ ownername, asIcon, style }) => (
  <Popup
    size="small"
    on="hover"
    hoverable
    position="bottom right"
    trigger={
      asIcon ? (
        <Icon name="checked calendar" color="orange" style={style} />
      ) : (
        <Label
          color="orange"
          id="mgbjr-asset-edit-header-right-challenge"
          size="small"
          style={style}
          icon={{ name: 'checked calendar', fitted: true, style: { marginRight: 0 } }}
        />
      )
    }
  >
    <Popup.Header>Skills Challenge Asset</Popup.Header>
    <Popup.Content>
      <div>This Asset was created automatically by a Skills Challenge or Code Tutorial.</div>
      <div style={{ marginTop: '1em' }}>
        <QLink to={`/u/${ownername}/assets`} query={{ showChallengeAssets: '1' }}>
          List {ownername}'s Skill Challenge Assets
        </QLink>
      </div>
      <div style={{ marginTop: '1em' }}>
        <QLink to="/learn/code/intro">Intro to Coding</QLink>
        <br />
        <QLink to="/learn/code/advanced">Advanced Coding</QLink>
        <br />
        <QLink to="/learn/code/phaser">Game Development Concepts</QLink>
      </div>
    </Popup.Content>
  </Popup>
)

export default ChallengeState
