FROM ubuntu:18.04 as builder

RUN apt-get update && \
  apt-get install --no-install-recommends -y curl git gnupg ca-certificates

# install nodejs
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install --no-install-recommends -y nodejs && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*
RUN npm install yarn -g

WORKDIR /usr/src/mainnet-to-parachain-bridge

# Move source files to docker image
COPY . .

# Install dependencies
RUN yarn && yarn build

# Run
ENTRYPOINT yarn start