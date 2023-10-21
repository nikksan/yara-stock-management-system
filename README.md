# Stock Management System

## Summary

This microservice provides support for simple warehouse operations:

* Create/Update/Delete product
* Create/Delete warehouse
* Import/Export product from/to warehouse
* Fetch products/warehouses
* Fetch historic imports/exports
* Fetch warehouse stats

## Requirements

* NodeJS v14.10.0 or newer
* [PostgreSQL Server 15.4 or newer](https://www.postgresql.org/docs/current/tutorial-install.html).

## Setup

### Install required packages

Execute `npm ci`

### Configure local environment variables

- Execute `cp .env.sample .env` in the project root directory

## Environment setup

Current working environment could be changed by setting `NODE_ENV` environment variable. Available options are only development and testing.

* `development` - for local development. This is the default value.
* `testing` - for when running tests. Usually done by running `npm run test`.

## Usage

* `npm start` - starts the service.
* `npm run test` - runs application tests.

## Configuration

Configuration options could be provided by either setting them as environment variables, when the server is run or by putting
them in the `.env` file. Following options are supported:

* `LOG_LEVEL` - log level at which messages should be logged. Following log levels are supported.
  (in priority order, lowest to highest): `error`, `warn`, `info`, `debug`. Defaults to `debug`.
* `LOG_IMPL` - a bit redundant at this point, only `console` is supported.
* `SERVER_PORT` - port to which the apollo server will listen. Defaults to `3000` for `development` environment.
* `DB_DIALECT` - Supported dialects: postgres, mysql, sqlite. Defaults to `postgres`.
* `DB_USER` - self-explanatory
* `DB_PASSWORD` - self-explanatory
* `DB_NAME` - self-explanatory

## Disclaimers

* Free/taken space by products is calculated with naive fluid-like approach, meaning only the volume of the product is taken into account, and not the particular shape of it.
* Integration tests are not complete. They were not TDD-ed and mainly act as POC at this point.
* No optimized build for production setup
