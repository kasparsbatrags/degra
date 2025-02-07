#!/bin/bash

# Būvēt company moduli
echo "Building company module image..."
docker build -t degra/company:latest -f company/Dockerfile .

# Būvēt address moduli
echo "Building address module image..."
docker build -t degra/address:latest -f address/Dockerfile .

# Būvēt freighttracking moduli
echo "Building freighttracking module image..."
docker build -t degra/freighttracking:latest -f freighttracking/Dockerfile .

# Būvēt usermanager moduli
echo "Building usermanager module image..."
docker build -t degra/usermanager:latest -f usermanager/Dockerfile .

echo "All images built successfully!"
