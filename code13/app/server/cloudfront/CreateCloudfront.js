/*
 This script will automatically set up AWS CloudFront distribution for ORIGIN_DOMAIN_NAME
 At first it will try to reuse previously created distribution for ORIGIN_DOMAIN_NAME
 Change AWS auth keys in the ./config.json
 Check server_main.js - to enable this script for production

 For more information see:
  AWS CloudFront docs: https://aws.amazon.com/cloudfront/
  MGB DevDocs Notes:   app/DeveloperDocs/CloudfrontSummary.md
 */

import _ from 'lodash'
import AWS from 'aws-sdk'
import config from './config.json'
import '/server/slackIntegration'

// See https://docs.meteor.com/packages/webapp.html
//   The webapp package is what lets your Meteor app serve content to a web browser
//   This package also allows you to add handlers for HTTP requests.
import { WebApp, WebAppInternals } from 'meteor/webapp'

// This will be set at runtime by setCDNParams() which will retrieve this value from AWS.
// If it is not configured, then the various features using this shall fallback to non-cloudfronted
// force localhost:3000 if in development mode.. to try out CDN like behaviour locally - add test.loc to /etc/hosts
// 127.0.0.1 test.loc

let CLOUDFRONT_DOMAIN_NAME = Meteor.isDevelopment ? '' : ''

const STATIC_RESOURCES_MAX_CACHE_AGE_MINUTES = 60 // This should be much larger for PRODUCTION

// Domain names used in this file:
const DEFAULT_CUSTOMER_FACING_MGB_ORIGIN_DOMAIN_NAME = 'test.mygamebuilder.com' // Can be overriden by env.ORIGIN_DOMAIN_NAME
const DEFAULT_CUSTOMER_FACING_MGB_ORIGIN_ID = 'test.mygamebuilder.com' // ID is actually different to DOMAIN NAME, BUT WE HAPPEN TO HAVE CONFIGURED ORIGIN_ID=DN+Path in CloudFront :)
const DEFAULT_ISDEVELOPMENT_MGB_CLOUDFRONT_ORIGIN_ID = 'test.mygamebuilder.com-dev' // Can be overriden by env.ORIGIN_ID.  THIS MUST be different to DEFAULT_CUSTOMER_FACING_MGB_ORIGIN_ID

// CORS fixes, needs to have the domain names we will test/deploy against. These are used in WebApp.rawConnectHandlers.use()
const allowedOrigins = [
  // test relase
  'http://test.mygamebuilder.com',
  'https://test.mygamebuilder.com',

  // dev version on test server
  'http://test.mygamebuilder.com:3000',

  // main page
  'http://v2.mygamebuilder.com',
  'https://v2.mygamebuilder.com',

  // latest master
  'http://staging.mygamebuilder.com',
  'https://staging.mygamebuilder.com',

  // local developement
  'http://localhost:3000',
  'http://test.loc:3000',

  // mobile device
  'http://localhost:12224',
  'https://localhost:12224',
]

export const getCDNDomain = () => CLOUDFRONT_DOMAIN_NAME
// The Client at first load will try to get CLOUDFRONT_DOMAIN_NAME using this Meteor.call() RPC
// so it can use the CDN name for Ajax requests that we want to route via the CDN
Meteor.methods({
  'CDN.domain': getCDNDomain,
})

