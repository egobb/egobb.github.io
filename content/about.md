---
title: "About"
layout: "about"
summary: "Senior Backend Engineer focused on Java, Kafka, distributed systems, event-driven platforms, reliability, and technical leadership."
date: 2025-09-19T00:00:00+02:00
links:
  - name: "GitHub"
    url: "https://github.com/egobb"
    icon: "https://github.com/fluidicon.png"
    description: "Projects, code, and delivery evidence."
  - name: "LinkedIn"
    url: "https://www.linkedin.com/in/enriquegoberna/"
    icon: "https://static.licdn.com/scds/common/u/images/logos/favicons/v1/favicon.ico"
    description: "Professional background and current scope."

---

I am a **Senior Backend Engineer** focused on **Java, Kafka, distributed systems, and event-driven platforms**. I build and operate backend systems where ordering, idempotency, resilience, observability, and safe delivery matter, combining hands-on engineering with technical leadership across design, code review, cross-team contracts, and mentoring.

**Contact:** [LinkedIn](https://www.linkedin.com/in/enriquegoberna/) · [GitHub](https://github.com/egobb) · [Email](mailto:egobernagarcia@gmail.com)

## Current engineering focus

Since 2020, I have worked on high-volume inventory and e-commerce backend systems, helping evolve a large platform toward distributed, event-driven services. My work spans architecture and implementation: Spring Boot services, Kafka-based workflows, data consistency, failure handling, observability, and the operational paths needed to deploy, diagnose, and recover systems safely.

The production systems I work on are confidential, so I describe that experience at a high level here. The projects below provide public, reproducible evidence of the same kinds of engineering decisions and trade-offs.

## How I approach systems

- **Start with the simplest architecture that meets the reliability and scale requirements.** New infrastructure should solve a real problem, not create one.
- **Make failure modes explicit.** Ordering, retries, duplicate handling, backpressure, replay, and recovery belong in the design, not in an afterthought.
- **Treat operability as part of the system.** Observability, safe delivery, diagnostics, and rollback paths influence architecture from the beginning.
- **Prefer evidence over claims.** Tests, reproducible environments, diagrams, and documented trade-offs are more useful than technology lists.

## Technical leadership

Alongside implementation, I contribute to technical design, code reviews, API and data-contract alignment, production troubleshooting, and cross-team coordination. I have typically mentored and supported a small engineering group of **4–5 engineers**, helping translate functional constraints into technical decisions and keeping delivery grounded in maintainable engineering choices.

## Selected projects

- **[Order Tracking — Event-Driven Ingestion with Kafka](/projects/order-tracking/)** — a Java and Spring Boot system that moves order-event ingestion onto Kafka while preserving per-order ordering and keeping domain rules isolated from transport and persistence. [Engineering write-up](/posts/scaling-order-tracking-kafka/).
- **[Snapshot Ingestion — Resilient Coordination with PostgreSQL](/projects/snapshot-ingestion/)** — a staged ingestion pipeline that uses PostgreSQL coordination, streaming XML, idempotent upserts, and recovery mechanisms instead of introducing a message broker before it is needed. [Engineering write-up](/posts/when-postgres-is-enough-snapshot-ingestion-pipeline/).

## Background

I studied Computer Engineering at the [University of A Coruña](https://www.udc.es/), starting in low-level and embedded software before moving into RFID, supply-chain platforms, and eventually backend engineering. That progression gave me a useful perspective on systems from the edge to the platform layer, while my work since 2020 has increasingly centered on distributed backend architecture, production reliability, and technical leadership.

## Beyond engineering

Outside work, I spend a lot of time strength training, hiking, reading, and learning. Those interests give me a useful counterweight to engineering while reinforcing the same habits I value professionally: consistency, curiosity, and deliberate improvement.

<img src="/images/nature_profile_small.jpeg" alt="Enrique outdoors" width="500">
