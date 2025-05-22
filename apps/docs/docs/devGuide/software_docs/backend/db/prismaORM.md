---
title: Prisma ORM
description: The ORM used to interact with the database.
tags:
  - Backend
  - Prisma ORM
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
Prisma to connect to your development database.

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

## Working with Prisma ORM

Prisma is a modern TypeScript ORM for Node.js and JavaScript, offering type-safe database access and easy schema
migrations. It supports PostgreSQL, MySQL, SQLite, MongoDB, and more. This section provides a minimal introduction
to working with Prisma ORM.

### Define the data model

Edit prisma/schema.prisma to define your database models. Example:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

### Apply schema changes to the database

To generate or update your database schema:

```bash
npx prisma migrate dev --name <migration-name>
```

This command will:

1. Create a new SQL migration file for the migration
2. Apply the generated SQL migration to the database
3. Regenerate Prisma Client

The corresponding migration will be generated and saved in the `prisma/migrations` folder.

You can also use `npx prisma db push` for non-production environments to sync the database without migrations.

![Evolve with Prisma](../../../../../static/img/prisma_evolve_application.png)

### Further readings

This guide only explains the bare minimum to get started with the Prisma ORM.
Their [documentation](https://www.prisma.io/docs/) is very comprehensive and well-structured.
