import _ from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'
import { Popup, Label, Button, Icon, Segment } from 'semantic-ui-react'
import QLink from '/client/imports/routes/QLink'

const AssetForkGenerator = ({ asset, canFork, isForkPending, doForkAsset }) => {
  const numChildren = _.isArray(asset.forkChildren) ? asset.forkChildren.length : 0
  const fpLen = _.isArray(asset.forkParentChain) ? asset.forkParentChain.length : 0
  const children = _.reverse(
    _.map(asset.forkChildren, f => {
      const ago = moment(f.forkDate).fromNow() // It's just a popup, so no need to make it reactive
      return (
        <div key={f.assetId}>
          &nbsp;<QLink to={`/u/${f.forkedByUserName}`}>{f.forkedByUserName}</QLink>
          {' : '}
          <QLink to={`/u/${f.forkedByUserName}/asset/${f.assetId}`}>
            <small style={{ color: 'blue' }}>{f.assetId}</small>
          </QLink>
          <small style={{ color: '#c8c8c8' }}>&ensp;{ago}</small>
        </div>
      )
    }),
  )

  return (
    <Popup
      hoverable
      wide
      size="tiny"
      trigger={
        <Label
          basic
          id="mgbjr-asset-edit-header-right-fork"
          color={isForkPending ? 'orange' : null}
          size="small"
          icon={{ name: 'fork', color: fpLen > 0 ? 'blue' : null }}
          content={numChildren}
        />
      }
      position="bottom right"
    >
      <Popup.Header>{numChildren ? `${numChildren} Forks` : 'Fork Asset'}</Popup.Header>
      <Popup.Content>
        <Segment basic>
          Forks are copies of an existing Asset where the 'parent-to-child' chain is tracked.
          <Button
            as="div"
            onClick={doForkAsset}
            disabled={isForkPending || !canFork}
            size="tiny"
            style={{ margin: '1em 1em 0em 2em' }}
            compact
            color={isForkPending ? 'orange' : 'green'}
            icon="fork"
            content={isForkPending ? 'Forking...' : 'Fork this Asset to my Account'}
          />
        </Segment>

        {fpLen === 0 ? (
          <div>
            <b>Originally created Content</b>
            <div>&emsp;Not forked from another Asset within this system</div>
          </div>
        ) : (
          <div>
            <b>Forked from:</b>
            <div>
              {_.reverse(
                _.map(asset.forkParentChain, (fp, idx) => (
                  <div key={fp.forkDate} style={{ paddingLeft: `${(fpLen - idx) * 4 + 4}px` }}>
                    {idx === fpLen - 1 ? '' : '...'}
                    <QLink to={`/u/${fp.parentOwnerName}`}>{fp.parentOwnerName}</QLink>
                    {' : '}
                    <QLink to={`/u/${fp.parentOwnerName}/asset/${fp.parentId}`}>
                      <span style={{ color: 'blue' }}>{fp.parentAssetName}</span>
                    </QLink>
                    <small style={{ color: '#c8c8c8' }}>&ensp;{moment(fp.forkDate).fromNow()}</small>
                  </div>
                )),
              )}
            </div>
          </div>
        )}
        <div style={{ marginTop: '1em', maxHeight: '200px', overflow: 'auto' }}>
          <b>
            <Icon name="fork" />
            {numChildren} Forks:
          </b>
          {numChildren ? children : <div>&nbsp;(None yet)</div>}
        </div>
      </Popup.Content>
    </Popup>
  )
}

AssetForkGenerator.propTypes = {
  asset: PropTypes.object.isRequired,
  canFork: PropTypes.bool.isRequired,
  isForkPending: PropTypes.bool.isRequired,
  doForkAsset: PropTypes.func.isRequired, // Meteor.call callback style (error, result). Result is new doc Id
}

export default AssetForkGenerator
