---
title: "About"
layout: "about"
summary: "Software engineer working on backend platforms for inventory and e-commerce, from domain decisions to production behavior."
date: 2025-09-19T00:00:00+02:00
---

<figure>
  <img src="/images/nature_profile_small.jpeg" alt="Enrique Goberna outdoors" width="500" height="auto" decoding="async">
</figure>

Hello, I’m Enrique. I’ve been building software professionally for more than a decade, and today I work mostly on backend platforms for inventory and e-commerce. What I enjoy most is the space between a functional rule and the system that has to enforce it: understanding what the behavior really means, shaping the design, writing and reviewing code, coordinating contracts, and staying close enough to production to see whether the assumptions held up.

**Contact:** [LinkedIn](https://www.linkedin.com/in/enriquegoberna/) · [GitHub](https://github.com/egobb) · [Email](mailto:egobernagarcia@gmail.com)

## What I work on

Since 2020, I have worked on central inventory platforms for e-commerce, first in a large monolithic system and later through its evolution toward distributed, event-driven services. The problems that keep me interested are usually about data consistency and failure: ordering, retries, duplicate handling, recovery, backpressure, observability, and how to change a system without making it harder to reason about.

The production systems are confidential, so I keep their details high-level here. The public projects on this site let me explore similar questions openly: when asynchronous messaging earns its complexity, when PostgreSQL is enough, where guarantees really begin and end, and what makes a system easier to operate.

## How I work

I tend to work close to both the domain and the implementation. A change may start with an inventory behavior or a data-contract question and end up touching APIs, events, persistence, tests, deployment, and production diagnostics. I like making that path explicit: clarifying behavior, reviewing designs and code, aligning contracts with other teams, working through problems with other engineers, and staying close to the implementation when something has to be diagnosed or changed.

I prefer simple designs until the problem earns more machinery. When complexity is necessary, I want its boundaries to be visible: what is ordered, what can be duplicated, what can be replayed, how recovery works, and how we know the system is healthy.

## Selected projects

The projects on this site are smaller, public systems where the source, tests, and trade-offs can be inspected directly.

- **[Order Tracking — Event-Driven Ingestion with Kafka](/projects/order-tracking/)** — a Java and Spring Boot system that moves order-event ingestion onto Kafka while preserving per-order ordering and keeping domain rules isolated from transport and persistence. [Engineering write-up](/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/).
- **[Snapshot Ingestion — Resilient Coordination with PostgreSQL](/projects/snapshot-ingestion/)** — a staged ingestion pipeline that uses PostgreSQL coordination, streaming XML, idempotent upserts, and recovery mechanisms instead of introducing a message broker before it is needed. [Engineering write-up](/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/).

## Background

I studied Computer Engineering at the [University of A Coruña](https://www.udc.es/). Earlier in my career I worked on embedded software, a smart-metering platform, and RFID systems. My [bachelor’s thesis](https://drive.google.com/file/d/1WrdhfTrU4Ey2ytuP9didsABFV0ZPd8cK/view?usp=sharing) dealt with processor energy consumption and my [master’s thesis](https://drive.google.com/file/d/151UcWF2ceoW0Mq8scb0J0-OAJDNRPLb9/view?usp=sharing) with RFID-based supply-chain traceability. Over time, the work I found most interesting moved toward backend platforms, distributed data flows, and the operational side of running them, which has been my main focus since 2020.

## Beyond engineering

Outside work, I spend a lot of time strength training, hiking, and reading. I also enjoy learning things that have nothing to do with software and spending time with the people close to me.
