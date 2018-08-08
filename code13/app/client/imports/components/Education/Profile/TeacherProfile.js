import React from 'react'
import { Grid, Header, List, Segment } from 'semantic-ui-react'
import ImageShowOrChange from '/client/imports/components/Controls/ImageShowOrChange'
import UserBioCard from '/client/imports/components/Users/UserBioCard'
import UserProfileGamesList from '/client/imports/routes/Users/UserProfileGamesList'
import BadgesSegment from '/client/imports/components/Dashboard/Badges/BadgesSegment'
import UserProfileBadgeList from '/client/imports/components/Badges/UserProfileBadgeList'

export default class TeacherProfile extends React.Component {
  render() {
    const { currUser, canEdit, user, handleAvatarChange } = this.props
    const containerStyle = {
      overflowY: 'auto',
    }

    const { avatar } = user && user.profile

    const TeacherNameStyle = {
      fontSize: '2em',
      textAlign: 'center',
    }

    const SchoolNameStyle = {
      fontSize: '1.6em',
      textAlign: 'center',
    }

    const ChatFontStyle = {
      textAlign: 'center',
      fontSize: '1.6em',
    }

    const ParagraphStyle = {
      fontSize: '1.05em',
    }

    const headerStyle = {
      color: 'lightgrey',
      fontSize: '2.5em',
      textAlign: 'center',
    }

    const rowStyle = {
      minHeight: '18em',
      marginBottom: '2em',
    }

    return (
      <Grid columns={16} padded style={containerStyle}>
        <Grid.Column width={3} />
        <Grid.Column width={10}>
          <Header as="h1" content={`${user && user.username}'s Profile`} style={headerStyle} />

          <Grid columns={16}>
            <Grid.Row style={rowStyle}>
              <Grid.Column width={6}>
                <Segment raised color="blue" style={rowStyle}>
                  {/* Change avatar for classroom later  */}
                  <Header as="h1" style={TeacherNameStyle}>
                    {user && user.username}
                  </Header>
                  <ImageShowOrChange
                    id="mgbjr-profile-avatar"
                    maxHeight="10em"
                    maxWidth="auto"
                    imageSrc={avatar}
                    header="User Avatar"
                    canLinkToSrc={canEdit}
                    canEdit={canEdit}
                    handleChange={url => handleAvatarChange(url)}
                  />
                  <List>
                    <List.Item>
                      <List.Content style={SchoolNameStyle}>AIE</List.Content>
                    </List.Item>

                    <List.Item>
                      <List.Content>{/* <List.Icon name="chat" color="blue" />Teacher Chat */}</List.Content>
                    </List.Item>
                  </List>
                </Segment>
              </Grid.Column>
              <Grid.Column width={10}>
                <UserBioCard {...this.props} canEdit={canEdit} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={16}>
                <Segment raised color="yellow" style={rowStyle}>
                  <Header as="h3" content={`${user && user.username}'s Published Games`} />
                  <UserProfileGamesList user={user} currUser={user} />
                </Segment>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={16}>
                <Segment raised color="red">
                  <Header as="h3" content={`${user && user.username}'s Badges`} />
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
