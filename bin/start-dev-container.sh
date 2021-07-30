#!/bin/bash 

DEV_IMAGE_NAME="docker-quantum"
DEV_CONTAINER_NAME="quantum_dev"

# check if docker is installed
if ! command -v docker &> /dev/null
then
    echo "docker not installed"
    exit
fi

echo "docker installed"

if docker container ls --all | grep -q $DEV_CONTAINER_NAME; then
    echo "Starting existing dev container"
    docker container start -i $DEV_CONTAINER_NAME
else
    echo "Development container not running"
    if docker image ls | grep -q $DEV_IMAGE_NAME; then
        echo "Image found, starting dev container"
        docker run -itd --user=root -p 1880:1880 --name $DEV_CONTAINER_NAME \
        -v node_modules:/node-red-contrib-quantum/node_modules \
        -v venv:/node-red-contrib-quantum/venv \
        -v ${PWD}:/node-red-contrib-quantum \
        -v ~/.node-red/dev-container:/root/.node-red $DEV_IMAGE_NAME && \
        docker exec -it $DEV_CONTAINER_NAME bash -c \
        "cd /root/.node-red && npm install /node-red-contrib-quantum && cd /node-red-contrib-quantum && nodemon --exec node-red flows_quantum.json"
    else
        echo "Image not found, building image and starting dev container"
        docker build -f Dockerfile.dev . -t $DEV_IMAGE_NAME && \
        docker run -itd --user=root -p 1880:1880 --name $DEV_CONTAINER_NAME \
        -v node_modules:/node-red-contrib-quantum/node_modules \
        -v venv:/node-red-contrib-quantum/venv \
        -v ${PWD}:/node-red-contrib-quantum \
        -v ~/.node-red/dev-container:/root/.node-red $DEV_IMAGE_NAME && \
        docker exec -it $DEV_CONTAINER_NAME bash -c \
        "cd /root/.node-red && npm install /node-red-contrib-quantum && cd /node-red-contrib-quantum && nodemon --exec node-red flows_quantum.json"
    fi
fi