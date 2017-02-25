import React from 'react'
import { Popup, Label } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const ChallengeState = ( { ownername } ) => (
  <Popup
    size='small'
    on='hover'
    hoverable
    positioning='bottom right'
    trigger={(
      <Label
          basic
          id="mgbjr-asset-edit-header-right-challenge"
          size='small'
          icon={{ name: 'checked calendar', color: 'orange', fitted: true }}
        />
    )} >
    <Popup.Header>
      Skills Challenge Asset
    </Popup.Header>
    <Popup.Content>
      <div>
        This Asset was created automatically by a Skills Challenge tutorial.
      </div>
      <div style={{marginTop: '1em'}}>
        <QLink to={`/u/${ownername}/assets`} query={{ showChallengeAssets: "1" }}>
          List {ownername}'s Skill Challenge Assets
        </QLink>
      </div>
      <div style={{marginTop: '1em'}}>
        <QLink to='learn/code/javascript' >
          View the Programming Challenges
        </QLink>
      </div>
    </Popup.Content>
  </Popup>
)

export default ChallengeState