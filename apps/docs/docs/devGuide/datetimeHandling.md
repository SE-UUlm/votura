---
title: Date/time handling
description: A guide for handling date and time in the votura project.
tags:
  - Datetime
  - Timezone
  - UTC
hide_table_of_contents: false
# sidebar_position: 1
draft: false
toc_min_heading_level: 2
toc_max_heading_level: 3
---

## Goal

All date-time values are stored and processed in **UTC** throughout the system to avoid confusion caused by time zones.

This guide explains how date-time values flow between the frontend and the backend.

---

## Frontend

We use the [`DateTimePicker`](https://mantine.dev/dates/datetime-picker/) component from `@mantine/dates` in the frontend. This component works with native JavaScript `Date` objects and always displays the time in the user's local time zone, as determined by the browser (for example CET/CEST in Europe). When a user selects a date and time, the picker returns a `Date` object that represents a local time. Before sending this value to the backend, it must be converted to UTC. Our way to do this is by calling `toISOString()` on the `Date` object, which produces an ISO-8601 string in UTC. Note the trailing `Z` that indicates UTC.

For example, if the user selects 20 April 2025 at 12:00 CEST, `toISOString()` will return `2025-04-20T10:00:00.000Z`, which should be send to the backend.

---

## Backend

The backend must always work in UTC. All timestamps are stored in UTC in the database, and the API must return ISO-8601 strings. When the frontend receives such a string, for example `2025-04-20T10:00:00.000Z`, it should create a new `Date` object from it and pass that object to the `DateTimePicker`. The picker will automatically render that value in the user's local time zone (in this example, it would show 12:00 CEST). Under no circumstances should the backend return or store date-time values without timezone information, as that would lead to incorrect interpretations in the UI.
