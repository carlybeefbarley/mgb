import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
// This file should NOT be included as part of the product code on client or server

// React Storybook stories: 
//    https://getstorybook.io/docs/react-storybook/basics/writing-stories

import DeletedState from './components/Controls/DeletedState'
import Footer from './components/Footer/Footer'


storiesOf('Delete', module)
  .add('isDeleted, CanEdit', () => (
    <DeletedState isDeleted={true} canEdit={true} handleChange={action('clicked')} operationPending={false}/>       
  ))
  .add('!isDeleted, CanEdit', () => (
    <DeletedState isDeleted={false} canEdit={true} handleChange={action('clicked')} operationPending={false}/>       
  ))


// storiesOf('Footer', module)
//   .add('Footer', () => (
//     <Footer/>
//   ))
   


import { Popup, Segment } from 'semantic-ui-react'




storiesOf('EXPERIMENTING', module)
  .add('foobar', () => (
    <Segment padded>
      oh Hai there
    </Segment>
  ))
  .add('foobar2', () => (
    <Popup 
    trigger={(<Segment padded>
      oh yoyo booty
    </Segment>)}
    >
      <Popup.Header>
        for realz!
      </Popup.Header>
    </Popup>
  ))