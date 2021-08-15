FROM node:16-alpine

# Create app directory
RUN mkdir -p /app && chown node:node /app
USER node
WORKDIR /app

# Install dependencies
COPY --chown=node:node package.json yarn.lock ./
RUN yarn --production

# Bundle app source
COPY --chown=node:node . .

# Exports
EXPOSE 3000
CMD [ "node", "src/bin/server.js" ]
