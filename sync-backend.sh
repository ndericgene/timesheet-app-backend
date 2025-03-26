#!/bin/bash

PEM="$HOME/.ssh/timesheet-backend-key.pem"
REMOTE="ubuntu@3.144.222.214"
APP_PATH="/home/ubuntu/timesheet-app-backend"
LOCAL_PATH="$HOME/centralmech-backups/timesheet-backend/"

echo "== Syncing backend code to EC2..."
rsync -avz --delete -e "ssh -i $PEM" "$LOCAL_PATH" "$REMOTE:$APP_PATH"

echo "== Running backend deploy script remotely..."
ssh -i "$PEM" $REMOTE "cd $APP_PATH && ./deploy-backend.sh"

echo "== ✅ Backend synced and restarted"
