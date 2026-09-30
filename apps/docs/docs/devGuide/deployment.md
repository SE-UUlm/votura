---
title: Deployment
description: Overview of the current deployment of the preview setup.
tags:
  - deployment
hide_table_of_contents: false
# sidebar_position: 1
draft: false
toc_min_heading_level: 2
toc_max_heading_level: 3
---

The following diagram provides an overview of the current deployment under `votura.informatik.uni-ulm.de`:

![Deployment overview](../../static/drawio/voturaDeployment.svg)

## Deployment Server

The deployment server is a virtual machine running Ubuntu 24.04 LTS and is hosted through BWCloud.
It is used as a preview environment for the development team and to test the deployment process.

Hostname: `votura.informatik.uni-ulm.de`
IPv4: `10.121.2.106`
IPv6: `2001:7c0:2338:0:f816:4eff:fe42:8f73`

## Votura Application Containers

The development images are built automatically on every push to the `main` or `develop` branch and are pushed to the container registry as `dev-latest`.
They are, however, not intended for production use:
Stable images are built when a release is created and are pushed to the container registry as `latest`.

### `votura-database`

The database container runs a PostgreSQL database with all the necessary plugins and extensions that are required for votura to run.
The image does not contain any data, and schema updates instead rely on migration scripts, so updating this container does not result in data loss.

### `votura-backend`

The backend container runs a vite application server that serves the backend API.
It uses the `votura-database` container to store and retrieve data.
Furthermore, on every startup, it runs the migration scripts to update the database schema if necessary.

### `votura-frontend`

The frontend container runs an nginx web server to serve the static files for the user interface.

## Traefik

[Traefik](https://traefik.io/) is used in this deployment as a reverse proxy to route requests to the correct containers, and to handle TLS termination so that the users can access the application through HTTPS.

### Reverse Proxy

Since the votura application consists of multiple containers, a reverse proxy is required to route requests to the correct container based on specific rules.
For the preview deployment, the rules are relatively simple:
- Requests to `votura.informatik.uni-ulm.de` with the path prefix `/api/` are routed to the `votura-backend` container. However, the `/api/` prefix is stripped from the request before it is forwarded to the backend.
- All other requests to `votura.informatik.uni-ulm.de` are routed to the `votura-frontend` container.

The `votura-frontend` container has to know about the backend URL, so that clients are able to successfully send API requests there.
The URL is configurable as an environment variable.

### HTTP Challenge

Traefik also handles the TLS termination for the application:
It automatically requests and renews Let's Encrypt SSL certificates for the domain `votura.informatik.uni-ulm.de` using an [HTTP challenge](https://letsencrypt.org/docs/challenge-types/#http-01-challenge).

## Watchtower

Once a new application image is pushed to the container registry, [Watchtower](https://watchtower.nickfedor.com/) will automatically pull the new image and restart the container.
To do so, it periodically checks the container registry for new images and compares them to the currently running images.
While this does result in more network traffic than a webhook- or Actions-based approach, it is a simple solution that is also applicable to other votura instances that are not hosed through the developers themselves.
