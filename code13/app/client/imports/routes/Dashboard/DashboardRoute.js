import React from 'react'
import * as S from 'semantic-ui-react'

const DashboardRoute = ( { currUser, handleSetCurrentlyEditingAssetInfo } ) => (
    <S.Segment>
        <span>yo {currUser ? currUser.username : 'guest'}</span>
        <S.Button onClick={() => handleSetCurrentlyEditingAssetInfo()} content='pushme'/>
    </S.Segment>
)

export default DashboardRoute