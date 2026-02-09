#!/bin/bash

# NGINX
docker run -d \
  --name nginx-web \
  -p 8080:80 \
  -v $(pwd)/html:/usr/share/nginx/html:ro \
  nginx

# POSTGRES
docker run -d \
  --name postgres-db \
  -p 5432:5432 \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=testdb \
  -v postgres_data:/var/lib/postgresql/18/docker \
  postgres

# REDIS
docker run -d \
  --name redis-cache \
  -p 6379:6379 \
  -v $(pwd)/redis.conf:/usr/local/etc/redis/redis.conf \
  redis redis-server /usr/local/etc/redis/redis.conf

# NODE APP
docker run -d \
  --name node-app \
  -p 3000:3000 \
  -v $(pwd)/app:/usr/src/app \
  -w /usr/src/app \
  node:18 \
  sh -c "npm install && node server.js"

# PORTAINER
docker run -d \
  --name portainer \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
