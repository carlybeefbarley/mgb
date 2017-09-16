#!/usr/bin/env sh
set -e

echo "====================================================="
echo "DEPLOY PRODUCTION"
echo "====================================================="

sh ./confirm-app-build.sh

export AWS_ACCESS_KEY_ID="104QCDA4V07YPPSVBKG2"
export AWS_SECRET_ACCESS_KEY="QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn"
export AWS_CLOUDFRONT_DISTRIBUTION_ID="E3QW36VHKDBE06"
export AWS_S3_BUCKET_NAME="landing.mygamebuilder.com"
export MGB_LANDING_BASE_URL=/
export MGB_LANDING_HOST="build.games"

echo ""
echo "  Deploying to http://$MGB_LANDING_HOST$MGB_LANDING_BASE_URL"
echo ""

gulp publish
