// !!! important when adding new api endpoint add it also to tests/tests/api.test.js

import { Restivus } from 'meteor/nimble:restivus'
import dataUriToBuffer from 'data-uri-to-buffer'

import { Azzets } from '/imports/schemas'

// Note that Restivus's default url prefix is /api
const options = {
  useDefaultAuth: true,
  prettyJson: true,
}

export const RestApi = new Restivus(options)

/*--------- some freq used constants ---------------*/

// Return an empty image if there's no thumbnail yet. This is a transparent 1x1 GIF from https://css-tricks.com/snippets/html/base64-encode-of-1x1px-transparent-gif/
export const emptyPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' //1x1GIF
export const emptyPixelBuffer = dataUriToBuffer(emptyPixel)

export const red64x64halfOpacity =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAY0lEQVR42u3QAREAAAQEsJdcdHI4W4TVJJ3HSoAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIECLhvAUBsX8GVkqJPAAAAAElFTkSuQmCC'
export const grey64x64halfOpacity =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAAPUlEQVR42u3OMQEAAAgDIJfcHLY1xh5IQG6nKgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLtwAN5AkZBhS2TJQAAAABJRU5ErkJggg=='

// this actually gets _id also which is needed
export const etagFields = { fields: { _id: 1, updatedAt: 1 } }
export const content2onlyField = { fields: { _id: 0, content2: 1 } }

export const err404 = { statusCode: 404, body: {} } // body required to correctly show 404 not found header

export const audioHeader = { 'Content-Type': 'audio/mp3' }

// TODO: check if this has any performance impact - $in vs {$ne: true} and index usage
export const assetAccessibleProps = {
  isDeleted: false,
  isFlagged: { $in: [null, false] } /* isFlagged: false */,
}

/**
 * gets assets content2
 * @param partialAsset {AssetEtagPart} - partialAsset should contain at least _id and updatedAt
 */
export const getContent2 = partialAsset => {
  if (!partialAsset) return null

  const asset = Azzets.findOne(partialAsset._id, content2onlyField)
  return asset ? asset.content2 : null
}
/**
 * gets full asset from partial asset
 * @param partialAsset {AssetEtagPart} - partialAsset should contain at least _id and updatedAt
 */
export const getFullAsset = partialAsset => {
  if (!partialAsset) return null

  return Azzets.findOne(partialAsset._id)
}

// TODO: use enums instead of strings for asset kinds

/*RestApi.addRoute('test', {authRequired: false}, {
  get: function(){
    if(this.request.headers[cache.cacheServerHeader]){
      if(cache.API_SERVERS.indexOf(this.request.headers[cache.cacheServerHeader]) === -1){
        console.log("Adding cache server:", this.request.headers[cache.cacheServerHeader])
        cache.API_SERVERS.push(this.request.headers[cache.cacheServerHeader])
      }
    }
    return {servers: cache.API_SERVERS, date: Date.now(), headers: this.request.headers}
  }
})*/

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
