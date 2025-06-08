---
title: Kysley
description: The query builder used to interact with the database
tags:
  - Backend
  - Kysley
  - Database
hide_table_of_contents: false
# sidebar_position: 1
draft: false
---

:::warning

This page is still under construction and will be updated soon.

:::

## Prerequisites

Make sure you have your database connection URL (that includes your authentication credentials) at hand! This will allow
Kysley to connect to your development database.

The connection URL hast to be available in the development environment via the key `DATABASE_URL`.

For example:

```dotenv
DATABASE_URL="postgresql://<user>:<password>@<address>:<port>/<db-name>?schema=<schema-name>"
```

Create a `.env` file in the root of your backend workspace and add the connection URL there:

```dotenv
DATABASE_URL="postgresql://votura:votura@localhost:5432/votura?schema=public"
```

## Using the provided docker development database

With the included `docker-compose.yml` file in the backend project, you can easily spin up a local development database
using Docker Compose.

For that you will need:

- Docker
- Docker Compose

### Starting the development database

Navigate to the backend workspace root and run the following command to start the service in the background:

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

To stop the containers created by docker compose run:

```bash
docker compose down
# or use the npm script "npm run postgres-down"
```

## Working with Kysley

Kysley is a powerful TypeScript SQL query builder that provides type-safe database interactions with a clean and composable API. 
It supports PostgreSQL, MySQL, and SQLite. This section provides a minimal introduction to working with Kysley.

### Defining your database types

Unlike ORMs that rely on a separate schema file, Kysley leverages TypeScript's type system directly. 
You define your database table structures as TypeScript interfaces, which Kysley then uses to provide type-safety for your queries.
Example of src/db/types.ts defining your database schema:

```prisma
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

### Database Migrations with Kysley

Kysley itself is a query builder and does not come with a built-in migration system.
Developers typically use a separate migration tool or build a custom solution using Kysley to manage schema changes. 
A common approach involves creating migration files (e.g., TypeScript files containing SQL or Kysley queries) and a runner script.
This is also the approach we are taking in this project.
This means migrations have to be written by hand.

The migrations in this project are in the `src/db/migrations` directory.
Each migration file typically `up` and `down` functions to apply and revert schema changes. These functions will receive a Kysley instance to execute queries.

The runner is in the `src/db/migrate.ts` file.
You can run it using `npm tsx path/to/migrate.ts`.

### Seeding with Kysley
Seeding involves populating your database with initial data (e.g., for development or testing). Similar to migrations, Kysley doesn't have a built-in seeding mechanism, but you can create a simple script that uses Kysley to insert data.

An example is in the `src/db/seed.ts` file.
You can run it using `npm tsx path/to/seed.ts`.

### Further readings

This guide only explains the bare minimum to get started with the Kysley.
Their [documentation](https://kysely.dev/docs/intro) is a good starting point for further reading, I have to admit however that it is only alright.
I recommend looking at their [API docs](https://kysely-org.github.io/kysely-apidoc/) to see what functions they support.
