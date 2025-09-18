---
title: Kysely
description: The query builder used to interact with the database
tags:
  - Backend
  - Kysely
  - Database
hide_table_of_contents: false
# sidebar_position: 1
draft: false
---

## Prerequisites

Make sure you have your database connection URL (that includes your authentication credentials) at hand! This will allow
Kysely to connect to your development database.

The connection URL has to be available in the development environment via the key `DATABASE_URL`.

For example:

```dotenv
DATABASE_URL="postgresql://<user>:<password>@<address>:<port>/<db-name>?schema=<schema-name>"
```

Create a `.env` file in the root of your backend and db directories and add the connection URL there:

```dotenv
DATABASE_URL="postgresql://votura:votura@localhost:5432/votura?schema=public"
```

## Using the provided docker development database

With the included `docker-compose.yml` file in the `db`-package, you can easily spin up a local development database
using Docker Compose.

For that you will need:

- Docker
- Docker Compose

### Starting the development database

Navigate to the `db`-package root and run the following command to start the service in the background:

```bash
docker compose up -d
# or use the npm script "npm run postgres-up"
```

This will pull any required images, create containers and set up networking and volumes as defined in the
`docker-compose.yml` in a detached manner. To verify your database container in running use the following command:

```bash
docker ps -a
```

### Stopping the development database

To stop the containers created by docker compose run

```bash
docker compose down
```
or
```bash
npm run postgres-down
```

## Working with Kysely

Kysely is a powerful TypeScript SQL query builder that provides type-safe database interactions with a clean and composable API.
It supports PostgreSQL, MySQL, and SQLite. This section provides a minimal introduction to working with Kysely.

### Defining your database types

Unlike ORMs that rely on a separate schema file, Kysely leverages TypeScript's type system directly.
You define your database table structures as TypeScript interfaces, which Kysely then uses to provide type-safety for your queries.
Example of src/db/types/db.d.ts defining your database schema:

```typescript
export interface UserTable {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface ProductTable {
  id: string;
  name: string;
  price: number;
}

// Define the overall database interface by mapping table names to their types
export interface Database {
  users: UserTable;
  products: ProductTable;
  // add other tables here
}
```

**To generate a new file for the project just call** `npm run gen-types` in the `db` folder.
This requires the database for which you want to generate the types to be running and for you to have a .env-File in `db` folder containing `DATABASE_URL="postgresql://<user>:<password>@<address>:<port>/<db-name>?schema=<schema-name>"` with the user, password, ip and port you are actually using.

### Database Migrations with Kysely

Kysely itself is a query builder and does not come with a built-in migration system.
Developers typically use a separate migration tool or build a custom solution using Kysely to manage schema changes.
A common approach involves creating migration files (e.g., TypeScript files containing SQL or Kysely queries) and a runner script.
This is also the approach we are taking in this project.
This means migrations have to be written by hand.

The migrations in this project are in the `src/db/migrations` directory.
Each migration file typically `up` and `down` functions to apply and revert schema changes. These functions will receive a Kysely instance to execute queries.

The runner is in the `src/migrate.ts` file in the `db`-package.
You can run it using `npm run migrate`.

### Seeding with Kysely

Seeding involves populating your database with initial data (e.g., for development or testing). Similar to migrations, Kysely doesn't have a built-in seeding mechanism, but you can create a simple script that uses Kysely to insert data.

An example is in the `src/seed.ts` file in the `db`-package.
You can run it using `npm run seed`.

### Further readings

This guide only explains the bare minimum to get started with the Kysely.
Their [documentation](https://kysely.dev/docs/intro) is a good starting point for further reading, I have to admit however that it is only alright.
I recommend looking at their [API docs](https://kysely-org.github.io/kysely-apidoc/) to see what functions they support.
