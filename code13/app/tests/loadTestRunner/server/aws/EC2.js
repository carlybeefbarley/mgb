const AWS = require('aws-sdk')
const config = require('./config')
const fs = require('fs')

const ec2 = new AWS.EC2(config.aws)
console.log('AWS config:', config.aws)
// AWS.config.update(config.aws)

const instancesFilename = __dirname + '/instances.json'
const loadedInstancesStr = fs.readFileSync(instancesFilename)
const loadedInstances = JSON.parse(loadedInstancesStr)

module.exports = {
  /* t2.micro - has free tier */
  createSlaves(cb, count = 1, type = 't2.micro') {
    const params = {
      ImageId: config.slave.ami,
      InstanceType: type, //'t1.micro | t2.nano | t2.micro | t2.small | t2.medium | t2.large | t2.xlarge | t2.2xlarge | m1.small | m1.medium | m1.large | m1.xlarge | m3.medium | m3.large | m3.xlarge | m3.2xlarge | m4.large | m4.xlarge | m4.2xlarge | m4.4xlarge | m4.10xlarge | m4.16xlarge | m2.xlarge | m2.2xlarge | m2.4xlarge | cr1.8xlarge | r3.large | r3.xlarge | r3.2xlarge | r3.4xlarge | r3.8xlarge | r4.large | r4.xlarge | r4.2xlarge | r4.4xlarge | r4.8xlarge | r4.16xlarge | x1.16xlarge | x1.32xlarge | i2.xlarge | i2.2xlarge | i2.4xlarge | i2.8xlarge | i3.large | i3.xlarge | i3.2xlarge | i3.4xlarge | i3.8xlarge | i3.16xlarge | hi1.4xlarge | hs1.8xlarge | c1.medium | c1.xlarge | c3.large | c3.xlarge | c3.2xlarge | c3.4xlarge | c3.8xlarge | c4.large | c4.xlarge | c4.2xlarge | c4.4xlarge | c4.8xlarge | cc1.4xlarge | cc2.8xlarge | g2.2xlarge | g2.8xlarge | cg1.4xlarge | p2.xlarge | p2.8xlarge | p2.16xlarge | d2.xlarge | d2.2xlarge | d2.4xlarge | d2.8xlarge | f1.2xlarge | f1.16xlarge',

      MinCount: count,
      MaxCount: count,
      InstanceInitiatedShutdownBehavior: 'terminate', //'stop | terminate',
      //DryRun: true, // || false,
      Monitoring: {
        Enabled: false, // true || false /* required */
      },
    }

    if (config.SubnetId) {
      params.SubnetId = config.SubnetId
    }

    ec2.runInstances(params, function(err, data) {
      if (err) {
        console.log('Could not create instance', err)
        cb && cb(err)
        return
      }

      const ids = []
      data.Instances.forEach(instance => {
        console.log('Created instance:', instance.InstanceId)
        loadedInstances.push(instance.InstanceId)
        ids.push(instance.InstanceId)
      })
      fs.writeFileSync(instancesFilename, JSON.stringify(loadedInstances))
      ec2.waitFor('instanceStatusOk', ids, function(err, data) {
        console.log('INSTANCE OK', data)
        if (err) {
          // an error occurred
          cb && cb(err)
        } else {
          cb && cb()
        }
      })

      // TODO: Add tags to the instance
      /*const tagParams = {Resources: [instanceId], Tags: [{
          Key: 'Name',
          Value: 'SDK Sample'
        }
      ]};
      ec2.createTags(tagParams, function(err) {
        console.log("Tagging instance", err ? "failure" : "success");
      });*/
    })
  },
  terminateSlaves(cb) {
    var params = {
      InstanceIds: loadedInstances,
      DryRun: false, // true || false
    }
    ec2.terminateInstances(params, function(err, data) {
      if (err)
        console.log(err, err.stack) // an error occurred
      else console.log(data) // successful response

      cb && cb(err)
    })
  },
}
