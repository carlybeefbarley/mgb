/*
 This script will automatically set up cloud front distribution for ORIGIN_DOMAIN_NAME
 At first it will try to reuse previously created distribution for ORIGIN_DOMAIN_NAME
 Change AWS auth keys in the ./config.json
 Check server_main.js - to enable this script for production
 */
import AWS from 'aws-sdk'
// this is @stauzs personal account
import config from './config.json'
import { WebApp } from 'meteor/webapp'
import '/server/slackIntegration'

let CLOUDFRONT_DOMAIN_NAME = ''

// probably we should separate this export
export const getCDNDomain = function () {
  return CLOUDFRONT_DOMAIN_NAME
}

export const setUpCloudfront = function () {

  // on the test server run with production flag?
  if( !Meteor.isProduction ){
    return
  }
// Config
  // TODO(stauzs): move these to ENV
  const ORIGIN_DOMAIN_NAME = 'test.mygamebuilder.com' // v2.mygamebuilder.com
  const ORIGIN_ID = Meteor.isProduction ? 'test.mygamebuilder.com' : 'test.mygamebuilder.com-dev'
  const HTTP_PORT = Meteor.isProduction ? 80 : 3000
  const HTTPS_PORT = 443
  const params = {
    DistributionConfig: {
      /* required */
      CallerReference: 'mgb-' + ORIGIN_ID, /* required - A unique value (for example, a date-time stamp) that ensures that the request can't be replayed */
      Comment: 'mgb cloudfront distribution', /* required */
      DefaultCacheBehavior: {
        /* required */
        ForwardedValues: {
          /* required */
          Cookies: {
            /* required */
            Forward: 'none', // 'none | whitelist | all', /* required */ we are not using cookies (may be required for some sort of authentication in the future
            WhitelistedNames: {
              Quantity: 0, /* required */
              Items: []
            }
          },
          QueryString: true, /* required - this will affect update to new sources - e.g. meteor uses hash=xxxxxx */
          Headers: {
            Quantity: 0, /* required - send all headers to origin ?? or none */
            Items: []
          },
          QueryStringCacheKeys: {
            Quantity: 0, /* required */
            Items: [/* more items */]
          }
        },
        MinTTL: 0, /* required */
        TargetOriginId: ORIGIN_ID, /* required */
        TrustedSigners: {
          /* required */
          Enabled: false, /* required - are we going to use ssl */
          Quantity: 0, /* required */
          Items: [/* more items */]
        },
        ViewerProtocolPolicy: 'allow-all', /* allow http and https */ /* allow-all | https-only | redirect-to-https', /* required */
        /* only GTE HEAD makes sense here - as rest goes through WS - OPTIONS is required for CORS headers (only semantic fonts requires this atm)*/
        AllowedMethods: {
          Items: [/* required */
            //'GET | HEAD | POST | PUT | PATCH | OPTIONS | DELETE',
            /* more items */
            'GET',
            'HEAD',
            'OPTIONS'
          ],
          Quantity: 3, /* required */
          CachedMethods: {
            Items: [/* required */
              // 'GET | HEAD | POST | PUT | PATCH | OPTIONS | DELETE',
              /* more items */
              'GET',
              'HEAD',
              'OPTIONS'
            ],
            Quantity: 3 /* required */
          }
        },
        Compress: false, /* meteor will compress response by default - is it possible to turn off compression on meteor??? */
        /*
         this throws error - even if empty
         LambdaFunctionAssociations: {
         Quantity: 0, // required
         Items: [ ]
         {
         EventType: 'viewer-request | viewer-response | origin-request | origin-response',
         LambdaFunctionARN: 'STRING_VALUE'
         },
         ]
         },*/
        DefaultTTL: 86400, // this will be controlled with cache headers
        MaxTTL: 31536000,
        SmoothStreaming: false /* Indicates whether you want to distribute media files in the Microsoft Smooth Streaming format using the origin that is associated with this cache behavior. */
      },
      // ?? is this valid - Specifies whether you want CloudFront to save access logs to an Amazon S3 bucket.
      // seems that this is general Distribution option
      Enabled: true, //true || false, /* required */
      Origins: {
        /* required */
        Quantity: 1, /* required */
        Items: [
          {
            DomainName: ORIGIN_DOMAIN_NAME, /* required */
            Id: ORIGIN_ID, /* required */
            CustomHeaders: {
              Quantity: 0, /* required */
              Items: [
                /*{
                 HeaderName: 'STRING_VALUE', // required
                 HeaderValue: 'STRING_VALUE' // required
                 },*/
                /* more items */
              ]
            },

            //!!! this is not working with port 80
            CustomOriginConfig: {
              HTTPPort: HTTP_PORT, // required
              HTTPSPort: HTTPS_PORT, // required
              OriginProtocolPolicy: 'match-viewer', // 'http-only | match-viewer | https-only', /* required
              OriginSslProtocols: {
                // TODO: set up SSL
                Items: [ // required
                  //'SSLv3 | TLSv1 | TLSv1.1 | TLSv1.2',
                  // 'SSLv3',
                  'TLSv1',
                  'TLSv1.1',
                  'TLSv1.2'
                ],
                Quantity: 3 // required
              }
            },
            OriginPath: '',
            /*
             only for S3
             S3OriginConfig: {
             OriginAccessIdentity: 'STRING_VALUE' // required
             }*/
          },
          /* more items */
        ]
      },
      // TODO: set up alias - e.g. cdn.mygamebuilder.com
      Aliases: {
        Quantity: 0, /* required */
        Items: [] /* 'STRING_VALUE' */,
      },
      // use default for all
      CacheBehaviors: {
        Quantity: 0, /* required */
        Items: [/* more items */]
      },
      // TODO: do we need custom error responses ???
      CustomErrorResponses: {
        Quantity: 0, /* required */
        Items: [
          /*{
           ErrorCode: 0, // required
           ErrorCachingMinTTL: 0,
           ResponseCode: 'STRING_VALUE',
           ResponsePagePath: 'STRING_VALUE'
           },*/
          /* more items */
        ]
      },
      DefaultRootObject: '', // The object that you want CloudFront to request from your origin (for example, index.html) when a viewer requests the root URL for your distribution - If you don't want to specify a default root object when you create a distribution, include an empty DefaultRootObject element.
      // HttpVersion: 'http1.1 | http2', // http2 is default
      // TODO: research if we really need IPv6

      // this throws an error
      // IsIPV6Enabled: false, // true || false,
      Logging: {
        Bucket: '', /* required */
        Enabled: false, // true || false, /* required */
        IncludeCookies: false, // true || false, /* required */
        Prefix: '' /* required */
      },
      PriceClass: 'PriceClass_All', // 'PriceClass_100 | PriceClass_200 | PriceClass_All',
      // TODO - may be needed at some point
      Restrictions: {
        GeoRestriction: {
          /* required */
          Quantity: 0, /* required */
          RestrictionType: 'none', // 'blacklist | whitelist | none', /* required */
          Items: [/* more items */]
        }
      },
      ViewerCertificate: {
        //ACMCertificateArn: 'STRING_VALUE',
        //Certificate: 'STRING_VALUE',
        CertificateSource: 'cloudfront', // | iam | acm',
        CloudFrontDefaultCertificate: true, // || false,
        // IAMCertificateId: 'STRING_VALUE',
        // MinimumProtocolVersion: 'SSLv3 | TLSv1',
        // SSLSupportMethod: 'sni-only | vip'
      },
      // WebACLId: 'STRING_VALUE'
    }
  }
// this will be filled at runtime - after script will get assigned domain name (xxxxx.cloudfront.com)

// client at first load will try to get CLOUDFRONT_DOMAIN_NAME - so it can use it for ajax requests
  Meteor.methods({
    "CDN.domain": getCDNDomain
  })

// CORS fix
  const allowedOrigins = [
    'http://test.mygamebuilder.com',
    'https://test.mygamebuilder.com',
    'http://test.mygamebuilder.com:3000',
    'http://mightyfingers.com:8080',
    'http://localhost:3000',
    'http://v2.mygamebuilder.com',
    'https://v2.mygamebuilder.com'
  ]
  WebApp.rawConnectHandlers.use(function (req, res, next) {
    const index = allowedOrigins.indexOf(req.headers.origin)
    if (index > -1) {
      res.setHeader('access-control-allow-origin', allowedOrigins[index])
    }
    // or allow for all domains
    // res.setHeader('access-control-allow-origin', '*')
    res.setHeader('access-control-expose-headers', 'etag')

    // cache static files for 1 hour - after meteor update they will be invalidated before cache expires
    if (
      req._parsedUrl.path.startsWith("/badges") ||
      req._parsedUrl.path.startsWith("/audio") ||
      req._parsedUrl.path.startsWith("/images") ||
      req._parsedUrl.path.startsWith("/lib")
    ) {
      const maxAge = 5*60
      res.setHeader('cache-control', `public, max-age=${maxAge}, s-maxage=${maxAge}`);
    }
    return next()
  });
// End of CORS FIX

  AWS.config.update(config)
  const cloudfront = new AWS.CloudFront({apiVersion: '2016-11-25'})


// find distribution based on origin domain name
  const getDistribution = (callback) => {
    const params = {
      // Marker: 'STRING_VALUE',
      // MaxItems: 'STRING_VALUE'
    }
    cloudfront.listDistributions(params, function (err, data) {
      if (err) {
        console.error(err)
        // WHAT TO DO NOW ?
        callback(err)
        console.log("failed to locate distribution", err, err.stack)
        return
      }
      const items = data.DistributionList.Items
      for (let i = 0; i < items.length; i++) {
        const origins = items[i].Origins
        if (!origins || !origins.Items.length) {
          continue
        }
        const oItems = origins.Items
        for (let j = 0; j < oItems.length; j++) {
          const oItem = oItems[j]
          if (oItem.Id == ORIGIN_ID) {
            callback(null, items[i])
            return
          }
        }
      }
      callback(new Error("Failed to locate distribution"), null)
    });
  }

  const setCDNPrams = (cloudfrontDistribution) => {
    // TODO(stauzs): debug - why this is now working (sometimes) when is executed from setUpCloudFront function?
    // return of this method gets cached somewhere?????
    // this will make meteor files to be loaded from CDN
    const rwHook = (uri) => {
      if (CLOUDFRONT_DOMAIN_NAME) {
        return "//" + CLOUDFRONT_DOMAIN_NAME + uri
      }
      return uri
    }
    WebAppInternals.setBundledJsCssUrlRewriteHook(rwHook)

    /*
    debugging rewrite hook
    let i=0
    const hh = (uri) => {
      return uri + "?" + i
    }
    Meteor.setInterval(() => {
      console.log("HOOK:", i)
      ++i
      if(!(i % 1000)){
        WebAppInternals.setBundledJsCssUrlRewriteHook(hh)
      }
    })
    return;*/

    if (cloudfrontDistribution.Status != "Deployed") {
      Meteor.call("Slack.Cloudfront.notification", `${ORIGIN_ID}: Waiting for cloudfront distribution to be ready. \n this may take a while (up to 30minutes)`)
      cloudfront.waitFor('distributionDeployed', {Id: cloudfrontDistribution.Id},  Meteor.bindEnvironment((err, data) => {
        if (err) {
          console.log(err, err.stack)
          Meteor.call("Slack.Cloudfront.notification", `${ORIGIN_ID}: Distribution didn't become ready. Error: ${err}`, true)
        }
        else {
          CLOUDFRONT_DOMAIN_NAME = cloudfrontDistribution.DomainName
          Meteor.call("Slack.Cloudfront.notification", `${ORIGIN_ID}: Distribution deployed and ready to serve: ${CLOUDFRONT_DOMAIN_NAME}`)
          // we need to set this 2nd time - as meteor has some sort of caching / delay system for ssetBundledJsCssUrlRewriteHook
          WebAppInternals.setBundledJsCssUrlRewriteHook(rwHook)
        }
      }))
    }
    else {
      CLOUDFRONT_DOMAIN_NAME = cloudfrontDistribution.DomainName
      Meteor.call("Slack.Cloudfront.notification", `${ORIGIN_ID}: Cloudfront distribution is Ready @ ${CLOUDFRONT_DOMAIN_NAME}`)
      // we need to set this 2nd time - as meteor has some sort of caching / delay system for setBundledJsCssUrlRewriteHook
      WebAppInternals.setBundledJsCssUrlRewriteHook(rwHook)
    }
  }

  const createDistribution = Meteor.bindEnvironment((callback) => {
    cloudfront.createDistribution(params, callback)
  })

  Meteor.startup(() => {
    getDistribution(Meteor.bindEnvironment((err, cloudfrontDistribution) => {
      if (err) {
        console.error(`Failed to LOAD distribution with error: ${err}`, err)
        Meteor.call("Slack.Cloudfront.notification", `${ORIGIN_ID}: Failed to LOAD distribution with error: ${err} \n Trying to create new Distribution`)

        createDistribution(Meteor.bindEnvironment((err, data) => {
          if (err) {
            Meteor.call("Slack.Cloudfront.notification", `${ORIGIN_ID}: Failed to CREATE distribution with error: ${err}`, true)
            console.error(`Failed to CREATE distribution with error`, err)
            return
          }
          setCDNPrams(data)
        }))
        return
      }
      setCDNPrams(cloudfrontDistribution)
    }))
  })

}
