import React from 'react'
import { Grid, Header, List, Segment } from 'semantic-ui-react'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import UserBioCard from '/client/imports/components/Users/UserBioCard'
import QLink from '/client/imports/routes/QLink'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import BadgesSegment from '/client/imports/components/Dashboard/Badges/BadgesSegment'

export default class StudentProfile extends React.Component {
  render() {
    const { currUser, canEdit, user, handleAvatarChange, classroom } = this.props

    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = user && user.profile

    const headerStyle = {
      color: 'lightgrey',
      fontSize: '2.5em',
      textAlign: 'center',
    }

    const SchoolNameStyle = {
      fontSize: '1.2em',
      textAlign: 'center',
    }

    const rowStyle = {
      minHeight: '18em',
      marginBottom: '1em',
    }

    const titleStyle = {
      fontSize: '2em',
      textAlign: 'center',
    }

    const secondRowStyle = {
      minHeight: '14em',
      marginBottom: '1em',
    }

    return (
      <Grid columns={16} padded style={containerStyle}>
        <Grid.Column width={3} />
        <Grid.Column width={10}>
          <Header as="h1" content={`${user && user.username}'s Profile`} style={headerStyle} />
          <Grid columns={16}>
            <Grid.Row>
              <Grid.Column width={5}>
                <Segment raised color="blue" style={rowStyle}>
                  {/* Change avatar for classroom later  */}
                  <Header as="h1" style={titleStyle}>
                    {user && user.username}
                  </Header>
                  <ImageShowOrChange
                    id="mgbjr-profile-avatar"
                    maxHeight="9em"
                    maxWidth="auto"
                    imageSrc={avatar}
                    header="User Avatar"
                    canEdit={canEdit}
                    canLinkToSrc={canEdit}
                    handleChange={url => handleAvatarChange(url)}
                  />
                  <List>
                    <List.Item>
                      <QLink to={`/user/${currUser.username}/classroom/${classroom._id}`}>
                        <List.Content style={SchoolNameStyle}>{classroom && classroom.name}</List.Content>
                      </QLink>
                    </List.Item>
                    <List.Item>
                      <List.Content style={SchoolNameStyle}>AIE</List.Content>
                    </List.Item>
                  </List>

                  {/* TODO: create a 1:1 DM chat for students with their teacher */}
                  {/* <List>
                      <List.Item>
                        <List.Content style={ChatFontStyle}>
                           <List.Icon name="chat" color="blue" />Student Chat 
                        </List.Content>
                      </List.Item>
                    </List> */}
                </Segment>
              </Grid.Column>

              <Grid.Column width={11}>
                <UserBioCard {...this.props} canEdit={canEdit} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={16}>
                <Segment raised color="yellow" style={secondRowStyle}>
                  <Header as="h3" content={`${user && user.username}'s Published Games`} />
                  <UserProfileGamesList user={user} currUser={currUser} />
                </Segment>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={16}>
                <Segment color="red">
                  <Header raised as="h3" content={`${user && user.username}'s Badges`} />
                  <BadgesSegment currUser={user} />
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Grid.Column>
        <Grid.Column width={3} />
      </Grid>
    )
  }
}
