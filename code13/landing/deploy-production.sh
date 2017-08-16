#!/usr/bin/env sh
set -e

echo "====================================================="
echo "DEPLOY PRODUCTION"
echo "====================================================="

sh ./confirm-app-build.sh

# See some related info at https://medium.com/@willmorgan/moving-a-static-website-to-aws-s3-cloudfront-with-https-1fdd95563106

deploy_to_cloudfront() {
  AWS_ACCESS_KEY_ID="104QCDA4V07YPPSVBKG2" \
  AWS_SECRET_ACCESS_KEY="QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn" \
  AWS_CLOUDFRONT_DISTRIBUTION_ID="$1" \
  AWS_S3_BUCKET_NAME="landing.mygamebuilder.com" \
  gulp awspublish
}

yarn build --silent

echo ""
echo "  Deploying to http://landing.mygamebuilder.com"
echo ""
deploy_to_cloudfront "E2FKDU47P960M9"

echo ""
echo "  Deploying to http://build.games"
echo ""
deploy_to_cloudfront "E3QW36VHKDBE06"

echo ""
echo "  Deploying to http://mycodebuilder.com"
echo ""
deploy_to_cloudfront "E2XZU0ZPCFTF6S"
