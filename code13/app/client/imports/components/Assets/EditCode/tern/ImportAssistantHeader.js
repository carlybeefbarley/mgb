import PropTypes from 'prop-types'
import React from 'react'
import { Divider, Label, Popup } from 'semantic-ui-react'
import _ from 'lodash'
import QLink from '/client/imports/routes/QLink'
import settings from '/imports/SpecialGlobals'

export default class ImportAssistantHeader extends React.Component {
  static propTypes = {
    knownImports: PropTypes.array, // list of known imports so we can display relevant buttons
  }

  render() {
    const { knownImports } = this.props

    return (
      <span>
        {_.map(settings.editCode.popularLibs, lib => {
          if (!_.some(knownImports, ki => ki.lib === lib.import)) return null
          const packageJsx = (
            <strong>
              <code>{lib.import}</code>
            </strong>
          )
          const thisKi = _.find(knownImports, { lib: lib.import })

          return (
            <Popup
              key={lib.import}
              on="hover"
              wide
              hoverable
              position="bottom right"
              mouseEnterDelay={50}
              trigger={<Label basic size="mini" color="green" content={lib.import} />}
            >
              <Popup.Header>Imported Package: {packageJsx}</Popup.Header>
              <Popup.Content>
                <p>{lib.descLong}</p>
                <p>
                  {packageJsx} overview at{' '}
                  <a href={lib.landingPageUrl} target="_blank">
                    <small>{lib.landingPageUrl}</small>
                  </a>
                </p>
                <p>
                  {packageJsx} API docs at{' '}
                  <a href={lib.apiDocsPageUrl} target="_blank">
                    <small>{lib.apiDocsPageUrl}</small>
                  </a>
                </p>
                {lib.tutorialsInternalLink && (
                  <p>
                    {packageJsx} MGB Tutorials at{' '}
                    <QLink to={lib.tutorialsInternalLink}>
                      <small>{lib.tutorialsInternalLink}</small>
                    </QLink>
                  </p>
                )}
                {thisKi &&
                thisKi.url && (
                  <div>
                    <Divider />
                    <p>
                      <small>
                        This {packageJsx} package is dynamically loaded from{' '}
                        <a href={thisKi.url}>{thisKi.url}</a>
                      </small>
                    </p>
                  </div>
                )}
              </Popup.Content>
            </Popup>
          )
        })}
      </span>
    )
  }
}
