#!/bin/bash

# Variables
ip_staging=*******
ip_production=***********
keyPair_staging=************.pem
keyPair_production=************.pem
dirStaging="/home/************"
dirProduction="/home/***********"
distZip="dist.zip"

# Deploy common steps
deploy_common() {
    rm $distZip
    cp -v package.json ./dist/package.json
    cp -v $processFile ./dist/$processFile
    cp -v firebase-admin.json ./dist/firebase-admin.json
    zip -r $distZip dist/*
    scp -i ~/.ssh/${keyPair} $distZip ubuntu@${ip}:/home/ubuntu/

    ssht="unzip $distZip"
    ssht+=" && sudo rm -Rf $dir/*"
    ssht+=" && sudo mv dist $dir/"
    ssht+=" && sudo mv $dir/dist/* $dir"
    ssht+=" && cd /home/ubuntu/"
    ssht+=" && rm $distZip"
    ssht+=" && cd $dir"
    ssht+=" && sudo rm -Rf dist"
    ssht+=" && yarn"
}

# Function: Deploy staging
f-deploy-staging() {
    ip=${ip_staging}
    keyPair=${keyPair_staging}
    dir=${dirStaging}
    processFile="process.staging.json"
    deploy_common
}

# Function: Deploy production
f-deploy-production() {
    ip=${ip_production}
    keyPair=${keyPair_production}
    dir=${dirProduction}
    processFile="process.json"
    deploy_common
}

# Main Script
while [[ "$#" -gt 0 ]]; do
    case $1 in
    -d | --deploy)
        deploy="$2"
        ;;
    -s | --send)
        send="send=$2"
        ;;
    esac
    shift
done

case "$deploy" in
"staging")
    f-deploy-staging
    ;;
"production")
    f-deploy-production
    ;;
esac

if [ "$deploy" == "production" ] || [ "$deploy" == "staging" ]; then
    ssh -t -i ~/.ssh/${keyPair} ubuntu@${ip} "$ssht"
fi
