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

Before you can start developing with votura, you need to install some global dependencies.
We need:

- [git](https://git-scm.com/)
- [node.js](https://nodejs.org/en/) (we recommend using [nvm](https://github.com/nvm-sh/nvm))

For the installation we refer to the official documentation of the tools.

Please run the following commands to check if you have installed the tools correctly:

```bash
git -v
node -v
npm -v
```

## Starting with the votura repository

Now we can clone the votura repository to your preferred working directory:

```bash
git clone https://github.com/SE-UUlm/votura.git
```

Now you should be already ready to start developing with votura.

### Repository Structure

We are using one monorepo (with the help of [turborepo](https://turborepo.com)) for all parts of the votura project.
[Here](https://monorepo.tools) is nice overview of what is the idea behind.

The following image gives a brief overview of the structure of the repository:

![folder structure of the repository](../../static/uml/repoStructure.svg)

The votura repository is a npm project (sometimes also called as workspace).
In the `apps` folder you can find all the applications of votura that can run independently, like the documentation, frontend or backend server.
In the `packages` folder you can find all the shared packages that are used in the applications, like the votura-crypto package or the typescript and eslint configuration.

Now you can run in the root folder the following command to install all dependencies of the repository:

```bash
npm install
```

### Turborepo

All these sub-projects are independent npm projects, but they some dependencies and configuration to each other.
You can navigate to the sub-projects and test, build or run them on their own.
But the main advantage of turborepo is that you can run all the commands in the root folder, and you can run, test or build all the sub-projects at once.

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

The same applies to all other following commands.

#### Typecheck votura

```bash
turbo typecheck
```

#### Format votura

```bash
turbo format
```

#### Start all development servers

```bash
turbo start
```
