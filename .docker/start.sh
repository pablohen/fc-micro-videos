#!/bin/bash

# @core
if [ ! -f "./src/@core/env.testing" ]; then
  cp ./src/@core/.env.test.example ./src/@core/.env.test
fi

# nestjs
if [ ! -f "./src/nestjs/envs/.env" ]; then
    cp ./src/nestjs/.env.example ./src/nestjs/.env
fi

if [ ! -f "./src/nestjs/envs/.env.test" ]; then
    cp ./src/nestjs/.env.test.example ./src/nestjs/.env.test
fi

npm i

npm run build -w @fc/micro-videos

tail -f /dev/null

#npm run start:dev