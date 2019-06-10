# Data Receiver with NodeJS

To begin with, make sure you have zookeeper and kafka installed properly on your machine:

You can find the explanation of installation zookeeper and kafka by the following URL:
https://dzone.com/articles/kafka-setup

Then you must install NodeJS on your machine:
https://nodejs.org/en/download/

Now as you have installed all necessary services you can start them by the following commands:

## start zookeeper
zkserver

## start kafka
.\bin\windows\kafka-server-start.bat .\config\server.properties

## start nodeJS server
node json_nodejs_kafka.js

or for multiprocessing you can use:

pm2 reload ecosystem.config.js

## test server
curl -d @request.json --header "Content-Type: application/json" http://localhost:8125/upload
