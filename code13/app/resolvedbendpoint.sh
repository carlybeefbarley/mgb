#!/usr/bin/env sh
set -e
deploy_env=$1
generated_settings_filename=$2

case $deploy_env in
    "staging")  echo "Setting deploy DB endpoints for... $deploy_env"
                MONGO_URL="mongodb://mgbapp:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/mgb2_clus001?replicaSet=rs-ds021730"
                MONGO_OPLOG_URL="mongodb://oplog-reader:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/local?replicaSet=rs-ds021730&authSource=admin";;
 "production")  
                echo "Setting deploy DB endpoints for... $deploy_env" 
                MONGO_URL="mongodb://mgbapp:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/mgb2_clus001?replicaSet=rs-ds021730"
                MONGO_OPLOG_URL="mongodb://oplog-reader:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/local?replicaSet=rs-ds021730&authSource=admin";;
        "aie")  echo "Setting deploy DB endpoints for... $deploy_env" 
                MONGO_URL="mongodb://mgbapp:tiNmhsp1@ds147740-a0.mlab.com:47740,ds147740-a1.mlab.com:47740/mgb2_aie?replicaSet=rs-ds147740"
                MONGO_OPLOG_URL="mongodb://oplog-reader:tiNmhsp1@ds147740-a0.mlab.com:47740,ds147740-a1.mlab.com:47740/local?replicaSet=rs-ds147740&authSource=admin"
            *)  echo "Deployment target $deploy_env not found!" 
                echo "Exiting script!"
                exit 200;;
 esac

cat $generated_settings_filename | \
sed \
-e "s:__MGB_MONGO_URL__:$MONGO_URL:g" \
-e "s:__MGB_MONGO_OPLOG_URL__:$MONGO_OPLOG_URL:g" \
> $generated_settings_filename