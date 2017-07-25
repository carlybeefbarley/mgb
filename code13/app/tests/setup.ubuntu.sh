#!/usr/bin/env sh
# usage: copy this file and certificate to remote server
# scp -r -i ~/aws-free.pem /home/kaspars/Projects/mgb/code13/app/tests ubuntu@ec2-54-196-36-137.compute-1.amazonaws.com:~/mgb

# install npm
sudo apt-get install yarn -y

# phantom depends on fontconfig - but npm don't include it - bug?
sudo apt-get install fontconfig -y

# install nvm - node version manager
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | sh

# update PATH - so nvm is available
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# install latest node
nvm install node

# install dependencies
yarn

# create service - move to separate file and copy instead of creating at runtime?
sudo sh -c 'cat << EOF > /etc/systemd/system/mgb-test-slave.service
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

# update services daemon
sudo systemctl daemon-reload
# start service
# ubuntu service has some sort of bug ... so use systemctl instead
#sudo service mgb-test-slave enable # this seems to be failing.. is it required at all ???
#sudo service mgb-test-slave start

# enable service - so it can start automatically
sudo systemctl enable mgb-test-slave.service
# start service
sudo systemctl start mgb-test-slave.service


