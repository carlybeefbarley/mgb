# Example of how Asset top level entity was added:


routes/Assets/UserAsset.js
-  (done) UserAssetListRoute 

routes/App.js
-  (done)
-  import * as Assets from './Assets';
-  <Route path="user/:id/assets" component={Assets.UserAssetList} name="Assets" />

import AssetList from '../../components/Assets/AssetList';
-  (todo)
-  AssetCard.js, AssetForms.js, AssetList.js

import {Asset} from '../../schemas';
-  (done)
-  Meteor.call('Asset.create', {…
-  Meteor.call('Assets.update', {… 

import {Assets} from '../schemas';
-  (done) — schemas/index.js

import AssetForms from '../../components/Assets/AssetForms';
-  (done)

publications/publications.js
-  (done)

app/main_server.js
-  import './schemas/assets.js';
-  (done)

app/main_client.js
-  import './schemas/assets.js';
-  (done)


