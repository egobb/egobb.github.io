---
title: "Automating Order Tracking: From Functionality to Continuous Integration"
date: 2025-09-21T10:00:00+02:00
draft: false
tags: ["spring-boot", "ci-cd", "github-actions", "docker", "portfolio"]
cover: "automatic-order-tracking.png"
---

> **August 2026 update:** This post records the delivery setup as it existed in September 2025. The project has evolved since then; the [current Order Tracking case study](/projects/order-tracking/) is the reference for present guarantees, limitations, and next work.

Over the past few days I’ve been evolving [*order-tracking*](https://github.com/egobb/order-tracking), a simple Spring Boot service with REST endpoints, hexagonal boundaries, persistence, and an audit trail. This iteration focused less on new business behavior and more on making the existing service easier to build, test, run, and release consistently.

The work centred on automation, reproducibility, and the delivery workflow around the application rather than changing its core domain model.

---

## What’s new?

This iteration has been all about **automation, reproducibility, and developer experience**. Here are the main areas I worked on:

### 1. GitHub Workflows for CI/CD
I introduced a set of workflows that now run automatically on every change:

- **Build Workflow** ([build.yml](https://github.com/egobb/order-tracking/blob/main/.github/workflows/build.yml))  
  Ensures the project compiles, runs tests, and produces a valid artifact. By relying on the included [`mvnw`](https://github.com/egobb/order-tracking/blob/main/mvnw) wrapper, contributors don’t need Maven installed — builds are consistent regardless of local setup.

- **Formatting Workflow** ([format.yml](https://github.com/egobb/order-tracking/blob/main/.github/workflows/format.yml))  
  Automatically checks code formatting and fails if the style guide isn’t followed. This removes endless discussions about tabs, spaces or import ordering — the workflow enforces the rules.

- **Docker Workflow** ([docker.yml](https://github.com/egobb/order-tracking/blob/main/.github/workflows/docker.yml))  
  Builds and publishes Docker images using the provided [Dockerfile](https://github.com/egobb/order-tracking/blob/main/Dockerfile). The app can now be run in a container anywhere with a single command, which makes testing, deployment and demoing much easier.

- **Release Workflow** ([release.yml](https://github.com/egobb/order-tracking/blob/main/.github/workflows/release.yml))  
  Automates tagging and packaging new versions, so releases are predictable and reproducible.

- **Main → Develop Sync Workflow** ([sync-main-to-develop.yml](https://github.com/egobb/order-tracking/blob/main/.github/workflows/sync-main-to-develop.yml))  
  Keeps development branches aligned with the main branch, reducing drift and avoiding nasty merge surprises later.

### 2. Database seeding
I added **seeding mechanisms** to populate the database with initial data. This makes it much easier to spin up the application locally or in Docker and immediately have meaningful entities to work with. It also simplifies testing and demos — you don’t start with an empty database anymore.

### 3. Better documentation
The [README](https://github.com/egobb/order-tracking/blob/main/README.md) was expanded with detailed instructions, a clearer explanation of the architecture, and a roadmap with ideas for the future (advanced observability, horizontal scaling, etc.).

---

## Current state of the project

With these improvements, *order-tracking* is no longer just a local demo service:

- **Reproducible builds** thanks to `mvnw` and CI workflows.
- **Consistent formatting** enforced automatically on every push.
- **Portable runtime** via Docker, so the app can run anywhere.
- **Seeded database** for easier onboarding, testing and demos.
- **Automated releases** with predictable tags and artifacts.
- **Updated documentation** that helps anyone understand, run and extend the project.

---

## What’s next?

At that point, the next questions were:

- Add more integration tests with real infrastructure (databases, queues).
- Explore separating request acceptance from processing if synchronous database work becomes a useful boundary to test.
- Improve operational visibility with tracing, dashboards, and metrics.
- Strengthen authentication, authorization, and secret handling where the deployment model requires them.
- Automate deployment to a staging/pre-production environment through GitHub Actions.

---

## Closing thoughts

The most interesting part of this cycle wasn’t writing new business logic — it was wrapping the project in **automation and reproducibility**. Workflows now guard quality, Docker ensures portability, seeding provides a smoother developer experience, and releases happen in a controlled, repeatable way.

The result was a more repeatable development and delivery environment, with less manual setup and clearer feedback when a change breaks the build or packaging flow.
