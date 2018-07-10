import PropTypes from 'prop-types'
import React from 'react'
import { Label, List, Popup } from 'semantic-ui-react'
import { templateCode } from './templates/TemplateCode.js'
import { templateTutorial } from './templates/TemplateTutorial.js'

const _templateKind = asset => (asset.kind === 'tutorial' ? templateTutorial : templateCode)

const CodeStarter = ({ asset, handlePasteCode }) => (
  <div className="active content">
    No code yet... Start typing, or choose a starter template:
    <List divided selection>
      {_templateKind(asset).map(item => (
        <Popup
          key={item.label}
          size="small"
          position="left center"
          trigger={
            <List.Item
              style={{ textAlign: 'center' }}
              id={'mgbjr-EditCode-template-' + item.label.replace(/ /g, '-')}
              onClick={() => handlePasteCode(item)}
            >
              <Label color="green" horizontal content={item.label} />
            </List.Item>
          }
          header={item.label}
          content={item.description}
        />
      ))}
    </List>
  </div>
)

CodeStarter.propTypes = {
  asset: PropTypes.object.isRequired, // An asset, expected to be a code-style asset (kind='code' or kind='tutorial')
  handlePasteCode: PropTypes.func.isRequired,
}

export default CodeStarter
