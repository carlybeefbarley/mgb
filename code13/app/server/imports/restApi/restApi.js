import { Azzets } from '/imports/schemas'
import CachedRestivus from '/server/imports/dev/CachedRestivus'
import cache from '/imports/cache'

// Note that Restivus's default url prefix is /api
const options = {
  useDefaultAuth: true,
  prettyJson: true
}

// disable by default - as nobody except stauzs will actually test this
export var RestApi = (Meteor.isDevelopment && false) ? new CachedRestivus(options) : new Restivus(options)

// TODO: use enums instead of strings for asset kinds

// this is used to test cache and cache invalidation
RestApi.addRoute('test', {authRequired: false}, {
  get: function(){
    if(this.request.headers[cache.cacheServerHeader]){
      if(cache.API_SERVERS.indexOf(this.request.headers[cache.cacheServerHeader]) === -1){
        console.log("Adding cache server:", this.request.headers[cache.cacheServerHeader])
        cache.API_SERVERS.push(this.request.headers[cache.cacheServerHeader])
      }
    }
    return {servers: cache.API_SERVERS, date: Date.now(), headers: this.request.headers}
  }
})


RestApi.addRoute('asset/map/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id);
    if (asset){
      // map editor stores some info in the meta - e.g. camera position / active tool etc
      delete asset.content2.meta;
      // TODO: content2 will be moved
      return asset.content2;
    }
    else {
      return {
        statusCode: 404
      }
    }
  }
});
RestApi.addRoute('asset/map/:user/:name', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, kind: 'map', isDeleted: false})
    if (asset){
      // map editor stores some info in the meta - e.g. camera position / active tool etc
      delete asset.content2.meta;
      // TODO: content2 will be moved
      return asset.content2;
    }
    else {
      return {
        statusCode: 404
      }
    }
  }
});
RestApi.addRoute('asset/actormap/:user/:name', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, kind: 'actormap', isDeleted: false})
    if (asset){
      // map editor stores some info in the meta - e.g. camera position / active tool etc
      delete asset.content2.meta;
      // TODO: content2 will be moved
      return asset.content2;
    }
    else {
      return {
        statusCode: 404
      }
    }
  }
});

// TODO: cache + invalidate cache
// TODO: check hidden layers
/*
node-canvas implementation - faster (theoretically) than Jimp but requires to compile cairo
RestApi.addRoute('asset/tileset/:id', {authRequired: false}, {
  get: function () {
    "use strict";
    const asset = Azzets.findOne(this.urlParams.id);
    if(!asset){
      return {
        statusCode: 404
      };
    }

    const c2 = asset.content2;
    const canvas = new Canvas(c2.width * c2.frameData.length, c2.height);
    const ctx = canvas.getContext('2d');
    const img = new Canvas.Image();

    const done = (callback) => {
      const subDone = () => {
        callback(null, {
          statusCode: 200,
          headers: {
            'Content-Type': 'image/png'
          },
          body: canvas.toBuffer()
        });
      };

      // this works like sync functions... confuses a little bit
      const loadImageAndDraw = (src, offset) => {
        img.onload = () => {
          ctx.drawImage(img, offset * img.width, 0);
        };
        img.src = src;
      };

      asset.content2.frameData.forEach((d, i) => {
        d.forEach((data) => {
          loadImageAndDraw(data, i);
        });
      });

      // this will be called after all drawings
      // might seem bugous - but it's not!
      subDone();
    };

    return Meteor.wrapAsync(done)();
  }
});
*/
/*
Jimp is pure JS implementation - slower (theoretically), but doesn't require native modules
 */
/*
RestApi.addRoute('asset/tileset/:id', {authRequired: false}, {
  get: function () {
    "use strict";
    const asset = Azzets.findOne(this.urlParams.id);
    if(!asset){
      return {
        statusCode: 404
      };
    }

    const c2 = asset.content2;
    const done = (callback) => {
      let todo = 0;
      new Jimp(c2.width * c2.frameData.length, c2.height, (err, canvas) => {
        if(err){
          callback(err);
          return;
        }
        const loadImageAndDraw = (src, offset) => {
          new Jimp(dataUriToBuffer(src), (err, img) => {
            if(err){
              console.error("Failed to load asset:", err);
              subDone();
              return;
            }
            canvas.composite(img, offset * img.bitmap.width, 0);
            subDone();
          });
        };

        asset.content2.frameData.forEach((d, i) => {
          todo += d.length;
        });

        asset.content2.frameData.forEach((d, i) => {
          d.forEach((data) => {
            loadImageAndDraw(data, i);
          });
        });

        const subDone = () => {
          todo--;
          if(todo){
            return;
          }

          canvas.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
            callback(null, {
              statusCode: 200,
              headers: {
                'Content-Type': 'image/png'
              },
              body: buffer
            });
          });
        };
      });
    };
    return Meteor.wrapAsync(done)();
  }
});
*/

