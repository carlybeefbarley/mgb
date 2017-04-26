
# This assumes the bucket and distro are set up already. See the values in the gulpfile
#
# See some related info at https://medium.com/@willmorgan/moving-a-static-website-to-aws-s3-cloudfront-with-https-1fdd95563106

export AWS_SECRET_ACCESS_KEY="QB65XLlJzlQ4w8ifWhkhv/a48ayihIS9k8v7CSPn"
export AWS_ACCESS_KEY_ID="104QCDA4V07YPPSVBKG2"
npm run awspredeploy
npm run awsdeploy