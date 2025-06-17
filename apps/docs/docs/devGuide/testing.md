---
title: Testing
description: How to test votura
tags:
  - testing
  - API
hide_table_of_contents: false
# sidebar_position: 1
draft: false
toc_min_heading_level: 2
toc_max_heading_level: 3
---

## Unit testing with vitest

We are using [vitest](https://vitest.dev/) for unit testing in votura.

You can run the tests with the following command:

```bash
npm run test
```

## Testing votura API

A convenient way to test the votura API during the development is to use [Bruno](https://docs.usebruno.com).
Bruno is a tool that allows you to create collections of API requests and test them.
Bruno supports OpenAPI definitions and allows you to create tests for your API requests.

We are using Bruno only during the development, it is not enforced in the pipeline. (But you can trigger the pipeline `Testing Bruno` manually if you want to test your changes.)
To prove your code coverage you need to write vitest testcases (see below).

## Getting started with Bruno

### Install Bruno

We recommend you to use the Bruno UI to edit your collections.
You can download it from the [Bruno website](https://www.usebruno.com/downloads).

You can also edit the collections in you favorite text editor, but the UI makes it much easier to work with.

### Test your API with Bruno

If you want to create a new collection, you can create a new one by generating it from the OpenAPI definition.

Normally we only need to open existing collection under the `apps/backend/tests_api/Votura-API` folder and open it in the developer mode.
You can now select in the upper right corner your environment like `The default local development server`.

You can create simple asserts by using the `Assert` function in the Bruno UI.
For example, to check if the response status code is 200.
But you can also create more complex tests by using the `Tests` function in the Bruno UI.

For creating new asserts and tests we refer to the [Bruno documentation](https://docs.usebruno.com/testing/tests/introduction).

:::note

You need to ensure that the backend and the database are running before you can test it with Bruno.

:::

The Bruno collections are stored in the `apps/backend/tests_api/Votura-API` folder, so that everyone can use and update the same collection.

### Why we are not forcing Bruno in the pipeline?

Bruno is a convenient tool for quick and handy testing of the API, but it has some limitations.
Writing complex tests are possible, but not so easy as with vitest.
For example, you can not import our zod schemas to validate the response data.

Another limitation that we can not measure the code coverage of the tests, so that is harder to find out if the code is covered by tests or not.
So feel free to use Bruno for quick tests, but we recommend writing vitest testcases for more complex tests and to ensure the code coverage.
