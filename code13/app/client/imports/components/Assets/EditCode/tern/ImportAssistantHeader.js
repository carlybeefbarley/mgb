import React, { PropTypes } from 'react'
import { Popup, Label } from 'semantic-ui-react'
import _ from 'lodash'
import QLink from '/client/imports/routes/QLink'
import settings from '/imports/SpecialGlobals'

export default class ImportAssistantHeader extends React.Component {
  static propTypes = {
    knownImports:          PropTypes.array            // list of known imports - won't show in the list
  }

  render() {
    const { knownImports } = this.props

    return (
      <span>
        {
          _.map(settings.editCode.popularLibs, lib => {
            if (!_.some(knownImports, ki => (ki.lib === lib.import)))
              return null
            const packageJsx = <strong><code>{lib.import}</code></strong>

            return (
              <Popup
                  key={lib.import}
                  on='hover'
                  wide
                  hoverable
                  position='bottom right'
                  mouseEnterDelay={50}
                  trigger={
                    <Label
                        basic
                        size='mini'
                        color='green'
                        content={lib.import} />
                  } >
                <Popup.Header>
                  Imported Package: {packageJsx}
                </Popup.Header>
                <Popup.Content>
                  <p>{lib.descLong}</p>
                  <p>{packageJsx} overview at <a href={lib.landingPageUrl} target='_blank'>{lib.landingPageUrl}</a></p>
                  <p>{packageJsx} API docs at <a href={lib.apiDocsPageUrl} target='_blank'>{lib.apiDocsPageUrl}</a></p>
                  { lib.tutorialsInternalLink &&
                    <p>{packageJsx} MGB Tutorials at <QLink to={lib.tutorialsInternalLink}>{lib.tutorialsInternalLink}</QLink></p>
                  }
                </Popup.Content>
              </Popup>
            )
          })
        }
      </span>
    )
  }
}
