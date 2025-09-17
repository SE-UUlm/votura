---
title: Development Environment Setup
description: How to set up the development environment for votura.
tags:
  - Setup
hide_table_of_contents: false
sidebar_position: 4
draft: false
toc_min_heading_level: 2
toc_max_heading_level: 3
---

## Global System Installations

:::info

For Windows users we reccomend developing inside of WSL 2.
A tutorial for setting it up can be found [here](https://learn.microsoft.com/en-us/windows/wsl/install).
After the WSL has been installed, just install a Linux distribution you are comfortable with.

:::

Before you can start developing with votura, you need to install the following:

- [git](https://git-scm.com/)
- [node.js](https://nodejs.org/en/) (we recommend using [nvm](https://github.com/nvm-sh/nvm))
- [docker](https://www.docker.com/) (for Windows Users we reccomend using Docker Desktop and configuring it to use the WSL 2 backend)

For the installation please refer to the official documentation of the tools.

You can run the following commands to check if you have installed the tools correctly:

```bash
git -v
node -v
npm -v
docker run hello-world
```

The docker command should output "Hello from Docker!".

Also make sure **Git Large File Storage** is installed.
For that run
```bash
git lfs install
```
If git lfs is already installed this will not change anything.

## Starting with the votura repository

Now we can clone the votura repository to your preferred working directory:

```bash
git clone https://github.com/SE-UUlm/votura.git
```

After cloning the repository you should also set up **signed commits**, as they are required if you want to push to the remote repository.
For this, please refer to [this tutorial](https://www.git-tower.com/blog/setting-up-ssh-for-commit-signing/).

The next step is to run the following command in the root folder of your repository to **install all dependencies** of the project:
```bash
npm install
```

You should also add `.env`-files to the backend, frontend, db, e2e and hash directory.
They should each contain the following variables.
You may change their values but `PEPPER` and `DATABASE_URL` should be the same for all files.

**Backend**:
```
DATABASE_URL="postgresql://votura:votura@localhost:5432/votura?schema=public"
PEPPER="12345"
BITS_PRIME_P=20
```

**Frontend**:
```
VITE_API_BASE_URL="http://localhost:4000"
```

**db**:
```
DATABASE_URL="postgresql://votura:votura@localhost:5432/votura?schema=public"
PEPPER="12345"
```

**e2e**:
```
PEPPER="12345"
```

**hash**:
```
PEPPER="12345"
```

Now you should be already ready to start developing with votura.

For testing please see [the documentation page for testing](./testing.md)

### Repository Structure

We are using one monorepo (with the help of [turborepo](https://turborepo.com)) for all parts of the votura project.
[Here](https://monorepo.tools) is a nice introduction to monorepos.

The following image gives a brief overview of the structure of the repository:

![folder structure of the repository](../../static/uml/repoStructure.svg)

The votura repository is a npm project (sometimes also called as workspace).
In the `apps` folder you can find all the applications of votura that can run independently, like the documentation,
frontend or backend server.
In the `packages` folder you can find all the shared packages that are used in the applications, such as the votura-crypto
package or the typescript and eslint configuration.

### Turborepo

All these sub-projects are independent npm projects, but they have some dependencies and configuration to each other.
You can navigate to the sub-projects and test, build or run them on their own.
But the main advantage of turborepo is that you can run all the commands in the root folder, and you can run, test or
build all the sub-projects at once.

#### Installing Workspace-Scoped Dependencies in a Turborepo Monorepo

In a monorepo using [Turborepo](https://turborepo.com/), dependencies can be shared across packages using workspace
protocols defined in `package.json`. This also allows you to install internal packages as dependencies using workspace
scoping.

To add a workspace-scoped dependency to an app, run:

```bash
npm install <package-name> -w <workspace-name>
```

#### Building the project

Try this in the root folder:

```bash
turbo build
```

As you can see this can take a while, because it builds all the sub-projects.
But now you can try this a second time:

```bash
turbo build
```

As you see, the second time it is much faster.
This is because turborepo caches the build results and only builds the sub-projects that have changed.

If you only want to build a specific sub-project from the root folder, you can do this with the following command:

```bash
turbo docs#build
```

The same applies to all other following commands (e.g. typecheck).
For a list of all commands look for the `turbo.json` file in the projects root directory.

Instead of using the `turbo` command, you can also use `npm run` from the directory you want it to be used in.
If you are in the `docs`-directory, running the following command will only build the docs.
```bash
npm run build
```

Turborepo automatically detects the dependencies between the sub-projects and builds them in the correct order.
You can check the order for a specific task in the generated SVG by typing:

```bash
npx turbo run build --graph=graph.svg
```

#### Typecheck votura

```bash
turbo typecheck
```

This command makes sure that the typing of variables etc. is consistent.

#### Linting votura

##### Teamscale

We are using a [Teamscale](https://exia.informatik.uni-ulm.de/teamscale) server to run linting and static analysis on the votura codebase.
You can connect your IDE (e.g. with the VSC Extension) to the Teamscale server to get real-time feedback on your code.

For VSC you must generate an Access Key in the Web view of Teamscale and add it to the configuration of the VSC Extension.
Your `settings.json`-file should include something like this:

```json
"teamscale.teamscaleServers": [
    {
        "serverUrl": "https://exia.informatik.uni-ulm.de/teamscale",
        "username": "yourUserName",
        "accessKey": "yourAccessKey",
        "trustAllCertificates": false
    }
],
```

1. Please check all findings that Teamscale reports in your PR in GitHub and fix them.
2. If you think there is a rule activated that is not useful for the votura project, please bring this up in the next meeting, so that it can be discussed with the whole team. If the team concludes the rule isn't usefull, it can be reconfigured in the Teamscale webview.
3. If you think the complaining rule is useful in general, but not for your specific case, you can add tolerate this finding with a comment in the Teamscale UI.

##### ESLint

```bash
turbo lint
```

This command checks the code against the default rules apllied by [ESLint](https://typescript-eslint.io/).
You can also use ESLint directly in VSCode by installing the extension.

#### Format votura

```bash
turbo format
```

This command formats the code using [Prettier](https://prettier.io/).
Without propper formatting your PR will fail the pipeline.

#### Start all development servers

```bash
turbo start
```

This command starts all apps.

For normal operation of votura you should just use the following command in the `backend` and `frontend` directories.
```bash
npm run start
```
After running these commands you can view the frontend in your browser.
