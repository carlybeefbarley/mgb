import AWS from 'aws-sdk'
// this is @stauzs personal account
import config from './config.json'

// TODO: is it possible to get this from current running instance?
// Change this for testing purposes
const ORIGIN_DOMAIN_NAME = 'v2.mygamebuilder.com'

// these will be filled at runtime
let CLOUDFRONT_DOMAIN_NAME = ''

AWS.config.update(config)

const cloudfront = new AWS.CloudFront({apiVersion: '2016-11-25'})

// find distribution based on origin domain name
const getDistribution = (callback) => {
  const params = {
    // Marker: 'STRING_VALUE',
    // MaxItems: 'STRING_VALUE'
  }
  cloudfront.listDistributions(params, function(err, data) {
    if (err) {
      console.error(err)
      // WHAT TO DO NOW ?
      callback(err)
      console.log("failed to locate distribution", err, err.stack)
      return
    }
    const items = data.DistributionList.Items
    for(let i=0; i<items.length; i++){
      const origins = items[i].Origins
      if(!origins || !origins.Items.length){
        continue
      }
      const oItems = origins.Items
      for(let j=0; j<oItems.length; j++){
        const oItem = oItems[j]
        if(oItem.Id == ORIGIN_DOMAIN_NAME){
          callback(null, items[i])
          return
        }
      }
    }
    callback(new Error("Failed to locate cloudfront distribution"), null)
  });
}

const setCDNPrams = (cloudfrontDistribution) => {
  CLOUDFRONT_DOMAIN_NAME = cloudfrontDistribution.DomainName

  if(cloudfrontDistribution.Status != "Deployed"){
    cloudfront.waitFor('distributionDeployed', {Id: cloudfrontDistribution.Id}, function(err, data) {
      if (err){
        console.log(err, err.stack)
      }
      else{
        // Meteor don't like this - hardcode CDN?
        // WebAppInternals.setBundledJsCssPrefix(CLOUDFRONT_DOMAIN_NAME)
      }
    })
  }
  else{
    // Meteor don't like this - hardcode CDN?
    // WebAppInternals.setBundledJsCssPrefix(CLOUDFRONT_DOMAIN_NAME)
  }
}

const createDistribution = (callback) => {
  const params = {
    DistributionConfig: {
      /* required */
      CallerReference: 'mgb-'+ORIGIN_DOMAIN_NAME, /* required - A unique value (for example, a date-time stamp) that ensures that the request can't be replayed */
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
        TargetOriginId: ORIGIN_DOMAIN_NAME, /* required */
        TrustedSigners: {
          /* required */
          Enabled: false, /* required - are we going to use ssl */
          Quantity: 0, /* required */
          Items: [/* more items */]
        },
        ViewerProtocolPolicy: 'allow-all', /* allow http and https */ /* allow-all | https-only | redirect-to-https', /* required */
        AllowedMethods: {
          Items: [/* required - only get HEAD makes sense here - as rest goes though WS*/
            //'GET | HEAD | POST | PUT | PATCH | OPTIONS | DELETE',
            /* more items */
            'GET',
            'HEAD'
          ],
          Quantity: 2, /* required */
          CachedMethods: {
            Items: [/* required */
              // 'GET | HEAD | POST | PUT | PATCH | OPTIONS | DELETE',
              /* more items */
              'GET',
              'HEAD'
            ],
            Quantity: 2 /* required */
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
            Id: ORIGIN_DOMAIN_NAME, /* required */
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
              HTTPPort: 80, // required
              HTTPSPort: 443, // required
              OriginProtocolPolicy: 'http-only', // 'http-only | match-viewer | https-only', /* required
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
  cloudfront.createDistribution(params, callback)
}

getDistribution((err, cloudfrontDistribution) => {
  if(err) {
    console.error(err)
    createDistribution((err, data) => {
      if (err){
        console.error(err)
        return
      }
      setCDNPrams(data)
    })
    return
  }
  setCDNPrams(cloudfrontDistribution)
  console.log("CLOUDFRONT SET UP:", "DOMAIN:" + CLOUDFRONT_DOMAIN_NAME)
})


Meteor.methods({
  "CDN.domain": function() {
    return CLOUDFRONT_DOMAIN_NAME
  }
});
