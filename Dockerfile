# Build Fragments-UI Web App and serve it using parcel

# Stage 0: Install alpine + node + dependencies
FROM node:18.13.0-alpine@sha256:d871edd5b68105ebcbfcde3fe8c79d24cbdbb30430d9bd6251c57c56c7bd7646 AS dependencies 

LABEL maintainer="Abdalla Aden <aaaden1@myseneca.ca>"\ 
      description="Fragments-UI Web App"

ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json ./

# 1. npm install
RUN npm ci

#######################################################################

# Stage 1: use dependencies to build the site
FROM node:18.13.0-alpine@sha256:d871edd5b68105ebcbfcde3fe8c79d24cbdbb30430d9bd6251c57c56c7bd7646 AS builder

WORKDIR /app

# Copy cached dependencies from stage 0 to stage 1 so we don't have to download them again
COPY --from=dependencies /app /app

# Copy source code into the image
COPY . .

# Build the site
RUN npm run build

#######################################################################

# Stage 2: nginx web server to host the built site
FROM nginx:1.22.1-alpine@sha256:a9e4fce28ad7cc7de45772686a22dbeaeeb54758b16f25bf8f64ce33f3bff636 AS deploy

# Put our build/ into /usr/share/nginx/html/ and host static files
COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
    CMD curl --fail localhost:80 || exit 1

#######################################################################