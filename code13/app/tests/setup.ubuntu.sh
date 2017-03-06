#!/bin/bash
# usage: copy tests/ directory to the test server and run this file
# scp -r -i "aws-autoscale-test.pem" /home/kaspars/Projects/mgb/code13/app/tests ubuntu@ec2-54-196-36-137.compute-1.amazonaws.com:~/mgb

# install npm
sudo apt-get install npm -y
npm install npm

# phantom depends on fontconfig - but npm don't include it - bug?
sudo apt-get install fontconfig -y

# install nvm - node version manager
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
# update PATH - so nvm is available
source ~/.bashrc

# install latest node
nvm install node

# install dependencies
npm install

# create service
sudo bash -c 'cat << EOF > /etc/systemd/system/mgb-test-slave.service
[Unit]
Description=MGB Test Slave
After=network.target

[Service]
User=ubuntu
Restart=always
Type=simple
ExecStart=/home/ubuntu/mgb/runSlave.sh

[Install]
WantedBy=multi-user.target
EOF'

# start service
sudo service mgb-test-slave enable
sudo service mgb-test-slave start



