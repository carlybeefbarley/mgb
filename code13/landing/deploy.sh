
# This assumes the bucket and distro are set up already. See the values in the gulpfile
#
# See some related info at https://medium.com/@willmorgan/moving-a-static-website-to-aws-s3-cloudfront-with-https-1fdd95563106

export AWS_SECRET_ACCESS_KEY="QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn"
export AWS_ACCESS_KEY_ID="104QCDA4V07YPPSVBKG2"
export AWS_S3_LANDINGPAGE_BUCKETNAME="landing.mygamebuilder.com"


# I could not find a way to re-use the same AWS CloudFront distribution for multiple zone Apexes so I did this...

# CloudFront Distribution for http://landing.mygamebuilder.com

export AWS_S3_LANDINGPAGE_CLOUDFRONT_DISTRIBUTIONID="E2FKDU47P960M9"
npm run awspredeploy
npm run awsdeploy

# CloudFront Distribution for http://build.games
export AWS_S3_LANDINGPAGE_CLOUDFRONT_DISTRIBUTIONID="E3QW36VHKDBE06"
npm run awspredeploy
npm run awsdeploy

# CloudFront Distribution for http://mycodebuilder.com
export AWS_S3_LANDINGPAGE_CLOUDFRONT_DISTRIBUTIONID="E2XZU0ZPCFTF6S"
npm run awspredeploy
npm run awsdeploy

