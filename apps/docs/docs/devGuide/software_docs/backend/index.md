---
title: Backend
description: The backend of votura.
tags:
  - Backend
hide_table_of_contents: false
# sidebar_position: 1
draft: false
---

Your backend is the heart of your votura project.
It handles all the API routes, the business logic and the connection to the database.
It is written in TypeScript and uses the [Express](https://expressjs.com/) framework.

As you can see in the following image, the backend follows a simple layered architecture.

![The overall system architecture of votura.](../../../../static/drawio/overview.svg)

We are using an express server to handle the API requests and responses:

1. In the **routing layer**, we define the API routes and doing some global error handling.
2. In the **business layer**, we implement the business logic of the API endpoints.
   For validation and transformation of the request and response data, we use the [Zod](https://zod.dev).
3. In the **persistence layer**, we handle the connection to the database and the data access.
   We use [Kysely](https://kysely.dev/) as a type-safe SQL query builder and [PostgreSQL](https://www.postgresql.org/) as the database.
