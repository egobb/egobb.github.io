---
title: "About"
layout: "about"
summary: "From embedded software and smart metering to RFID, inventory platforms, and backend systems."
date: 2025-09-19T00:00:00+02:00
---

Hello, I’m Enrique. I started close to hardware, writing low-level and embedded software, then moved into the backend side of smart metering, RFID, and inventory systems. Since 2020 most of my work has been on backend platforms, but the path into them still shapes how I think about software: follow the data, understand the domain rule behind it, and keep the implementation close to the failure modes it has to survive.

**Contact:** [LinkedIn](https://www.linkedin.com/in/enriquegoberna/) · [GitHub](https://github.com/egobb) · [Email](mailto:egobernagarcia@gmail.com)

<figure style="margin: 1.75rem auto 2.25rem; max-width: 500px;">
  <img src="/images/nature_profile_small.jpeg" alt="Enrique Goberna outdoors" width="500" style="display: block; width: 100%; height: auto; border-radius: 0.75rem;" decoding="async">
</figure>

## From devices to backend systems

I studied Computer Engineering at the [University of A Coruña](https://www.udc.es/). My bachelor’s thesis, *[Energy Consumption Modeling for the Qualcomm Snapdragon 810 Processor](https://drive.google.com/file/d/1WrdhfTrU4Ey2ytuP9didsABFV0ZPd8cK/view?usp=sharing)*, grew out of that early interest in low-level software and embedded systems.

After university I worked on embedded software for energy-management devices. The same job also pulled me into a different problem: designing the backend platform behind a smart-metering management PaaS. That was my first sustained move from software running on devices toward the systems coordinating and interpreting their data.

Later I worked on RFID platforms, a path closely related to my master’s thesis, *[Inventory Traceability and Verification Across the Supply Chain Using RFID](https://drive.google.com/file/d/151UcWF2ceoW0Mq8scb0J0-OAJDNRPLb9/view?usp=sharing)*. It brought together device events, inventory state, and the business rules around how goods move through a supply chain.

In 2020 I moved into central inventory backend systems for e-commerce. I started with a large monolithic platform and later became involved in its evolution toward distributed, event-driven services. The production systems are confidential, so I keep the implementation details high-level here.

## How I work

Much of my day-to-day work sits between a domain rule and the code that eventually enforces it. A change can start as a question about inventory behavior or a data contract, then pass through service boundaries, persistence, events, tests, deployment, and production diagnostics. I tend to stay involved across that path: clarifying behavior, reviewing designs and code, aligning API and data contracts with other teams, and troubleshooting the result when it reaches a real environment.

I prefer the simplest design that meets the actual constraints. When extra machinery is justified, I want its boundaries to be explicit: ordering, duplicate handling, retries, backpressure, replay and recovery, and observability should be decisions we can point to rather than assumptions hidden in the system.

## Selected projects

The projects on this site are smaller, public systems where the source, tests, and trade-offs can be inspected directly.

- **[Order Tracking — Event-Driven Ingestion with Kafka](/projects/order-tracking/)** — a Java and Spring Boot system that moves order-event ingestion onto Kafka while preserving per-order ordering and keeping domain rules isolated from transport and persistence. [Engineering write-up](/posts/scaling-order-tracking-kafka/).
- **[Snapshot Ingestion — Resilient Coordination with PostgreSQL](/projects/snapshot-ingestion/)** — a staged ingestion pipeline that uses PostgreSQL coordination, streaming XML, idempotent upserts, and recovery mechanisms instead of introducing a message broker before it is needed. [Engineering write-up](/posts/when-postgres-is-enough-snapshot-ingestion-pipeline/).

## Beyond engineering

Outside work, I spend a lot of time strength training, hiking, and reading. I also enjoy learning things that have nothing to do with software and spending time with the people close to me.
