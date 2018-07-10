import PropTypes from 'prop-types'
import React from 'react'
import QLink from '/client/imports/routes/QLink'

// Some magic for encoding and expanding asset links that are dragged in.
export const encodeAssetInMsg = asset => `❮${asset.dn_ownerName}:${asset._id}:${asset.name}❯` // See https://en.wikipedia.org/wiki/Dingbat#Unicode ❮  U276E , U276F  ❯

// Render a Chat message nicely using React
const ChatMessage = ({ msg }) => {
  let begin = 0
  let chunks = []
  msg.replace(/❮[^❯]*❯|@[a-zA-Z0-9]+/g, function(e, offset, str) {
    chunks.push(<span key={chunks.length}>{str.slice(begin, offset)}</span>)
    begin = offset + e.length
    const e2 = e.split(':')
    if (e2.length === 3) {
      const userName = e2[0].slice(1)
      const assetId = e2[1]
      const assetName = e2[2].slice(0, -1)
      const link = (
        <QLink key={chunks.length} to={`/u/${userName}/asset/${assetId}`}>
          {userName}:{assetName}
        </QLink>
      )
      chunks.push(link)
      return e
    } else if (e2.length === 2) {
      const userName = e2[0].slice(1)
      const assetId = e2[1].slice(0, -1)
      const link = (
        <QLink key={chunks.length} to={`/u/${userName}/asset/${assetId}`}>
          {userName}:{assetId}
        </QLink>
      )
      chunks.push(link)
      return e
    } else if (e[0] === '@') {
      const userName = e.slice(1)
      chunks.push(
        <QLink key={chunks.length} to={`/u/${userName}`}>
          @{userName}
        </QLink>,
      )
      return e
    } else return e
  })
  chunks.push(<span key={chunks.length}>{msg.slice(begin)}</span>)
  return <span>{chunks}</span>
}

ChatMessage.propTypes = {
  msg: PropTypes.string,
}

export default ChatMessage
