import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
// This file should NOT be included as part of the product code on client or server

// React Storybook stories: 
//    https://getstorybook.io/docs/react-storybook/basics/writing-stories

import SuperAdminAssetControl from '/client/imports/components/Assets/SuperAdminAssetControl'

storiesOf('SuperAdminAssetControl', module)
  .add('Banned Asset', () => (
    <SuperAdminAssetControl asset={{ suIsBanned: true } }/>
  ))
  .add('Non-banned Asset', () => (
    <SuperAdminAssetControl asset={{ suIsBanned: false } }/>
  ))