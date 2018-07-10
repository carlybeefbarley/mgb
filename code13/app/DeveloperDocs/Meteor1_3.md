Things I learnt taking the old WebPack-based es7 codebase to Meteor 1.3

1. Most files have to move to a /imports/ folder or it will be eager loaded
2. No decorators, so the following will not work: @handleForms, @history
3. No ES7 property descriptors (i.e. statics), so either append the PropTypes atfter defiition, or use React.createClass
4. if using React.createClass(), remember that it automatically wraps methods with this.___.bind(this)
5. Meteor1.3 doesn't have the nice css module loader, so all the .css files got pulled in and messed up the styling
6. Meteor 1.3 does not support asset files (See https://github.com/meteor/meteor/issues/6037) so include any required asset files via symlinks/copies :(
7. import 'npmpackagename/folder/filename.js'  does not work, so SOL for things like CodeMirror addons
8. The 'import * from Foo' syntax that was being used for some of the .index files does not work. Instead import each symbol then export it in an object.
