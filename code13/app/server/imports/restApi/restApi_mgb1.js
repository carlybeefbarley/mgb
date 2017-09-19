import { RestApi } from './restApi'

// These are the APIs for extracting information from the legacy MGBv1 site

import AWS from 'aws-sdk'
import pako from 'pako'
import xml2js from 'xml2js'

// AWS config for MGB1 S3 buckets  ** secrets ** #insecure# ??
const aws_s3_region = 'us-east-1' // US-East-1 is the 'global' site for S3
AWS.config.update({
  accessKeyId: '104QCDA4V07YPPSVBKG2',
  secretAccessKey: 'QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn',
})

// MGBv1 TILE
// eg http://localhost:3000/api/mgb1/tile/.acey53/Club+Penguin+Agents+Under+Attack/100+coins

RestApi.addRoute(
  'mgb1/tile/:account/:project/:name',
  { authRequired: false },
  {
    get() {
      let newUrl = `https://s3.amazonaws.com/JGI_test1/${this.urlParams.account}/${this.urlParams
        .project}/tile/${this.urlParams.name}`
      return {
        statusCode: 301, // MOVED (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
        headers: {
          Location: newUrl + '?quickHack=2', // fix problems with some files that were cached before I changed the CORS policy
          // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200
        },
        body: {},
      }
    },
  },
)

// MGBv1 ACTOR
// eg http://localhost:3000/api/mgb1/actor/.acey53/Club%20Penguin%20Agents%20Under%20Attack/100coins
//or http://localhost:3000/api/mgb1/actor/.acey53/Club%20Penguin%20Agents%20Under%20Attack/100coins?getTilePngRedirect=1 to get just the tile PNG as a redirect (2 bounces but let's optimize later)

RestApi.addRoute(
  'mgb1/actor/:account/:project/:name',
  { authRequired: false },
  {
    get() {
      let s3Key = `${this.urlParams.account}/${this.urlParams.project}/actor/${this.urlParams.name}`
      var s3 = new AWS.S3({ region: aws_s3_region, maxRetries: 3 })
      var getObjectSync = Meteor.wrapAsync(s3.getObject, s3)
      var response = {},
        savedError = {}
      try {
        response = getObjectSync({ Bucket: 'JGI_test1', Key: s3Key })
      } catch (err) {
        savedError = err // We're gonna report everything as 404 really
        console.dir('MGB1 actor import error: ', err)
      }

      if (savedError && savedError.code)
        return {
          statusCode: 404,
          headers: {},
          body: {},
        }

      if (this.queryParams.getTilePngRedirect) {
        return {
          statusCode: 301, // MOVED (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
          headers: {
            Location: `/api/mgb1/tile/${this.urlParams.account}/${this.urlParams.project}/${response.Metadata
              .tilename}`,
            // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200
          },
          body: {},
        }
      }

      // At this point, the required data should be in response.Body and response.Metadata

      // response.Body needs a lot of processing from the strange MGBv1 formats (Adobe Flex made me do it...)
      var byteArray = new Uint8Array(response.Body)
      var data2 = pako.inflate(byteArray)
      var data3 = new Uint16Array(data2)
      var strData = String.fromCharCode.apply(null, data3)
      while (strData[0] !== '{' && strData.length > 0) strData = strData.substring(1)
      strData = strData.replace(/{{{/g, '<').replace(/}}}/g, '>')

      var jsonData
      xml2js.parseString(strData, { explicitArray: false, async: false }, function(e, r) {
        var animT = r.actor.animationTable
        r.actor.animationTable = animT.split('#')
        r.actor.animationTable = _.map(r.actor.animationTable, function(x) {
          var a = x.split('|')
          return { action: a[0], tileName: a[1], effect: a[2] }
        })
        jsonData = r // since we requested with async:false we know that this callback completes before we get to then next line of the outer scope
      })

      jsonData.metadata = response.Metadata

      return {
        statusCode: 200, // just for now...
        body: jsonData,
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200
        },
      }
    },
  },
)

