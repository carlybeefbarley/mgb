#!/bin/bash

echo "Syncing with master..."
rsync -avz -e "ssh -o StrictHostKeyChecking=no -i ~/master.pem" --progress ubuntu@test.mygamebuilder.com:~/mgb/code13/app/tests/ ~/mgb

