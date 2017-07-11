module.exports = {
  aws: {
    accessKeyId: '104QCDA4V07YPPSVBKG2',
    secretAccessKey: 'QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn',
    region: 'us-east-1',
    apiVersion: '2016-11-15',
  },
  slave: {
    ami: 'ami-496acc5f',
  },
  // SubnetId:  // accounts without default VPC requires subnet to start Instance
  // new accounts have default subnet, old accounts (before 2014) - don't.
  // also default subnet can be deleted
  // need to contact aws support if there is need to create new default vpc
  SubnetId: 'subnet-87e99fdc',
}

/*
module.exports = {
  aws: {
    "accessKeyId": "AKIAIUGO5M3BAOAW4MLQ",
    "secretAccessKey": "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",
    "region": "us-east-1",
    apiVersion: '2016-11-15'
  },
  slave: {
    ami: 'ami-7463bb62'
  }
}
*/
