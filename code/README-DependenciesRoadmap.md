# Dependencies Reasoning and Road map

## Why Meteor?

* Pros: Single language client/server language, more integrated than raw nodejs+whatever, DDP for synced updates
* Cons: Scale if live-queries get overused; Ecosystem packages fragmented; No strong test tools culture
* Alternatives: 
  * PhoenixFramework: Many new learning curves (Elixir language etc)
  * GraphQL: A bit early for this? How are subscriptions handled?
  * Ruby/Rails: Not good for scaling or synced updates
  
  
## Main perf strategies given Meteor base

1. See how to manage the Assets subscription to be narrowed down (project tag?)
1. Stable assets should get compiled and pushed to a CDN; only unstable assets 
  1. AssetContent could have stuff like a  URL for built-assets and a last-built-date and a last-edited date. 
    1. The idea would be that we get built-assets directly from the CDN. 
    1. Stuff that has been superseded can exist and be accessed in it's unstable form in a AssetSource table
    1. Edit happens on the versions in the AssetSource Table
    1. We get versioning by having the 'built' version generate the filename_url and filename_url.src
    1. This implies need for shared client-side and server-side asset 'compilers'
    1. Spritesheets may need a specialized store - depends how MongoDB does with EJSON binaries. 
       Could use Amazon S3 maybe?
 
## Meteor packages - electives

* No change expected:
  * UI renderer: React
  * i18n: universe:i18n

* Chosen for now
  * Meteor:
    * Now: Meteor 1.2.x
    * ASAP: Meteor 1.3.x
  * Testing: 
    * Trying: [sanjo:Jasmine](https://meteor-testing.readme.io/docs/getting-started)    
  * Router: 
   * Now: Flow-router 
   * Next: May look at [ReactRouter](https://atmospherejs.com/reactrouter/react-router) as used by the 
     [Optilude meteor-react-example](https://github.com/optilude/meteor-react-example)
  * Module pattern: 
    * Now: universe:modules (as part of universe:ecmascript) (and some old hacks using Modules.client / Modules.server)
    * Next: Meteor1.3 modules ([docs](https://github.com/meteor/meteor/blob/release-1.3/packages/modules/README.md))
  * CSS framework: 
    * Now: Bootstrap3
    * Next? semantic-ui looks good but is another learning curve
  * Table control:
    * Now: [universe:reactable](https://atmospherejs.com/universe/react-table)
    * Next? Fork universe:reactable and create my own?
    * Next? wrapper for Datatable?
  * Handling image editing
    * To investigate: ([Reasonable list of options](http://stackoverflow.com/questions/10099202/how-would-one-handle-a-file-upload-with-meteor))
    * Candidate: [CollectionFS](https://github.com/CollectionFS/Meteor-CollectionFS)
