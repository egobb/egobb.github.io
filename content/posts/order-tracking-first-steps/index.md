---
title: "Order Tracking: First Steps into My Portfolio"
date: 2025-09-18T00:00:00Z
draft: false
categories: ["portfolio", "projects"]
tags: ["order-tracking", "java", "spring-boot", "postgres", "portfolio"]
cover: "order-tracking-first-steps.png"
---

The first concrete project in my portfolio is an **Order Tracking** service. At its core, it’s simple: an API to create orders, update their status, and check where they are in the delivery process. But even a small project like this can already show the kind of engineering mindset I want this blog to reflect.

### Building the Basics

Right now, the service is built with **Java + Spring Boot**, using **PostgreSQL** for persistence. The initial version is intentionally minimal:

- Endpoints for creating orders and updating statuses.
- An in-memory + database persistence layer.
- H2 for quick local testing, Postgres for real runs.

The goal at this stage isn’t complexity — it’s a clean foundation to build on. You can explore the code here: [GitHub repo](https://github.com/egobb/order-tracking).

### Choosing the Stack

Why this combination of technologies?

- **Spring Boot**: widely adopted, strong ecosystem, and perfect for microservice-style projects.
- **PostgreSQL**: relational, reliable, and great at enforcing order state constraints.
- **OpenAPI**: built-in documentation so that anyone can test the service easily.

Of course, I could have gone with MongoDB or even an event-sourced model from the start.

But the decision was to begin with something straightforward and solid, then evolve later into more advanced patterns like Kafka events and CQRS.

### Lessons from the First Iteration

Even at this early stage, there were small takeaways:

- **Order states are not trivial**: defining valid transitions (`PLACED → IN_TRANSIT → DELIVERED`) prevents messy bugs later.
- **Fast local development** matters: H2 in memory for tests keeps the feedback loop short.
- **APIs should be clear** from the beginning: consistent request/response models save headaches in the future. At one point I had too much logic inside the controllers, and quickly realized it needed to move into services to keep things maintainable. A good reminder that structure matters from day one.

### Looking at the Bigger Picture

This project might look small, but it represents something important for me: instead of just working on large-scale systems at my day job, I’m building **my own projects** that mirror real-world scenarios. Order tracking is something I’ve worked with professionally before, and here I can both **simplify it** for learning and **expand it** to showcase architecture skills.

### Next Steps

The plan is simple:

- **Security**: add OAuth2/JWT authentication with Keycloak.
- **Resilience**: introduce an API Gateway with rate limiting, retries, and circuit breakers.
- **Observability**: integrate metrics, structured logging, and dashboards.
- **Frontend**: build a small React SPA to visualize orders and notifications.
- **Advanced patterns**: explore CQRS, event sourcing, and caching.
- **Deployment polish**: Docker Compose for all services and Infrastructure as Code for cloud readiness.

---

This is only the beginning. The Order Tracking service starts small, but it will evolve into a complete case study of how to design, grow, and polish a system step by step — the exact kind of journey I want to capture in this blog.
