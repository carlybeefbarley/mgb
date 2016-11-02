import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { ActivityTypes } from '/imports/schemas/activity.js'
import { AssetKinds } from '/imports/schemas/assets'
import moment from 'moment'
import { Feed, Icon } from 'semantic-ui-react'

const _propTypes = {
  activity:    PropTypes.array.isRequired  // An activity Stream passed down from the App and passed on to interested components
}

const ActivityExtraDetail = (props) => {
  const { act } = props

  if (act.activityType.startsWith("asset.")) {
    const assetKindIconClassName = AssetKinds.getIconClass(act.toAssetKind)
    const assetName = act.toAssetName || `(untitled ${AssetKinds.getName(act.toAssetKind)})`
    const assetThumbnailUrl = "/api/asset/thumbnail/png/" + act.toAssetId
    const linkTo = act.toOwnerId ? 
              `/u/${act.toOwnerName}/asset/${act.toAssetId}` :   // New format as of Jun 8 2016
              `/assetEdit/${act.toAssetId}`                       // Old format. (LEGACY ROUTES for VERY old activity records). TODO: Nuke these and the special handlers

    return (
      <div>
        <Feed.Extra text>
          <Icon name={assetKindIconClassName} />
          <QLink to={linkTo}>
            { act.toOwnerId === act.byUserId ? assetName : `${assetName}@${act.toOwnerName}` }
          </QLink>
        </Feed.Extra>

        <Feed.Extra images>
          <QLink to={linkTo}>
            <img src={assetThumbnailUrl} style={{ width: "auto", maxWidth: "12em", maxHeight: "6em" }} />
          </QLink>
        </Feed.Extra>
      </div>
    )
  }

  return null
}

const RenderOneActivity = (props) => {
  const { act } = props
  const { byUserName, byUserId } = act
  const ago = moment(act.timestamp).fromNow()   // TODO: Make reactive
  const iconClass = ActivityTypes.getIconClass(act.activityType)  

  return (
    <Feed.Event style={{borderBottom: "thin solid rgba(0,0,0,0.10)"}}>
      
      <Feed.Label>
        <QLink to={"/u/" + byUserName}>
          <img src={`/api/user/${byUserId}/avatar`}></img>
        </QLink>
      </Feed.Label>

      <Feed.Content>

        <Feed.Summary>
          <Feed.User as='div'>
            <QLink to={"/u/" + byUserName}>{ byUserName }</QLink>
          </Feed.User>
          <Feed.Date>{ago}</Feed.Date>
        </Feed.Summary>

        <Feed.Meta>
          <Icon name={iconClass} />&nbsp;{act.description}
        </Feed.Meta>

        <ActivityExtraDetail act={act} />
      
      </Feed.Content>       
    </Feed.Event>
  )
}

const fpActivity = (props) => (
  <Feed size="small">
    { props.activity.map((act) => ( <RenderOneActivity act={act} key={act._id} /> ) ) }
  </Feed>
)
 
fpActivity.propTypes = _propTypes
export default fpActivity