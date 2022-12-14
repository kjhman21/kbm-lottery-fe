#!/bin/bash
npm run build
tar -cvzf build.tgz build
scp -i ~/.ssh/klaytn-cell.pem build.tgz ec2-user@klaytn_colin: