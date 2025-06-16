---
title: API tests with Bruno
description: Using Bruno to test the votura API.
tags:
  - testing
  - API
hide_table_of_contents: false
# sidebar_position: 1
draft: false
toc_min_heading_level: 2
toc_max_heading_level: 3
---

We are using [Bruno](https://docs.usebruno.com) to test the votura API.

## Getting started

### Generate the OpenAPI definition

Before we can start creating tests, we need to generate the OpenAPI definition for the votura backend API.
This can be done by running the following command in the votura-validators package:

```bash
cd packages/votura-validators
npm run persist-schema
```

You can now find the OpenAPI definition in the `packages/votura-validators/generated/voturaApiSchema.json` file.

### Install Bruno

We recommend you to use the Bruno UI to edit your collections.
You can download it from the [Bruno website](https://www.usebruno.com/downloads).

You can also edit the collections in you favorite text editor, but the UI makes it much easier to work with.

### Create / open the collection

If you want to create a new collection, you can create a new one by generating it from the OpenAPI definition.

Normally we only need to open existing collection under the `apps/backend/tests_api/Votura-API` folder and open it in the developer mode.
You can now select in the upper right corner your environment like `The default local development server`.

## Testing

### Create Tests

You can create simple asserts by using the `Assert` function in the Bruno UI.
For example, to check if the response status code is 200.

But you can also create more complex tests by using the `Tests` function in the Bruno UI.
