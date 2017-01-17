
MGB client -> Cloudfront -> MGB server -> (set cache headers?) -> Cloudfront cache -> client side caching (if possible)

cloudfront then caches required resources and distributes to clients without triggering MGB server

MGB client <-> Cloudfront

* atm client side caching is enabled for static resources (except badges and other files in the public folder - discuss) - and for thumbnails - with custom cache hash and timestamp
* api (asset) caching is enabled in the cloudfront - but disabled on the client side - it can be easily enabled in the ( see: server/imports/helpers/generators.js: 50 - discuss - seems that it's safe to enable client side caching (needs more testing)')

* content2 has been removed from meteor subscription (also from getMeteorData) and moved to assetFetchers - now it goes through the cloudfront caching

* I'm not sure about http/https combo - couldn't test it

* helpers are located in the assetFetchers.js


1) CreateCloudFront (server/cloudfront/CreateCloudfront.js) - will automatically set up cloudfront repo based on ORIGIN_DOMAIN_NAME
2) All cacheable requests should go through cloudfront
