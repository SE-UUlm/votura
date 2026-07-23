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

![The backend architecture of votura.](../../../../static/drawio/backend_overview.svg)

We are using an express server to handle the API requests and responses:

1. In the **routing layer**, we define the API routes and doing some global error handling.
2. In the **business layer**, we implement the business logic of the API endpoints.
   For validation and transformation of the request and response data, we use the [Zod](https://zod.dev).
3. In the **persistence layer**, we handle the connection to the database and the data access.
   We use [Kysely](https://kysely.dev/) as a type-safe SQL query builder and [PostgreSQL](https://www.postgresql.org/) as the database.

These layers are also reflected in the directory structure of the backend's source code:

```
📁 apps/backend
├── 📁 src
│   ├── 📁 auth
│   ├── 📁 controllers
│   │   ├── 📁 .bodyChecks
│   │   │   └── 📁 (domain)
│   │   │       └── 📄 (checkgroup).check.ts
│   │   └── 📁 (domain)
│   │       └── 📄 (usecase).uc.ts
│   ├── 📁 middlewares
│   │   ├── 📁 pathParamChecks
│   │   │   └── 📄 (checkgroup).ts
│   │   └── 📄 (middleware).ts
│   ├── 📁 routes
│   │   └── 📄 (domain).routes.ts
│   └── 📁 services
│       └── 📄 (domain).service.ts
└── 📁 test
```

The routing layer is implemented in the `routes` directory.
Each system domain has its own router file, which defines the API endpoints for that domain.

The business layer is implemented in the `controllers` directory.
Each system domain has its own controller directory, which then contains use case files.
A use case file implements the business logic for **one** specific API endpoint.
The body checks (validation and transformation of the request body) are implemented in the `.bodyChecks` directory, but follow a similar subdivision by domain and "check groups".
Code that is shared between multiple use cases or multiple checks can be placed into a `common.ts` file.

Finally, the persistence layer is implemented in the `services` directory.
The service files contain methods to access the database and are only divided by domain, as they might not be directly related to a specific API endpoint.
