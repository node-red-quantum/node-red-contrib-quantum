#!/bin/bash 

# Install the quantum nodes
cd /root/.node-red && \
npm install /node-red-contrib-quantum && \
# Run development server using nodemon to enable hot reloading
cd /node-red-contrib-quantum && \
nodemon --exec node-red flows_quantum.json