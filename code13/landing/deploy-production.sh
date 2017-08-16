#!/usr/bin/env sh
set -e

# See some related info at https://medium.com/@willmorgan/moving-a-static-website-to-aws-s3-cloudfront-with-https-1fdd95563106

deploy_to_cloudfront() {
  AWS_ACCESS_KEY_ID="104QCDA4V07YPPSVBKG2" \
  AWS_SECRET_ACCESS_KEY="QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn" \
  AWS_CLOUDFRONT_DISTRIBUTION_ID="$1" \
  AWS_S3_BUCKET_NAME="landing.mygamebuilder.com" \
  gulp awspublish
}

yarn run build --silent

# CloudFront Distribution for http://landing.mygamebuilder.com
deploy_to_cloudfront "E2FKDU47P960M9"

# CloudFront Distribution for http://build.games
deploy_to_cloudfront "E3QW36VHKDBE06"

# CloudFront Distribution for http://mycodebuilder.com
deploy_to_cloudfront "E2XZU0ZPCFTF6S"
