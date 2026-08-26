---
title: "Snapshot Ingestion — Resilient Coordination with PostgreSQL"
description: "A resilient snapshot-ingestion service that uses PostgreSQL for durable storage and lightweight worker coordination without introducing Kafka unnecessarily."
url: "/projects/snapshot-ingestion/"
---

Snapshot Ingestion isolates an unreliable XML provider from the stable search path by fetching and staging snapshots before asynchronous processing. PostgreSQL coordinates horizontal workers with SKIP LOCKED and advisory locks, keeping the design operationally smaller than a broker-based architecture when the workload does not require one.

Current evidence includes streaming XML parsing, idempotent upserts, stale-work recovery, SKIP LOCKED coordination, advisory locks, and database-backed reads.

[Read the engineering write-up](/posts/when-postgres-is-enough-building-a-resilient-snapshot-ingestion-pipeline-without-kafka/) or [inspect the source code](https://github.com/egobb/plan-service).
