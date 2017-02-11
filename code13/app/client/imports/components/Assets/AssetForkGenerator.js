import _ from 'lodash'
import moment from 'moment'
import React, { PropTypes } from 'react'
import { Popup, Label, Button } from 'semantic-ui-react'

const AssetForkGenerator = ( { asset, canFork, isForkPending, doForkAsset } ) => {
  const numChildren = _.isArray(asset.forkChildren) ? asset.forkChildren.length : 0
  const fp = (_.isArray(asset.forkParentChain) && asset.forkParentChain.length > 0) ? asset.forkParentChain[0] : null
  const children = _.map(asset.forkChildren, f => { 
    const ago = moment(f.forkDate).fromNow()        // It's just a popup, so no need to make it reactive
    return (
      <div key={f.assetId} >
        &nbsp;<QLink to={`/u/${f.forkedByUserName}`}>
          {f.forkedByUserName}
        </QLink>
        {' : '}
        <QLink to={`/u/${f.forkedByUserName}/asset/${f.assetId}`}>
          <small style={{color: 'blue'}}>{f.assetId}</small>
        </QLink>
        <small style={{color: '#c8c8c8'}}>&ensp;{ago}</small>
      </div>
    )
  })

  return (
    <Popup
        hoverable
        wide
        size='tiny'
        trigger={(
          <Label
              basic
              color={isForkPending ? 'orange' : null}
              size='small'
              icon={{ name: 'fork', color: (fp ? 'blue' : null) }}
              content={numChildren}
              />
        )}
        positioning='bottom right' >
        <Popup.Header>
          { numChildren ? `${numChildren} Forks` : 'Fork Asset' }
        </Popup.Header>
        <Popup.Content>
          <p>
            Forks are copies of an existing Asset where the 'parent-to-child' chain is tracked.
          </p>
          <p>
            <Button 
              as='div'
              onClick={doForkAsset}
              disabled={isForkPending || !canFork}
              size='tiny'
              compact 
              color={ isForkPending ? 'orange' : 'green' }
              icon='fork'
              data-tooltip={canFork ? `Fork your own copy of ${asset.dn_ownerName}:${asset.name} to your account` : 'You are not logged in so cannot fork'}
              data-position='left center'
              data-inverted=''
              data-variation='tiny'
              content={ isForkPending ? 'Forking...' : 'Create Fork' } />
            </p>
          <p>
            { !fp ? (
                <div>
                  <b>Originally Created Content</b>
                  <div>&nbsp;Not forked from another Asset within this system</div>
                </div>
            ) : (
                <div>
                  <b>Forked from:</b>
                  <div>
                    &nbsp;
                    <QLink to={`/u/${fp.parentOwnerName}`}>
                      {fp.parentOwnerName}
                    </QLink>
                    {' : '}
                    <QLink to={`/u/${fp.parentOwnerName}/asset/${fp.parentId}`}>
                      <span style={{color: 'blue'}}>{fp.parentAssetName}</span>
                    </QLink>
                    <small style={{color: '#c8c8c8'}}>&ensp;{moment(fp.forkDate).fromNow() }</small>
                  </div>
                </div>
            )}
          </p>
          <p style={{maxHeight: '200px', overflow: 'scroll'}}>
            <b>{ numChildren } Forks:</b>
            { numChildren ? children : <div>&nbsp;(None yet)</div> }
          </p>
        </Popup.Content>
      </Popup>
  )
}

AssetForkGenerator.propTypes = {
  asset:              PropTypes.object.isRequired,
  canFork:            PropTypes.bool.isRequired,
  isForkPending:      PropTypes.bool.isRequired,
  doForkAsset:        PropTypes.func.isRequired       // Meteor.call callback style (error, result). Result is new doc Id
}

export default AssetForkGenerator