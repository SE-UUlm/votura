---
title: Windows Setup (without WSL)
description: Setting up the votura development environment natively on Windows, including known problems and their solutions.
tags:
  - Setup
hide_table_of_contents: false
sidebar_position: 5
draft: false
toc_min_heading_level: 2
toc_max_heading_level: 3
---

This page documents how to set up votura **natively on Windows 11 without WSL** — that is,
with native Node.js, native PostgreSQL and without Docker. It also lists the problems that
typically occur on Windows and how to solve them.

:::info

We still recommend developing inside **WSL 2** (see the
[Development Environment Setup](./envSetup.md) page). Inside WSL none of the problems below
occur, because all Linux-specific behaviour (file paths, `pg_cron`, …) is handled correctly.
Only use this guide if you deliberately want a native Windows setup.

:::

## Verified environment

The steps on this page were verified with the following setup:

| Tool       | Version       | Note                          |
| ---------- | ------------- | ----------------------------- |
| Windows    | 11 Pro        | –                             |
| Node.js    | v22.x         | via nvm or direct             |
| npm        | 11.x          | –                             |
| Git        | 2.x           | incl. Git LFS                 |
| PostgreSQL | 18            | installed natively, no Docker |

## Database without Docker

The default setup uses Docker to start PostgreSQL (`npm run postgres-up` in `packages/db`).
If you do not want to use Docker, install PostgreSQL natively instead:

1. Install PostgreSQL from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/).
2. Create the user and database (run this as the `postgres` superuser):

   ```sql
   CREATE USER votura WITH PASSWORD 'votura';
   CREATE DATABASE votura OWNER votura;
   ```

The `DATABASE_URL` in all `.env` files stays identical to the Docker setup:

```
DATABASE_URL="postgresql://votura:votura@localhost:5432/votura?schema=public"
```

After this, continue with the migration step (`npm run migrate`) from the
[Development Environment Setup](./envSetup.md) page.

## Known problems and solutions

### `npm install` fails (Corepack / postman-code-generators)

**Symptom**

```
npm error path .../node_modules/postman-code-generators
npm error command failed
npm error error This project's package.json defines "packageManager": "yarn@npm@11.3.0".
However the current global version of Yarn is 1.22.22.
npm error Corepack must currently be enabled by running corepack enable
```

**Cause**
`docusaurus-plugin-openapi-docs` (a dependency of the `@votura/docs` app) pulls in
`postman-code-generators`. Its postinstall script calls `yarn install` for its own
sub-packages, which require a modern Yarn via Corepack. Enabling Corepack
(`corepack enable`) requires administrator rights on Windows because it creates symlinks
in `C:\Program Files\nodejs`.

**Solution**
Either enable Corepack once in an **administrator** PowerShell:

```powershell
corepack enable
```

…or skip the lifecycle scripts during install:

```bash
npm install --ignore-scripts
```

Note that `--ignore-scripts` also skips other packages' postinstall scripts, which can
lead to incomplete installations (see the next two problems).

### Missing type declarations (`@mantine`, `@tabler`)

**Symptom**

```
error TS7016: Could not find a declaration file for module '@tabler/icons-react'.
error TS7016: Could not find a declaration file for module '@mantine/hooks'.
```

**Cause**
These packages ship their type declarations in sub-directories (`lib/`, `dist/`) that are
part of the published tarball. If a previous `npm install` was interrupted (for example by
running out of disk space) or run with `--ignore-scripts`, these packages can be unpacked
incompletely and the type directories are missing.

**Solution**
Delete the affected packages and reinstall so npm unpacks them completely:

```bash
rm -rf node_modules/@mantine
rm -rf node_modules/@tabler
npm install --ignore-scripts
```

### Turbo binary missing (`EFTYPE`)

**Symptom**

```
Error: spawnSync .../node_modules/@turbo/windows-64/bin/turbo.exe EFTYPE
```

**Cause**
The `turbo` package downloads its platform-specific binary in a postinstall script. With
`--ignore-scripts` that download is skipped.

**Solution**
Reinstall `turbo` explicitly so npm fetches the missing platform binary:

```bash
npm install turbo
```

Afterwards `node_modules/@turbo/windows-64/bin/turbo.exe` exists and `npx turbo build`
works.

### `npm run migrate` fails with `ERR_UNSUPPORTED_ESM_URL_SCHEME`

**Symptom**

```
npm run migrate
ERROR: Migration failed.
error: { "code": "ERR_UNSUPPORTED_ESM_URL_SCHEME" }
```

**Cause**
Kysely's `FileMigrationProvider` loads migration files via a dynamic `import()` using the
raw file path. On Linux/macOS this is an absolute POSIX path, which Node.js accepts. On
Windows the path looks like `C:\Users\...\20250606_init.ts`, and Node.js does not accept
`C:` as a valid ESM URL scheme.

**Solution**
This requires a small code change in `packages/db/src/migrateToLatest.ts`: the migration
provider has to convert the file path to a `file://` URL via `pathToFileURL` from Node's
`url` module before importing it. This fix is tracked separately and will make the migration
work out of the box on Windows and macOS.

### `pg_cron` extension is not available on Windows

**Symptom**

```
ERROR: Migration failed.
code: "0A000"
hint: "The extension must first be installed on the system where PostgreSQL is running."
query: "CREATE EXTENSION IF NOT EXISTS pg_cron"
```

**Cause**
The initial migration (`20250606_init.ts`) sets up a PostgreSQL cron job that periodically
deletes expired access tokens from the blacklist table. It uses the `pg_cron` extension,
which is a PostgreSQL background worker available **only on Linux** — neither Windows nor
macOS can install it. Because Kysely runs migrations inside a transaction, the failing
`CREATE EXTENSION` aborts the whole transaction, so every following statement (including the
entry into the `kysely_migration` table) fails as well.

**Solution**
This requires a small code change in `packages/db/src/migrations/20250606_init.ts`: before
creating the extension, the migration should check whether `pg_cron` is listed in
`pg_available_extensions` and only set up the cron job when it is. This fix is tracked
separately. The cron job only cleans up expired blacklist entries, so skipping it in a local
development environment has no functional impact — on the production system (Linux) it runs
normally.

### `psql` is not found after installing PostgreSQL

**Symptom**

```
psql : The term "psql" is not recognized as the name of a cmdlet, function, ...
```

**Cause**
The PostgreSQL installer does not add its `bin` directory to the Windows `PATH`.

**Solution**
Use the full path to `psql.exe`:

```
C:\Program Files\PostgreSQL\18\bin\psql.exe
```

…or add `C:\Program Files\PostgreSQL\18\bin` to your system `PATH` and restart PowerShell.

## `.env` file locations

The `.env` files do **not** live in `apps/db`, `apps/e2e` or `apps/hash`. They belong in the
real package directories:

| Path                 | Variables                          |
| -------------------- | ---------------------------------- |
| `apps/backend/.env`  | `DATABASE_URL`, `PEPPER`, `BITS_PRIME_P` |
| `apps/frontend/.env` | `VITE_API_BASE_URL`                |
| `packages/db/.env`   | `DATABASE_URL`, `PEPPER`           |
| `packages/e2e/.env`  | `PEPPER`                           |
| `packages/hash/.env` | `PEPPER`                           |