// TODO(stauzs): don't forget to remove this when actors are done
RestApi.addRoute(
  'mgb1/actor-for-diff/:account/:project/:name',
  { authRequired: false },
  {
    get() {
      let s3Key = `${this.urlParams.account}/${this.urlParams.project}/actor/${this.urlParams.name}`
      var s3 = new AWS.S3({ region: aws_s3_region, maxRetries: 3 })
      var getObjectSync = Meteor.wrapAsync(s3.getObject, s3)
      var response = {},
        savedError = {}
      try {
        response = getObjectSync({ Bucket: 'JGI_test1', Key: s3Key })
      } catch (err) {
        savedError = err // We're gonna report everything as 404 really
        console.dir('MGB1 actor import error: ', err)
      }

      if (savedError && savedError.code)
        return {
          statusCode: 404,
          headers: {},
          body: {},
        }

      if (this.queryParams.getTilePngRedirect) {
        return {
          statusCode: 301, // MOVED (redirect). See https://developer.mozilla.org/en-US/docs/Web/HTTP/Response_codes
          headers: {
            Location: `/api/mgb1/tile/${this.urlParams.account}/${this.urlParams.project}/${response.Metadata
              .tilename}`,
            // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200
          },
          body: {},
        }
      }

      // At this point, the required data should be in response.Body and response.Metadata

      // response.Body needs a lot of processing from the strange MGBv1 formats (Adobe Flex made me do it...)
      var byteArray = new Uint8Array(response.Body)
      var data2 = pako.inflate(byteArray)
      var data3 = new Uint16Array(data2)
      var strData = String.fromCharCode.apply(null, data3)
      while (strData[0] !== '{' && strData.length > 0) strData = strData.substring(1)
      strData = strData.replace(/{{{/g, '<').replace(/}}}/g, '>')

      var jsonData
      xml2js.parseString(strData, { explicitArray: false, async: false }, function(e, r) {
        var animT = r.actor.animationTable
        r.actor.animationTable = animT.split('#')
        r.actor.animationTable = _.map(r.actor.animationTable, function(x) {
          var a = x.split('|')
          return { action: a[0], tileName: a[1], effect: a[2] }
        })
        jsonData = r // since we requested with async:false we know that this callback completes before we get to then next line of the outer scope
      })

      jsonData.metadata = response.Metadata

      return {
        statusCode: 200, // just for now...
        body: `diff(${JSON.stringify(jsonData.actor.databag)})`,
        headers: {
          'Content-Type': 'text/plain',
          // TODO: Add caching. See example of http://graph.facebook.com/4/picture?width=200&height=200
        },
      }
    },
  },
)

// MGBv1 MAP - this preserves the original structure.
// eg http://localhost:3000/api/mgb1/map/.acey53/Club%20Penguin%20Agents%20Under%20Attack/HQ

RestApi.addRoute(
  'mgb1/map/:account/:project/:name',
  { authRequired: false },
  {
    get() {
      let s3Key = `${this.urlParams.account}/${this.urlParams.project}/map/${this.urlParams.name}`
      var s3 = new AWS.S3({ region: aws_s3_region, maxRetries: 3 })
      var getObjectSync = Meteor.wrapAsync(s3.getObject, s3)
      var response = {},
        savedError = {}
      try {
        response = getObjectSync({ Bucket: 'JGI_test1', Key: s3Key })
      } catch (err) {
        savedError = err // We're gonan report everything as 404 really
      }

      if (savedError && savedError.code)
        return {
          statusCode: 404,
          headers: {},
          body: {},
        }

      // At this point, the required data should be in response.Body and response.Metadata

      // response.Body needs a LOT of processing from the strange MGBv1 formats (Adobe Flex made me do it, honest...)
      var jsonData = {} // This is where we will put the result
      var byteArray = new Uint8Array(response.Body)
      var data2 = pako.inflate(byteArray)
      var b = new Buffer(data2)
      var offset = 0
      var maxLayers = b.readUInt32BE(offset)
      offset += 4
      jsonData.maxLayers = maxLayers
      jsonData.mapLayer = []
      for (let layer = 0; layer < maxLayers; layer++) {
        jsonData.mapLayer[layer] = []
        var layerLen = b.readInt32BE(offset)
        offset += 4

        for (let i = 0; i < layerLen; i++) {
          var strLen = b.readInt16BE(offset)
          offset += 2
          if (strLen > 0) {
            var str = b.toString('utf8', offset, offset + strLen)
            offset += strLen
            jsonData.mapLayer[layer].push(str)
          } else jsonData.mapLayer[layer].push('')
        }
      }

      jsonData.metadata = response.Metadata

      // Strip out unneeded items
      delete jsonData.metadata['tilename']
      delete jsonData.metadata['content-type']
      delete jsonData.metadata['acl']
      delete jsonData.metadata['blobencoding']

      return {
        statusCode: 200,
        body: jsonData,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    },
  },
)
