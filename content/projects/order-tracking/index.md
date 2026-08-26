---
title: "Order Tracking — Event-Driven Ingestion with Kafka"
description: "An event-driven order-tracking backend that preserves per-order ordering while keeping domain rules isolated from infrastructure."
url: "/projects/order-tracking/"
---

Order Tracking starts from a synchronous REST/database ingestion path and moves event ingestion into Kafka so request handling and processing can scale independently. Messages are keyed by order ID to preserve per-order ordering, while DDD and hexagonal boundaries keep domain rules independent from transport and persistence.

Current evidence includes ordered event ingestion, domain validation, integration coverage with Testcontainers, automated delivery with GitHub Actions, and a production-like AWS environment managed with Terraform.

[Read the engineering write-up](/posts/scaling-order-tracking-with-kafka-domain-events-and-auto-ingestion/) or [inspect the source code](https://github.com/egobb/order-tracking).
