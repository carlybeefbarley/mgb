import _ from 'lodash'
import React from 'react'
import { Button, Card, Header, Icon, Label, Popup, Segment, Grid, List, Message } from 'semantic-ui-react'
import ProjectCard from '/client/imports/components/Projects/ProjectCard'
import SlidingCardList from '/client/imports/components/Controls/SlidingCardList'
import Dashboard from '/client/imports/components/Dashboard/Dashboard.js'

const dbrProps = {
  foo: 'bar',
}

const DashboardRoute = props =>
  // !props.currUser ? <Message content="Not logged in" /> : <DashboardRouteUI {...props} {...dbrProps} />
  !props.currUser ? <Message content="Not logged in" /> : <Dashboard {...props} />

export default DashboardRoute

// Instead of the faked width I need something like https://css-tricks.com/pure-css-horizontal-scrolling/

/*const DashboardRouteUI = ({ currUser, currUserProjects, handleSetCurrentlyEditingAssetInfo }) => (
  <Segment padded basic>
    <Header content={`Projects: ${currUser.username}`} />
    <Button onClick={() => handleSetCurrentlyEditingAssetInfo()} content="pushme" />
    <SlidingCardList
        cardArray={
          _.map(
            _.sortBy( currUserProjects, p => ((p.ownerId === currUser._id) ? '!!' : p.ownerName)),
            p => <ProjectCard key={p._id} canEdit={false} project={p}/>
          )}/>
  </Segment>
);*/
