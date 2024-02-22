#!/bin/sh

npm run build
sudo docker build -t mynginx .
sudo docker run -d -p 8080:80 mynginx