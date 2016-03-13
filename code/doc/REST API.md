WHAT WE ARE USING
~~~~~~~~~~~~~~~~~

We are using https://atmospherejs.com/nimble/restivus

In main_server.js

    // REST API
    var RestApi = new Restivus({
        useDefaultAuth: true,
        prettyJson: true
    });

    RestApi.addRoute('asset/:id', {authRequired: false}, {
        get: function () {
            var asset = Azzets.findOne(this.urlParams.id);
            return asset ? asset : {};
        }
    });

    RestApi.addRoute('asset/png/:id', {authRequired: false}, {
        get: function () {
            var asset = Azzets.findOne(this.urlParams.id);
            if (asset)
            {
                return {
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'image/png'
                    },
                    body: dataUriToBuffer(asset.content2.frameData[0][0])
                };
            }
            else {
                return {
                    statusCode: 404                
                };
            }
        }
    });




Usage from a Phaser script:
    function preload() {
        game.load.crossOrigin = 'anonymous';
        game.load.image('player', '/api/asset/png/uxgtoC35vKCPNyuEM');
        game.load.image('platform', '/api/asset/png/uxgtoC35vKCPNyuEM');
    }








NOT USED (CURRENTLY)
~~~~~~~~~~~~~~~~~~~~


For development convenience, one option can be https://github.com/stubailo/meteor-rest package to expose a REST API for all our Meteor publications

$ cd meteor_core
$ meteor add simple:rest

Then the publications are simply available. To get the list, see the following URL:

http://localhost:3000/publications/api-routes

For example, the assets.public REST APi will be at: 

http://localhost:3000/publications/assets.public

