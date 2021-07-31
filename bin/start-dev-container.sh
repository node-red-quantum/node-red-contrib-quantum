#!/bin/bash 

DEV_IMAGE_NAME="docker-quantum"
DEV_CONTAINER_NAME="quantum-dev"
DEV_DEPENDENCY_NODE="quantum-dep-node"
DEV_DEPENDENCY_PYTHON="quantum-dep-venv"

# check if docker is installed
if ! command -v docker &> /dev/null
then
    echo "docker not installed"
    exit
fi

echo "docker installed"

if docker container ls --all | grep -q $DEV_CONTAINER_NAME; then
    echo "Starting existing dev container"
    docker exec -it $DEV_CONTAINER_NAME bash -c \
    "npm install && nodemon --exec node-red flows_quantum.json"
else
    echo "Development container not running"
    if ! docker volume ls | grep -q $DEV_DEPENDENCY_NODE; then
        echo "Creating volumes to store node dev dependencies"
        docker volume create $DEV_DEPENDENCY_NODE
    fi
    if ! docker volume ls | grep -q $DEV_DEPENDENCY_PYTHON; then
        echo "Creating volumes to store python dev dependencies"
        docker volume create $DEV_DEPENDENCY_PYTHON
    fi
    if docker image ls | grep -q $DEV_IMAGE_NAME; then
        echo "Image found, starting dev container"
        docker run -itd --user=root -p 1880:1880 --name $DEV_CONTAINER_NAME \
        -v $DEV_DEPENDENCY_NODE:/node-red-contrib-quantum/node_modules \
        -v $DEV_DEPENDENCY_PYTHON:/node-red-contrib-quantum/venv \
        -v ${PWD}:/node-red-contrib-quantum \
        -v ~/.node-red/dev-container:/root/.node-red $DEV_IMAGE_NAME && \
        docker exec -it $DEV_CONTAINER_NAME bash -c \
        "cd /root/.node-red && npm install /node-red-contrib-quantum && cd /node-red-contrib-quantum && nodemon --exec node-red flows_quantum.json"
    else
        echo "Image not found, building image and starting dev container"
        docker build -f Dockerfile.dev . -t $DEV_IMAGE_NAME && \
        docker run -itd --user=root -p 1880:1880 --name $DEV_CONTAINER_NAME \
        -v $DEV_DEPENDENCY_NODE:/node-red-contrib-quantum/node_modules \
        -v $DEV_DEPENDENCY_PYTHON:/node-red-contrib-quantum/venv \
        -v ${PWD}:/node-red-contrib-quantum \
        -v ~/.node-red/dev-container:/root/.node-red $DEV_IMAGE_NAME && \
        docker exec -it $DEV_CONTAINER_NAME bash -c \
        "cd /root/.node-red && npm install /node-red-contrib-quantum && cd /node-red-contrib-quantum && nodemon --exec node-red flows_quantum.json"
    fi
fi