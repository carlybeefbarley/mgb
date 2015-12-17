# Dependencies Reasoning and Road map

## Why Meteor?

* Pros: Single language client/server language, more integrated than raw nodejs+whatever, DDP for synced updates
* Cons: Scale if live-queries get overused; Ecosystem packages fragmented; No strong test tools culture
* Alternatives: 
  * PhoenixFramework: Many new learning curves (Elixir language etc)
  * GraphQL: A bit early for this? How are subscriptions handled?
  * Ruby/Rails: Not good for scaling or synced updates
 
## Meteor electives

* Chosen for now
  * Router: Flow-router (may look at [ReactRouter](https://atmospherejs.com/reactrouter/react-router) as used by the [Optilude meteor-react-example](https://github.com/optilude/meteor-react-example)
  * Module pattern: 
    * Now: globals hacks using Modules.server
    * Moving-to: universe-modules
    * Meteor1.3: modules ([docs](https://github.com/meteor/meteor/blob/release-1.3/packages/modules/README.md))
* UI renderer: React
* CSS framework: Bootstrap
  * semantic-ui looks good but is another learning curve
* 
