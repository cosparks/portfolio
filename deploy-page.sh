#!/bin/sh

sudo rm -rf /var/www/html
mv ./dist ./html
sudo mv html /var/www/