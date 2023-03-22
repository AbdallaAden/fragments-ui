# Build Fragments-UI Web App and serve it using parcel

FROM node:18.14.0

LABEL maintainer="Abdalla Aden <aaaden1@myseneca.ca>"\ 
      description="Fragments-UI Web App"

ENV NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy the package.json and package-lock.json files into /app
COPY package*.json ./

# 1. npm install
RUN npm ci

# 2. Copy source code into the image
COPY . .

# 3. Build the site
RUN npm run build

# 4. Serve the dist/ on port 1234
CMD npm run serve

EXPOSE 1234
