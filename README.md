# ConnectQuatro

## Prerequisites

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) or [Docker](https://www.docker.com/)

## Installation

```sh
yarn # or `npm install`
```

## Setup

### Copy `.env.example` to `.env`

To setup the local environment variables, copy the `.env.example` file to
`.env`.

```sh
cp .env.example .env
```

### Run MongoDB

If you know how to run mongo on your machine, you can skip this step.

If you don't have mongo installed on your machine, you can use docker.

```sh
yarn docker:up # or `npm run docker:up`
```

If you're running on an `M1` macOS machine (or other arm based computer), you
can use a docker image optimized for your machine with:

```sh
yarn docker:up:arm # or `npm run docker:up:arm`
```

It will mount mongo data at `./data` relative to this project directory.

To clean up after you terminate mongo, it's a good idea to clean up the stopped
containers and volumes.

```sh
yarn docker:down # or `npm run docker:down`
```

### Run Migrations

```sh
yarn migrate:up # or `npm run migrate:up`
```

### Build Client Assets

```sh
yarn build # or `npm run build`
```

## Running

To start the server (server is on port 3000 by default):

```sh
yarn start # `npm start`
```

To start the server in dev mode:

```sh
yarn start:dev # or `npm run start:dev`
```

To start the client and the server in dev mode (server will be on port 1234):

```sh
yarn dev # or `npm run dev`
```