export const setUpCloudFront = function() {
  // CORS fixes, needs to have the domain names we will test/deploy against (defined at top of file in allowedOrigins)
  WebApp.rawConnectHandlers.use(function(req, res, next) {
    if (req._parsedUrl.pathname === '/') {
      res.setHeader('cache-control', `no-store, must-revalidate`)
      res.setHeader('pragma', `no-cache`)
      return next()
    }
    const isFont =
      req._parsedUrl.pathname.endsWith('.woff2') ||
      req._parsedUrl.pathname.endsWith('.woff') ||
      req._parsedUrl.pathname.endsWith('.ttf')
    if (isFont) {
      res.setHeader('access-control-allow-origin', '*')
      const maxAge = 5 * 60
      res.setHeader('cache-control', `public, max-age=${maxAge}, s-maxage=${maxAge}`)
    } else {
      const index = req.headers.origin
        ? allowedOrigins.indexOf(req.headers.origin)
        : allowedOrigins.indexOf(req.headers.host)
      if (index > -1) {
        res.setHeader('access-control-allow-origin', allowedOrigins[index])
        // If the server specifies an origin host other than "*",
        // then it must also include Origin in the 'Vary' response header
        // to indicate to clients that server responses will differ
        // based on the value of the Origin request header.
        res.setHeader('vary', 'origin')
      }
      // Also allow for all domains
      // res.setHeader('access-control-allow-origin', '*')   // This is the wide-open option. Leaving it here since it can be helpful for debugging
      res.setHeader('access-control-expose-headers', 'etag')

      // Cache static files for STATIC_RESOURCES_MAX_CACHE_AGE_MINUTES - after Meteor update they will be invalidated before cache expires
      if (
        req._parsedUrl.path.startsWith('/badges') ||
        req._parsedUrl.path.startsWith('/audio') ||
        req._parsedUrl.path.startsWith('/images') ||
        req._parsedUrl.path.startsWith('/lib')
      ) {
        const maxAge = STATIC_RESOURCES_MAX_CACHE_AGE_MINUTES * 60
        res.setHeader('cache-control', `public, max-age=${maxAge}, s-maxage=${maxAge}, must-revalidate`)
      }
    }
    return next()
  })
  // End of CORS FIX

  // Are we currently on a test server but running with production flag? If so, return now to bypass CloudFront
  if (!Meteor.isProduction) return

  // TODO(@stauzs#252): make detection of changes to CloudFront Parameters automatic
  //   Issue: AWS provides no way for us to easily/quickly check if the CloudFront config
  //   has been really changed - so we need to do it manually for now.
  //   See #https://github.com/devlapse/mgb/issues/252 for the workitem to do thus
  const needToUpdateCloudFrontParameters = false //   <--  // don't set this to true unless you REALLY know what you are doing (like @stauzs)

  // AWS CloudFront Config
  const ORIGIN_DOMAIN_NAME = process.env.ORIGIN_DOMAIN_NAME || DEFAULT_CUSTOMER_FACING_MGB_ORIGIN_DOMAIN_NAME
  const ORIGIN_ID =
    process.env.ORIGIN_ID ||
    (Meteor.isProduction
      ? DEFAULT_CUSTOMER_FACING_MGB_ORIGIN_ID
      : DEFAULT_ISDEVELOPMENT_MGB_CLOUDFRONT_ORIGIN_ID)
  const HTTP_PORT = Meteor.isProduction ? 80 : 3000
  const HTTPS_PORT = 443
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudFront.html
  const params = {
    // AWS CloudFront Params. Comments are from their docs
    DistributionConfig: {
      /* required */
      CallerReference:
        'mgb-' +
        ORIGIN_ID /* required - A unique value (for example, a date-time stamp) that ensures that the request can't be replayed */,
      Comment: ORIGIN_ID /* required */,
      DefaultCacheBehavior: {
        /* required */
        ForwardedValues: {
          /* required */
          Cookies: {
            /* required */
            Forward: 'none', // 'none | whitelist | all', /* required */ we are not using cookies (may be required for some sort of authentication in the future
            WhitelistedNames: {
              Quantity: 0 /* required */,
              Items: [],
            },
          },
          QueryString: true /* required - this will affect update to new sources - e.g. meteor uses hash=xxxxxx */,
          Headers: {
            Quantity: 2 /* required - send all headers to origin ?? or none */,
            Items: ['Origin', 'Accept'],
          },
          QueryStringCacheKeys: {
            Quantity: 0 /* required */,
            Items: [
              /* more items */
            ],
          },
        },
        MinTTL: 0 /* required */,
        TargetOriginId: ORIGIN_ID /* required */,
        TrustedSigners: {
          /* required */
          Enabled: false /* required - are we going to use ssl */,
          Quantity: 0 /* required */,
          Items: [
            /* more items */
          ],
        },
        // there is no point to force cloudfront to connect to https site - as resource still will be cached and won't work for http / https separately
        // also https have some really strange behavior - and SOMETIMES returns 502 error (probably related to internal CF certificates and some config related to certificates)
        // + http is faster
        ViewerProtocolPolicy: 'allow-all', //'allow-all', /* allow http and https */ /* allow-all | https-only | redirect-to-https', /* required */
        /* only GTE HEAD makes sense here - as rest goes through WS - OPTIONS is required for CORS headers (only semantic fonts requires this atm)*/
        AllowedMethods: {
          Items: [
            /* required */
            //'GET | HEAD | POST | PUT | PATCH | OPTIONS | DELETE',
            /* more items */
            'GET',
            'HEAD',
            'OPTIONS',
          ],
          Quantity: 3 /* required */,
          CachedMethods: {
            Items: [
              /* required */
              // 'GET | HEAD | POST | PUT | PATCH | OPTIONS | DELETE',
              /* more items */
              'GET',
              'HEAD',
              'OPTIONS',
            ],
            Quantity: 3 /* required */,
          },
        },
        Compress: false /* meteor will compress response by default - is it possible to turn off compression on meteor??? */,
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
        SmoothStreaming: false /* Indicates whether you want to distribute media files in the Microsoft Smooth Streaming format using the origin that is associated with this cache behavior. */,
      },
      // ?? is this valid - Specifies whether you want CloudFront to save access logs to an Amazon S3 bucket.
      // seems that this is general Distribution option
      Enabled: true, //true || false, /* required */
      Origins: {
        /* required */
        Quantity: 1 /* required */,
        Items: [
          {
            DomainName: ORIGIN_DOMAIN_NAME /* required */,
            Id: ORIGIN_ID /* required */,
            CustomHeaders: {
              Quantity: 0 /* required */,
              Items: [
                /*{
                 HeaderName: 'STRING_VALUE', // required
                 HeaderValue: 'STRING_VALUE' // required
                 },*/
                /* more items */
              ],
            },

            //!!! this is not working with port 80
            CustomOriginConfig: {
              HTTPPort: HTTP_PORT, // required
              HTTPSPort: HTTPS_PORT, // required
              OriginProtocolPolicy: 'match-viewer', // 'http-only | match-viewer | https-only', /* required
              OriginSslProtocols: {
                // TODO: set up SSL
                Items: [
                  // required
                  //'SSLv3 | TLSv1 | TLSv1.1 | TLSv1.2',
                  // 'SSLv3',
                  'TLSv1',
                  'TLSv1.1',
                  'TLSv1.2',
                ],
                Quantity: 3, // required
              },
            },
            OriginPath: '',
            /*
             only for S3
             S3OriginConfig: {
             OriginAccessIdentity: 'STRING_VALUE' // required
             }*/
          },
          /* more items */
        ],
      },
      // TODO: set up alias - e.g. cdn.mygamebuilder.com
      Aliases: {
        Quantity: 0 /* required */,
        Items: [] /* 'STRING_VALUE' */,
      },
      // use default for all
      CacheBehaviors: {
        Quantity: 0 /* required */,
        Items: [
          /* more items */
        ],
      },
      // TODO: do we need custom error responses ???
      CustomErrorResponses: {
        Quantity: 6 /* required */,
        Items: [
          {
            ErrorCode: 400, // bad request
            ErrorCachingMinTTL: 0,
          },
          {
            ErrorCode: 404, // not found !!! this is most important
            ErrorCachingMinTTL: 0,
          },
          {
            ErrorCode: 500, // internal server error - we got these sometimes - usually when api function throws exception
            ErrorCachingMinTTL: 0,
          },
          {
            ErrorCode: 502, // bad gateway
            ErrorCachingMinTTL: 0,
          },
          {
            ErrorCode: 503, // bad gateway
            ErrorCachingMinTTL: 0,
          },
          {
            ErrorCode: 504, // gateway timed out - our server has crashed
            ErrorCachingMinTTL: 0,
          },
          /*{
           ErrorCode: 0, // required
           ErrorCachingMinTTL: 0,
           ResponseCode: 'STRING_VALUE',
           ResponsePagePath: 'STRING_VALUE'
           },*/
          /* more items */
        ],
      },
      DefaultRootObject: '', // The object that you want CloudFront to request from your origin (for example, index.html) when a viewer requests the root URL for your distribution - If you don't want to specify a default root object when you create a distribution, include an empty DefaultRootObject element.
      // HttpVersion: 'http1.1 | http2', // http2 is default
      // TODO: research if we really need IPv6

      // this throws an error
      // IsIPV6Enabled: false, // true || false,
      Logging: {
        Bucket: '' /* required */,
        Enabled: false, // true || false, /* required */
        IncludeCookies: false, // true || false, /* required */
        Prefix: '' /* required */,
      },
      PriceClass: 'PriceClass_All', // 'PriceClass_100 | PriceClass_200 | PriceClass_All',
      // TODO - may be needed at some point
      Restrictions: {
        GeoRestriction: {
          /* required */
          Quantity: 0 /* required */,
          RestrictionType: 'none', // 'blacklist | whitelist | none', /* required */
          Items: [
            /* more items */
          ],
        },
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
    },
  }
  // this will be filled at runtime - after script will get assigned domain name (xxxxx.cloudfront.com)

  AWS.config.update(config)
  const cloudfront = new AWS.CloudFront({ apiVersion: '2016-11-25' })

  // find an AWS CloudFront 'distribution' based on ORIGIN ID
  const getDistribution = callback => {
    const distributionQuery = {
      // Marker:   'STRING_VALUE',
      // MaxItems: 'STRING_VALUE'
    }
    cloudfront.listDistributions(
      distributionQuery,
      Meteor.bindEnvironment(function(err, data) {
        if (err) {
          console.error('AWS CloudFront listDistributions() returned error', err, err.stack)
          // WHAT TO DO NOW ?  TODO(@stauzs)
          callback(err)
          return
        }

        const items = data.DistributionList.Items
        for (let i = 0; i < items.length; i++) {
          const origins = items[i].Origins
          if (!origins || !origins.Items.length) continue

          const oItems = origins.Items
          for (let j = 0; j < oItems.length; j++) {
            const oItem = oItems[j]
            if (oItem.Id == ORIGIN_ID) {
              if (!needToUpdateCloudFrontParameters) {
                callback(null, items[i])
                return
              }

              // TODO: Need to compare configs. See #252 for workitem
              cloudfront.getDistributionConfig(
                { Id: items[i].Id },
                Meteor.bindEnvironment(function(err, data) {
                  const newParams = _.merge({ Id: items[i].Id }, data, params)
                  newParams.IfMatch = data.ETag
                  delete newParams.ETag

                  cloudfront.updateDistribution(
                    newParams,
                    Meteor.bindEnvironment(function(err, data) {
                      if (err) {
                        console.log('Failed to update CloudFront distribution', err, err.stack)
                        Meteor.call(
                          'Slack.Cloudfront.notification',
                          `${ORIGIN_ID}: Failed to update CloudFront distribution: ${err}`,
                        )
                      } else {
                        Meteor.call(
                          'Slack.Cloudfront.notification',
                          `${ORIGIN_ID}: CloudFront distribution updated`,
                        )
                      }
                      callback(null, items[i])
                    }),
                  )
                }),
              )

              return
            }
          }
        }
        callback(new Error('Failed to locate CloudFront distribution'), null)
      }),
    )
  }

  // This is called via Meteor.Startup() later in this file
  const setCDNParams = cloudfrontDistribution => {
    // this will make meteor files to be loaded from CDN
    const rwHook = uri => (CLOUDFRONT_DOMAIN_NAME ? '//' + CLOUDFRONT_DOMAIN_NAME + uri : uri)

    WebAppInternals.setBundledJsCssUrlRewriteHook(rwHook) // TODO: (@STAUZS) see if we really need this here)

    if (cloudfrontDistribution.Status != 'Deployed') {
      Meteor.call(
        'Slack.Cloudfront.notification',
        `${ORIGIN_ID}: Waiting for CloudFront distribution to be ready. \n this may take a while (up to 30 minutes)`,
      )
      cloudfront.waitFor(
        'distributionDeployed',
        { Id: cloudfrontDistribution.Id },
        Meteor.bindEnvironment((err, data) => {
          if (err) {
            Meteor.call(
              'Slack.Cloudfront.notification',
              `${ORIGIN_ID}: Distribution failed to become ready. Error: ${err}`,
              true,
            )
            // retry.. as it tends to time out - if Cloudfront Deploying takes more than 20 minutes
            setCDNParams(cloudfrontDistribution)
          } else {
            CLOUDFRONT_DOMAIN_NAME = cloudfrontDistribution.DomainName
            Meteor.call(
              'Slack.Cloudfront.notification',
              `${ORIGIN_ID}: Distribution deployed and ready to serve: ${CLOUDFRONT_DOMAIN_NAME}`,
            )
            // we need to set this a 2nd time - as Meteor has some sort of
            // caching / delay system for WebAppInternals.setBundledJsCssUrlRewriteHook
            WebAppInternals.setBundledJsCssUrlRewriteHook(rwHook)
          }
        }),
      )
    } else {
      CLOUDFRONT_DOMAIN_NAME = cloudfrontDistribution.DomainName
      Meteor.call(
        'Slack.Cloudfront.notification',
        `${ORIGIN_ID}: CloudFront distribution is Ready @ ${CLOUDFRONT_DOMAIN_NAME}`,
      )
      // we need to set this a 2nd time - as Meteor has some sort of
      // caching / delay system for WebAppInternals.setBundledJsCssUrlRewriteHook
      WebAppInternals.setBundledJsCssUrlRewriteHook(rwHook)
    }
  }

  const createDistribution = Meteor.bindEnvironment(callback => {
    cloudfront.createDistribution(params, callback)
  })

  Meteor.startup(() => {
    getDistribution(
      Meteor.bindEnvironment((err, cloudfrontDistribution) => {
        if (err) {
          console.error(`Failed to LOAD CloudFront distribution with error: ${err}`, err)
          Meteor.call(
            'Slack.Cloudfront.notification',
            `${ORIGIN_ID}: Failed to LOAD distribution with error: ${err} \n Trying to create new Distribution`,
          )

          createDistribution(
            Meteor.bindEnvironment((err, data) => {
              if (err) {
                Meteor.call(
                  'Slack.Cloudfront.notification',
                  `${ORIGIN_ID}: Failed to CREATE distribution with error: ${err}`,
                  true,
                )
                console.error(`Failed to CREATE distribution with error`, err)
                return
              }
              setCDNParams(data)
            }),
          )
          return
        }
        setCDNParams(cloudfrontDistribution)
      }),
    )
  })
} // end of setUpCloudFront()
