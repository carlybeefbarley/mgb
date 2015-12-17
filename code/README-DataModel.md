# MGBv2 Data Model spec

(This is all 'TODO')

## Primary data objects: "Assets"

Assets are items used to construct a game such as sprites, actors (canned scripts), scripts. maps, games and more.

## Overall data model: Tags instead of Projects

MGBv1 had a fairly strict concept of 'project' and all assets were in exactly one project. This made it hard to share 
resources across multiple projects, and led to clunky solutions like send-image-to-project flow.  However, it did 
keep data access simple within a single project (no accidental changes to items shared between projects) and was easy 
to implement given the very simple S3 hierarchical namespace that MGBv1 was based upon.

The proposal for MGBv2 is to instead have TAGS so that any asset can be in one or more 'projects'.

Note: 'TAGS' may be a bad phrase since it conflicts with GIT version control terminology.. need to consider that


### Asset Identity and Mutability

* All assets are primarily identified by a UUID that is a strong reference
* There is a NAME attribute on any asset, but this is not a strong reference
* Assets may be set to be immutable which means they can no longer be deleted or changed. This is useful for some 
  reference assets. We may limit who can have immutable assets since it is an non-reversible decision.
* This immutability might be done with versioning - which prevents deletion, allows safe reference, but adds a way to 
  improve a shared Asset


### Asset ownership and access

* Assets are OWNED by a single person
* All assets are readable by ANY user and there are NO private assets
* ?? We may allow users to add EXTERNAL-TAGS on Assets they do not own


### Cross-user Asset references

* Users can reference (and use) ANY assets in other users' projects
* There should be warnings/reports for any *mutable* assets they depend upon


### Import from MGBv1

* If we do game import from MGBv1, we can have an automatic TAG project-ZZZZZ assigned to that imported item so we
  start with a pseudo-hierarchy.


### Definition and Publication of Games

* There will be a special Asset type called Game (possible 'App' for future-proofing?)
* Games reference a number of top-level assets like Maps, Players, Servers, etc
* Games can be 'published' which does a few special things
  1. It generates some faster-to-load game-bundle that makes it quicker for players to start the game
  1. It stores asset references to represent the Game definition at that time
  1. It allows the developer to optionally erase/invalidate existing cross-gameplay data (highscores, game-saves etc)
  1. We might optionally allow any non-immutable assets to be cloned and made immutable for that release so it will
     always be possible to go back and edit it.
* Published games can be deleted. This will cause any cloned+locked assets to be deleted


### Teams and collaboration

* The data model described above supports loose collaboration across users where they just use each other's stuff. It is
  simple but a little fragile, however with some reference-warnings it may be usable.
* The availability of immutability allows a more robust-way to use assets from other users, essentially allowing 
  'contracts' to be formed for 'more serious' users

Initially we will just support the above approaches. if that starts falling apart, we have a few options:
  
* To support a collaboration where all Game assets can be owned by the same account, we have a few options
  1. (PREFERRED) "GIVE".. Provide a way for userA to *allow* userB to assign ownership of an Asset (or a clone of an 
     Asset) to userA. This is good since it is an incremental process from the loose/immutable processes. It also 
     doesn't allow people to randomly spam stuff to each other. The "GIVE" process would update references to use the 
     GIVEN versions of the assets. "GIVE" can also be implemented at the Game level (a few more steps, but same concepts)
  1. (???) "ACLs" - userA allows userB to edit/delete some sets of assets using an ACL (access control list) system. 
     This is OK, except it doesn't solve the problem of new items and ACL lists can get hard to manage at scale.
  1. (NOT GOOD - WON'T IMPLEMENT) "TEAM".. Create a first class user identity which is TEAM. This is messy since now a 
     user has to think what context they are working in.
  1. (NOT GOOD - WON'T IMPLEMENT) "ACT-AS" Create a work-on-behalf of model which lets userB edit/create/delete files 
     owned by userA. This is messy since it is hard to bound the scope of this access.
  1. (NOT GOOD - WON'T IMPLEMENT) "shared accounts".. i.e. allow multiple to login as the same identity. This is very 
     messy since it is hard to work out accountability.
     
One issue with GIVE is what happens if userB wants to updated it after it has been GIVEN; a good approach would be to 
have a 'RETURN' action that returns it to the original user so they can work on it again.


## Impact of Data model on Navigation and UI

(ignoring GIVE/RETURN for now).

This means that the user experience is basically a search with tags for various asset types. The search terms that can
be INDEPENDENTLY selected are
* No asset type filter, or select one-or-more asset types (including 'all')
* No asset owner filter, or select one-or-more owners types (including just-me, just-friends, named-users, or 'all')
  * There is some [nice UI](https://learningcircle.io/blog) for this by the [universe](https://atmospherejs.com/universe) folks
* Zero-or-more tags
  * See https://atmospherejs.com/telescope/tags and https://atmospherejs.com/yogiben/autoform-tags 
* Search into Some full text description fields
  * See [Meteor Full-text search notes](http://www.meteorpedia.com/read/Fulltext_search) for info on this, or 
    [this article](https://www.okgrow.com/posts/guide-to-full-text-search-in-meteor) which mentions the caveats
* We may also have a set of quick-find searches. For fun, let's have searches themselves be a first-class Asset so they 
  can be shared and referenced!
  
* We might use a grid arrangement for viewing items. See 
 [Reactive Grid Layout](https://github.com/vazco/meteor-universe-react-grid-layout) for a very flexible option here.

## Implementation



