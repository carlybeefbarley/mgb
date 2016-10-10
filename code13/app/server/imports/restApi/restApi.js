import { Azzets } from '/imports/schemas'
import dataUriToBuffer from 'data-uri-to-buffer'

// Note that Restivus's default url prefix is /api
export var RestApi = new Restivus({
  useDefaultAuth: true,
  prettyJson: true
})


// The rest of this file deals with tiles and maps.

RestApi.addRoute('asset/:id', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    return asset ? asset : {}
  }
})


RestApi.addRoute('asset/full/:user/:name', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne({ name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false })
    return asset ? asset : { statusCode: 404, body: {} }
  }
})


RestApi.addRoute('asset/json/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    return asset ? JSON.parse(asset.content2.src) : { statusCode: 404, body: {} }
  }
})



// TODO: Maybe make this asset/graphic ? Look also at AssetUrlGenerator and generateUrlOptions()
RestApi.addRoute('asset/png/:id', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    if (asset)
    {
      const frame = this.queryParams.frame || 0
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/png'
          // 'cache-control': 'private, must-revalidate, max-age: 30'
        },
        body: dataUriToBuffer(asset.content2.frameData[frame][0])   // TODO: Handle case where the frameData has not yet been created
      }
    }
    else 
      return { statusCode: 404 }
  }
})

// MapEditor tries this while guessing image from imported map
RestApi.addRoute('asset/png/:user/:name', { authRequired: false }, {
  get: function () {
    var asset = Azzets.findOne({
      kind: "graphic",
      name: this.urlParams.name,
      dn_ownerName: this.urlParams.user,
      isDeleted: false
    });
    if (asset)
    {
      const frame = 0;
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'image/png',
        },
        body: dataUriToBuffer(asset.content2.frameData[frame][0])
      }
    }
    else {
      // without body returns 200 and json: {statusCode: 404}
      return {statusCode: 404, body:{}};
    }
  }
});
// MapEditor tries this while guessing image from imported map
RestApi.addRoute('asset/id/:user/:name', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false});
    if (asset)
    {
      return asset._id
    }
    else {
      // without body returns 200 and json: {statusCode: 404}
      return {statusCode: 404, body:{}};
    }
  }
})

// Get any kind of asset's Thumbnail *as* a PNG
RestApi.addRoute('asset/thumbnail/png/:id', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne(this.urlParams.id)
    // Return an empty image if there's no thumbnail yet. This is a transparent 1x1 GIF from https://css-tricks.com/snippets/html/base64-encode-of-1x1px-transparent-gif/
    var emptyPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" //1x1GIF
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png'
//      'Cache-Control': 'max-age=5, private'  // Max-age is in seconds?   seems to be over-active :()
      },
      body: dataUriToBuffer(asset && asset.thumbnail ?  asset.thumbnail : emptyPixel )
    }   
  }
})
RestApi.addRoute('asset/thumbnail/png/:user/:name', {authRequired: false}, {
  get: function () {
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false})
    // Return an empty image if there's no thumbnail yet. This is a 1x1 green pixel from http://png-pixel.com/
    var emptyPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png'
//      'Cache-Control': 'max-age=5, private'  // Max-age is in seconds?   seems to be over-active :()
      },
      body: dataUriToBuffer(asset && asset.thumbnail ?  asset.thumbnail : emptyPixel )
    }
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
    var asset = Azzets.findOne({name: this.urlParams.name, dn_ownerName: this.urlParams.user, isDeleted: false})
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

RestApi.addRoute('asset/tileset-info/:id', {authRequired: false}, {
  get: function () {
    "use strict";
    const asset = Azzets.findOne(this.urlParams.id);
    if (!asset) {
      return {
        statusCode: 404
      }
    }
      /*
      firstgid:1
      image:"main.png"
      imageheight:100
      imagewidth:256
      margin:0
      name:"main"
      spacing:0
      tilecount:4
      tileheight:100
      tiles:Object
      tilewidth:64
      */
    const c2 = asset.content2;
    const tiles = {};
    c2.animations && c2.animations.forEach((anim) => {
      const animation = [];
      const duration = (1000 / anim.fps); // round?
      anim.frames.forEach((frame) => {
        animation.push({
          duration,
          tileid: frame
        });
      });
      tiles[anim.frames[0]] = {
        animation,
        mgb_animation_info: {
          name: anim.name,
          fps: anim.fps
        }
      }
    });


    return {
      image: "/api/asset/tileset/" + this.urlParams.id,
      // don't do that - as image will be cached forever and embedded in the map (phaser don't know how to extract embedded images automatically)
      //image: c2.tileset ? c2.tileset : "/api/asset/tileset/" + this.urlParams.id,
      name: asset.name,
      imageheight: c2.rows ? c2.rows*c2.height : c2.height,
      imagewidth: c2.cols ? c2.cols*c2.width : c2.width * c2.frameData.length,
      tilecount: c2.frameData.length,
      tileheight: c2.height,
      tilewidth: c2.width,
      tiles
    };
  }
});
RestApi.addRoute('asset/tileset/:id', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne(this.urlParams.id);
    if (!asset || !asset.content2 || !asset.content2.tileset) {
      return {
        statusCode: 404,
        body: {} // body required to correctly set 404 header
      }
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png'
      },
      // TODO: cache
      body: dataUriToBuffer(asset.content2.tileset)
    }
  }
})
RestApi.addRoute('asset/tileset/:user/:name', {authRequired: false}, {
  get: function () {
    const asset = Azzets.findOne({
      name: this.urlParams.name,
      dn_ownerName: this.urlParams.user,
      isDeleted: false
    })

    if (!asset || !asset.content2 || !asset.content2.tileset) {
      return {
        statusCode: 404,
        body: {} // body required to correctly set 404 header
      }
    }
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png'
      },
      // TODO: cache
      body: dataUriToBuffer(asset.content2.tileset)
    }
  }
})
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

