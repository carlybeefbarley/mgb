#!/usr/bin/env sh

### Pretty self explanitory but the first arguement is the targeted subdomain for deployment, this is a regular string.
deploy_env=$1

### The second arguement represents the targeted settings.json file.
generated_settings_filename=$2

#####################################################################################################################
### This switch allows you to insert new DB end points for different subdomains in an automated way.
### To add a new domain just add a new switch case ""subdomainNameHere")" after the latest record. Do not insert it after the "*)"
### as that is used to catch invalid inputs and will fire even if your record is matched but after that case.
#####################################################################################################################

case $deploy_env in
    "staging")  echo "Setting deploy DB endpoints to $deploy_env"
                MONGO_URL="mongodb://mgbapp:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/mgb2_clus001?replicaSet=rs-ds021730"
                OPLOG_URL="mongodb://oplog-reader:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/local?replicaSet=rs-ds021730&authSource=admin";;
         "v2")
                echo "Setting deploy DB endpoints to $deploy_env"
                MONGO_URL="mongodb://mgbapp:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/mgb2_clus001?replicaSet=rs-ds021730"
                OPLOG_URL="mongodb://oplog-reader:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/local?replicaSet=rs-ds021730&authSource=admin";;
        "aie")  echo "Setting deploy DB endpoints to $deploy_env"
                MONGO_URL="mongodb://mgbapp:tiNmhsp1@ds147740-a0.mlab.com:47740,ds147740-a1.mlab.com:47740/aie?replicaSet=rs-ds147740"
                OPLOG_URL="mongodb://oplog-reader:tiNmhsp1@ds147740-a0.mlab.com:47740,ds147740-a1.mlab.com:47740/local?replicaSet=rs-ds147740&authSource=admin";;
            *)  echo "Deployment target \"$deploy_env\" not found!"
                exit 1;;
 esac

echo "Output: $generated_settings_filename"

###  Gotta escape those pesky '&'s, sed likes to insert to search regex where it finds an '&' in the output. You also have to escape \ to escape &
###  in the replacement string. This is about the same amount of effort I put into escaping my own problems :D Unfortunately, stack overflow does 
###  not have the answers to those kinds of problems.
OPLOG_URL=$(echo ${OPLOG_URL} | sed -e "s@\&@\\\&@g")

sed  -i "s%__MGB_MONGO_URL__%$MONGO_URL%g" $generated_settings_filename
sed  -i "s%__MGB_OPLOG_URL__%$OPLOG_URL%g" $generated_settings_filename

echo "Deploy Target Set To: $deploy_env"
