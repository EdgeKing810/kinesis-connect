#!/bin/bash

sudo npm install -g cordova
npm run build

cordova create cordova com.KinesisGames.Connect Connect
cd cordova/

rm -rf www/*
cp -r ../build/* www/

cordova platform add android
cordova platform ls

cordova requirements

cordova build android

cp platforms/android/app/build/outputs/apk/debug/app-debug.apk ~/Desktop/
