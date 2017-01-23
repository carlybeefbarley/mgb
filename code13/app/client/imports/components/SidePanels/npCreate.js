import React, { PropTypes } from 'react'
import QLink from '/client/imports/routes/QLink'
import { Header, Icon, Item } from 'semantic-ui-react'

const npCreate = ( { currUser } ) => (
  <div className="ui large vertical attached inverted fluid menu" style={{backgroundColor: "transparent"}}>
    <Item>
      <Header as='h3' inverted style={{textAlign: "center"}}>
        <Icon name='pencil' />
        Create
      </Header>
    </Item>

    { currUser &&
      <QLink 
          id='mgbjr-np-create-myAssets-hdr'
          to={`/u/${currUser.profile.name}/assets`}
          className="header item">
        My Assets
      </QLink>
    }
    { currUser &&
      <div className="menu">
        <QLink 
            id='mgbjr-np-create-myAssets'
            to={`/u/${currUser.profile.name}/assets`}
            className="item" 
            title="List my Assets">
          <Icon name='pencil' /> List My Assets
        </QLink>
        <QLink 
            id='mgbjr-np-create-createNewAsset'
            to={`/assets/create`} 
            className="item" 
            title="Create New Asset">
          <Icon color='green' name='pencil' /> Create New Asset
        </QLink>
      </div>
    }
    { !currUser && 
      <QLink 
          to="/signup" 
          style={{marginTop: '8em'}} 
          className="item" 
          key="join">Sign Up to Create
      </QLink>  
    }
    { currUser && 
      <QLink 
          id='mgbjr-np-my-projects-hdr'
          to={`/u/${currUser.profile.name}/projects`} 
          className="header item">
        My Projects
      </QLink>
    }
    { currUser && 
      <div className="menu">
        <QLink 
            id='mgbjr-np-create-list-my-projects'
            to={`/u/${currUser.profile.name}/projects`} 
            className="item">
          <Icon name='sitemap' /> List My Projects
        </QLink>
      </div>    
    }
    { currUser && 
      <div className="menu">
        <QLink 
            id='mgbjr-np-create-project'
            to={`/u/${currUser.profile.name}/projects/create`} 
            className="item" 
            title="Create New Project">
          <Icon color='green' name='sitemap' /> Create New Project
        </QLink>
      </div>
    }
  </div>
)

npCreate.propTypes = {
  currUser:           PropTypes.object              // Currently Logged in user. Can be null/undefined
}

export default npCreate