# Dependencies Reasoning and Road map

## Why Meteor?

* Pros: Single language client/server language, more integrated than raw nodejs+whatever, DDP for synced updates
* Cons: Scale if live-queries get overused; Ecosystem packages fragmented; No strong test tools culture
* Alternatives: 
  * PhoenixFramework: Many new learning curves (Elixir language etc)
  * GraphQL: A bit early for this? How are subscriptions handled?
  * Ruby/Rails: Not good for scaling or synced updates
 
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
 
