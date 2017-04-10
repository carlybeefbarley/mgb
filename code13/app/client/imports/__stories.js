import React, { PropTypes } from "react";
import { storiesOf, action } from "@kadira/storybook";
import moment from "moment";

// This file should NOT be included as part of the product code on client or server

// It is ONLY for fast-build of dev components for React Storybook stories:
//    https://getstorybook.io/docs/react-storybook/basics/writing-stories

// This is included by app/.storybook/config.js

// It is for devs:
//    Run the usual meteor build in one shell (go.sh etc)
//    Run storybook in another shell as follows:
//        npm run storybook
//        (open browser window to port suggested, for example http://localhost:9001)

// This is useful for mocking the data for the ___Route.js components that get
// user-related data loaded by Meteor.
// This was generated by just dumping JSON.stringify($r.props) from
// the <UserAssetListRoute/> component with the URL http://localhost:3000/u/dgolds/assets
// You can make other mocks in a similar way and check them in for convenience
import fakeAppRouteProps from "./__stories_mockAppProps_dgolds.json";
fakeAppRouteProps.handleSetCurrentlyEditingAssetInfo = action(
  "Invoked handleSetCurrentlyEditingAssetInfo"
);

// BUT Note that you cannot (yet) use any components that import Meteor
// function using the format of ' import from "meteor/foo" '.
// Hey, that's a Good Reason to keep stuff well abstracted :)


// Here's a test of the simple dashboard...
// import DashboardRoute from './routes/Dashboard/DashboardRoute'

// storiesOf('DashBoard', module)
//   .add('Dashboard', () => <DashboardRoute {...fakeAppRouteProps}/>)

import { Card, Header, Image, Icon } from "semantic-ui-react";

const CardExampleCard = ({ currUser }) => (
  <Card>
    <Image src="/images/mascots/bigguy.png" />
    <Card.Content>
      <Card.Header>
        {currUser ? currUser.username : "NONAME"}
      </Card.Header>
      <Card.Meta>
        <span className="date">
          {currUser ? moment(currUser.createdAt).fromNow() : "NODATE"}
        </span>
      </Card.Meta>
      <Card.Description>
        {currUser.profile.bio}
      </Card.Description>
    </Card.Content>
    <Card.Content extra>
      <a>
        <Icon name="user" />
        22 Friends
      </a>
    </Card.Content>
  </Card>
);

const makeCDNLink = url => 'http://v2.mygamebuilder.com/' + url;
const makeExpireTimestamp = t => "";



const UserItem = React.createClass({
  propTypes: {
    user: PropTypes.object.isRequired,
    handleClickUser: PropTypes.func, // If provided, call this with the userId instead of going to the user Profile Page
    narrowItem: PropTypes.bool, // if true, this is narrow format (e.g flexPanel)
    renderAttached: PropTypes.bool // if true, then render attached
  },

  render: function() {
    const { user, narrowItem, renderAttached } = this.props;
    const { profile, createdAt, suIsBanned, isDeactivated } = user;
    const { name, avatar, title } = profile;
    const createdAtFmt = moment(createdAt).format("MMMM DD, YYYY");
    const imageSize = narrowItem ? "mini" : "tiny";
    const titleSpan = (
      <span>
        <i className="quote left icon blue" />
        {title || "(no title)"}
        &nbsp;
        <i className="quote right icon blue" />
      </span>
    );
    // const badgesForUser = null  // FAKE getAllBadgesForUser(user)
    // const getBadgeN = idx => (<Badge forceSize={32} name={idx < badgesForUser.length ? badgesForUser[idx] : "_blankBadge"} />)

    // TODO: Find how to add style={overflow: "hidden"} back to the div style of 'ui segment' without hitting the off-window-images-dont-get-rendered problem that seems unique to Chrome
    // avatar here comes directly from mgb server - as we need it to be up to date always (mgb server will still handle etag - if not changed)
    // return (
    //   <Segment
    //       raised={!renderAttached}
    //       attached={renderAttached}
    //       onClick={this.handleClickUser} >
    //     <Header size='large' content={name}/>
    //     <img src={makeCDNLink(avatar, makeExpireTimestamp(60)) || SpecialGlobals.defaultUserProfileImage} className={`ui floated image ${imageSize}`} />
    //     { narrowItem ? <small>{titleSpan}</small> : <big>{titleSpan}</big> }
    //     { suIsBanned &&
    //       <div><Label size='small' color='red' content='Suspended Account' /></div>
    //     }
    //     { isDeactivated &&
    //       <div><Label size='small' color='purple' content='Deactivated Account' /></div>
    //     }
    //     <p><small style={{color:"rgb(0, 176, 224)"}}>Joined {createdAtFmt}</small></p>
    //     {getBadgeN(0)} {getBadgeN(1)} {getBadgeN(2)} {getBadgeN(3)}
    //   </Segment>
    // )

    return (
      <Card
        raised={!renderAttached}
        attached={renderAttached}
        onClick={this.handleClickUser}
      >
        <Card.Content />
        <Card.Content>
          <img
            src={makeCDNLink(avatar, makeExpireTimestamp(60))}
            className={`ui floated image ${imageSize}`}
          />
        </Card.Content>
        <Card.Content>
          <Card.Header>
            <Header size="large" content={name} />
          </Card.Header>
          <Card.Meta>
            {narrowItem ? <small>{titleSpan}</small> : <big>{titleSpan}</big>}
          </Card.Meta>
          {suIsBanned &&
            <div>
              <Label size="small" color="red" content="Suspended Account" />
            </div>}
          {isDeactivated &&
            <div>
              <Label
                size="small"
                color="purple"
                content="Deactivated Account"
              />
            </div>}
          <p>
            <small style={{ color: "rgb(0, 176, 224)" }}>
              Joined {createdAtFmt}
            </small>
          </p>
        </Card.Content>
        <Card.Content extra>
          {/* 
          {getBadgeN(0)} 
          {getBadgeN(1)} 
          {getBadgeN(2)} 
          {getBadgeN(3)}
          */}
        </Card.Content>
      </Card>
    );
  }
});

storiesOf("Examples", module)
  .add("Card", () => <CardExampleCard currUser={fakeAppRouteProps.currUser} />)
  .add("UserItem Narrow", () => (
    <UserItem
      user={fakeAppRouteProps.currUser}
      handleClickUser={action("Invoked handleSetCurrentlyEditingAssetInfo")}
      narrowItem={true}
    />
  ))
  .add("UserItem Wide", () => (
    <UserItem
      user={fakeAppRouteProps.currUser}
      handleClickUser={action("Invoked handleSetCurrentlyEditingAssetInfo")}
      narrowItem={false}
    />
  ));
