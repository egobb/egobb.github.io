---
title: "Beyond RAG: Building a Stateful AI System for Longitudinal Training Decisions"
date: 2026-09-06T00:00:00Z
description: "What changed when a training assistant stopped answering isolated questions and started making decisions against persistent, governed state."
summary: "RAG still describes part of this system. It stopped describing the interesting part once retrieved context became durable state that could constrain the next decision."
tags:
  - ai
  - rag
  - llm
  - system-design
  - stateful-systems
  - agents
---

I thought I was building RAG.

That description made sense at the beginning. I had a training plan, completed sessions, notes about what had happened recently, and a language model that needed the relevant parts before it could analyse a session or suggest the next one.

The basic loop looked familiar:

```text
question or task
    ↓
retrieve relevant training context
    ↓
augment the model input
    ↓
generate an analysis or prescription
```

That is still part of the system today. I have no interest in redefining RAG until the term means nothing.

But over time, retrieval stopped being the difficult part.

The difficult part began when an answer could change persistent state, and that state could influence a decision several sessions later.

At that point I no longer had only a context problem. I had an **authority problem**, a **mutation problem**, a **staleness problem**, an **audit problem**, and a surprisingly ordinary distributed-systems problem: what should happen when a workflow partially writes state and then has to be retried?

Training happens to be the domain where I encountered those questions. The architecture problem is much more general.

This post is about that transition: from a stateless LLM with retrieval to a workflow-driven system that reasons over persistent longitudinal state and writes back to it under explicit rules.

I currently describe it as **a domain-specific agentic system using retrieval-augmented reasoning over persistent longitudinal state**. The shorter version is **agentic RAG with structured longitudinal memory**.

Neither phrase is the important part. The important part is what persistence forces the system to get right.

---

## The moment RAG stopped being the useful abstraction

Imagine a conventional retrieval-augmented interaction.

I ask how to approach today's session. The system retrieves the current plan and a few recent sessions, gives me a sensible answer, and the interaction ends.

If the answer is slightly inconsistent, that is undesirable, but the blast radius is small. I can ignore it. The next request can start again from authoritative source material.

Now change one thing.

After the session, the system records what actually happened. It may also create a temporary constraint for the next exposure, retain a material decision, or produce a new prescription. A later workflow retrieves those persisted outputs and uses them to decide what comes next.

The loop becomes:

```text
session evidence
    ↓
analysis
    ↓
durable state / decision
    ↓
next prescription or review
    ↓
new completed evidence
    └─────────────── feedback
```

The model is no longer producing disposable prose around retrieved documents. It is participating in a state transition.

That distinction changed how I designed the project.

The main question stopped being:

> What context should I retrieve?

and became:

> Which source is authoritative for this fact, who is allowed to change it, what evidence justifies the change, and how do I know the write actually happened against the state I reviewed?

Those are very different questions.

---

## The architecture: retrieval is only one path through the system

The system does not have one giant “memory” document.

That would be convenient at first and increasingly dangerous later, because different kinds of state have different semantics.

The current project separates several surfaces.

There is a **structural plan** for durable programme architecture: current block, recurring structure, calendar and long-lived rules.

There is a separate **operational state** for temporary constraints and monitoring gates. A short-lived restriction should not silently become a permanent training rule just because it was mentioned several times.

Each planned session has an exact **prescription snapshot**: what the system intended to execute on that date.

Completed sessions have separate durable records for **what actually happened**. That distinction matters. Execution evidence does not rewrite the original prescription retrospectively.

There is also a **decision lineage** for material decisions, plus governed surfaces for model outputs and for athlete-specific findings if they ever meet the required evidence threshold.

The important property is not the number of files. It is that they do not all claim authority over the same fact.

When a workflow runs, it retrieves a selected subset of those surfaces depending on the task. A session-analysis workflow needs a different context from a strategic plan review. A prescription should not inject every historical note merely because more context is available.

The reasoning layer therefore sees something closer to this:

```text
current structural plan
+ active temporary constraints
+ target prescription
+ relevant completed evidence
+ prior material decisions
+ eligible derived/model context
    ↓
specialized workflow reasoning
```

That is the RAG part of the architecture: retrieve relevant external state and use it to ground the model's reasoning.

The difference comes after reasoning.

Some workflows are effectively read-only. Some may update a narrow tactical surface. Others can propose a structural change but are not allowed to persist it themselves.

The result is a system in which **reasoning authority and write authority are intentionally different things**.

<figure>
  <img src="stateful-training-tracking-architecture.svg" alt="Stateful Training Tracking architecture: new evidence enters canonical persistent state, selected state is retrieved into specialized workflows, an authority gate separates read or no-change outcomes from guarded writes, and later prescriptions feed completed evidence back into the loop." loading="lazy">
  <figcaption>Solid paths represent retrieval and reasoning. Dashed paths represent authorized mutation with stale-state checks and readback. Both paths can influence the next prescription.</figcaption>
</figure>

The same architecture is useful without the image: new evidence is normalized into canonical state; a workflow retrieves only the relevant slices; the decision gate checks evidence strength, change magnitude and ownership; the outcome either preserves state or performs a guarded write; later prescriptions consume the resulting authoritative state; and completed execution becomes new evidence for a future pass through the loop.

---

## Tactical reasoning is not structural authority

One of the first boundaries that became useful was separating tactical and strategic decisions.

A session-analysis or next-session-prescription workflow is allowed to make bounded decisions inside the current training intent. It can preserve the plan, monitor a question, make a small tactical adjustment, or make a bounded change to one exposure when the active rules already permit it.

What it cannot do is quietly rewrite the programme because one session looked unexpectedly good or bad.

If the smallest coherent change would alter recurring microcycle behaviour, the current block, or the master plan, the tactical workflow has to escalate the question to a strategic review.

That sounds bureaucratic until an LLM is the thing proposing the change.

Without the boundary, a plausible chain of reasoning can become accidental architecture:

```text
unusual session
    ↓
reasonable local interpretation
    ↓
slightly different next prescription
    ↓
new prescription treated as precedent
    ↓
programme drift
```

Nothing in that sequence has to be obviously wrong. The failure is that a tactical interpretation gradually becomes durable structure without one explicit decision owning the transition.

The system therefore treats change magnitude as part of the decision contract.

`NO_CHANGE` and `MONITOR_ONLY` are first-class successful outcomes. A workflow is not rewarded for making the plan different.

That last rule has been more important than I expected.

Generative systems are naturally good at producing another answer. Stateful decision systems also need to be good at deciding that the current state is still the best state.

---

## Persistent state is an authority problem before it is a memory problem

The word *memory* makes persistence sound passive: store useful things now, retrieve them later.

In practice, the harder question is what happens when two stored things disagree.

Suppose a current user correction conflicts with an older derived assumption. Or an active temporary constraint conflicts with a model output. Or a new session appears to support progression while the structural plan says the current exposure is deliberately conservative.

A model cannot solve that safely by averaging the text.

The project uses an explicit authority hierarchy. The exact details are domain-specific, but the pattern is general:

1. current explicit evidence or correction has strong authority;
2. the structural plan owns durable programme intent;
3. active operational constraints can narrow what happens next;
4. the session prescription owns intended execution for that session;
5. completed actuals describe what really happened;
6. learned findings and governed model outputs may inform decisions only when their own evidence contracts make them eligible;
7. historical context and reviewer hypotheses sit below those sources.

A lower layer can trigger a review. It cannot silently overwrite a stronger owner.

That separation prevents a common failure mode in LLM systems: **retrieved information becoming authoritative merely because it was retrieved**.

Retrieval answers “what context is relevant?”

Authority answers “which context is allowed to win?”

They are not the same problem.

---

## Observations, estimates and hypotheses cannot collapse into one fact type

Longitudinal reasoning creates another temptation: if the same hypothesis appears often enough, it starts to feel like knowledge.

The system explicitly resists that.

Material decision inputs are classified into categories such as:

- **observed** — durable evidence of something that occurred or was measured;
- **user reported** — explicit current subjective/contextual evidence;
- **derived** — deterministic calculation from canonical data;
- **estimated** — bounded model or heuristic output with uncertainty and provenance;
- **hypothesis** — an explanatory proposition that has not earned fact status;
- **unknown** — evidence that is unavailable, unresolved or contradictory.

The distinction matters because language models are excellent at making hypotheses sound fluent.

“Fatigue probably caused the missed repetitions” may be a useful hypothesis. It does not become an observation because several reasoning passes repeat it.

Likewise, a planned calorie target is not actual intake, a prescription is not execution, and a model coefficient is not an athlete-specific fact.

If a stateful system does not preserve those distinctions, its own outputs can slowly contaminate the evidence it later retrieves.

The failure is recursive: inference becomes state, state becomes future evidence, and future reasoning becomes increasingly confident about an assumption the system created itself.

For me, avoiding that loop is one of the strongest arguments for structured state over an untyped conversational memory.

---

## Evidence thresholds matter more when decisions are durable

A stateless assistant can overreact once and be corrected in the next conversation.

A persistent system can overreact once and then build on the reaction.

The training project therefore encodes a conservative evidence progression.

One unusual exposure is normally an **isolated observation**. It may justify monitoring or a small bounded adjustment, but it is weak evidence for rewriting recurring programme structure.

Repeated signals only become stronger when the exposures are materially comparable. A pattern across different exercises, different programme phases, or a substantially different bodyweight/energy regime is not automatically one trend.

Persistent trends can justify larger review, but even then the result is a proposal subject to authority and mutation rules—not a direct write.

This has a useful consequence: the system can accumulate longitudinal context without treating “more history” as “more certainty”.

Context can become less applicable when the regime changes. Contradictory evidence can lower confidence. Missing evidence can remain explicitly unknown.

That is closer to how I want a durable decision system to behave: **history constrains interpretation rather than merely increasing prompt size**.

---

## Writes need stale-state protection

Once a decision can be persisted, another ordinary systems problem appears.

The state you reviewed may no longer be the state you are about to modify.

Imagine a strategic workflow reads the current plan, evaluates evidence, and proposes a change. Before the write happens, another workflow or a human updates the same state.

Applying the original proposal anyway would mean mutating a world the model did not actually review.

The persistence contract handles this by binding material writes to before-state fingerprints. A write is valid when the target still matches the reviewed state, or when it is already equal to the intended after-state because a retry partially succeeded earlier.

Otherwise the decision is stale and must be blocked or reconsidered.

The idea is familiar from optimistic concurrency control. What is interesting here is that it becomes necessary in a system that, on the surface, looks like “an LLM reading Markdown files”.

The moment generated reasoning creates deferred state transitions, the same old correctness problems return.

LLMs do not make them disappear. They make it easier to forget they exist.

---

## Partial failure and idempotency are agent problems too

The project often persists state through tools that cannot provide one database transaction over every affected surface.

That means a workflow can write one target successfully and fail before another write or readback finishes.

Pretending that cannot happen would make retries dangerous.

Instead, project state has canonical identities. A session keeps the same `session_key` across retries. A daily observation has one date identity. Evidence sources keep stable source identifiers. Material decisions have deterministic identity tied to the state they reviewed.

The persistence rules also require readback before a material decision is considered applied.

If a write partially succeeds, the retry should converge on the same after-state rather than create another copy, another rule, or another decision simply because the previous attempt ended badly.

This is mundane engineering, and that is exactly why I find it interesting.

A lot of discussion around agents focuses on planning, tool use and reasoning quality. Once tools have durable side effects, retry semantics become just as important.

An agent that can reason beautifully but cannot safely replay a failed mutation is not a reliable stateful system.

---

## A real closed loop where the correct decision was NO_CHANGE

The most useful example I have is deliberately unexciting.

After one completed strength-training exposure, the system had mixed evidence.

Performance had been preserved under a deliberately conservative dose. At the same time, temporary constraints from previous evidence still had unresolved follow-up gates. There was no eligible athlete-specific learned finding and no governed predictive model with authority to override those constraints.

A naive adaptation story would be tempting:

> Performance was good, so progress the plan.

The actual review did not do that.

The material decision was **NO_CHANGE**. The structural plan stayed untouched. The temporary monitoring rules stayed in force. The system recorded that the available evidence did not justify changing programme architecture merely because a review had been run.

That decision then influenced the next prescription.

The later session preserved the planned recovery interval, did not add compensatory volume, retained the active temporary constraints, and included conservative paths for what to do if the unresolved signal was still present.

The important flow was:

```text
completed exposure
    ↓
analysis against authoritative current state
    ↓
NO_CHANGE decision retained with lineage
    ↓
existing operational gates remain active
    ↓
next prescription consumes that state
```

That is the closed loop I wanted from the project.

Not “the AI changed something”.

The more meaningful property is that a prior completed event produced durable evidence, the evidence was evaluated under explicit authority rules, the system deliberately rejected an unnecessary structural mutation, and that decision constrained a later prescription.

Persistent context changed the next decision even though the programme did not change.

That is a much better test of the architecture than forcing a dramatic adaptation for demonstration purposes.

---

## What the system does not know yet

This boundary is important because the project contains more modelling infrastructure than it currently has evidence to trust.

There is a governed learned-athlete profile, but **no athlete-specific finding has been promoted into it yet**. That is intentional.

Several longitudinal model families are experimental or data-gated. The governance rules require forward evidence and applicability checks before a model can influence prescriptions. A model does not become authoritative because its output looks plausible or because several reviewers agree with it.

So the current system does **not** justify claims such as:

- it autonomously learns the athlete;
- it has a robust individualized energy-expenditure model driving training decisions;
- it has statistically learned an optimal personal volume/intensity response;
- it can reliably predict future strength marks from the current evidence;
- it automatically learns the ideal duration of a block or microcycle.

Those are interesting future questions. Some already have experimental scaffolding. They are not present-tense capabilities I want to borrow from the roadmap.

This distinction also changes how I think about “memory”.

Persisting more history is easy.

Earning the right to promote a repeated pattern into durable decision-support knowledge is much harder.

I would rather have an explicitly empty learned-profile surface than fill it with convincing anecdotes.

---

## Why I still call this RAG

There is a tendency in AI terminology to treat each new architectural layer as a replacement category.

I do not think that is useful here.

The system still retrieves external context and augments model reasoning with it. That is RAG in a perfectly ordinary sense.

What changed is that retrieval became one component inside a larger loop.

The full system now has concerns that the label *RAG* does not try to describe:

- which persisted state is authoritative;
- which workflow can mutate which surface;
- how evidence is typed;
- how much evidence is required for a durable change;
- how stale decisions are rejected;
- how partial writes are retried;
- how material decisions are audited;
- how later execution feeds back into future decisions.

Calling the project “not RAG” would create a false distinction.

Calling it only RAG would hide the parts that now dominate the engineering design.

That is why “agentic RAG with structured longitudinal memory” is useful shorthand for me, provided the shorthand is followed by the actual architecture rather than more terminology.

---

## General lessons from a deliberately small domain

Training is a bounded domain, and this project currently represents one user's system. I would not generalize its coaching validity or claim superiority over other training software from that.

But the state-management lessons transfer surprisingly well.

### Retrieval and authority are separate layers

Relevant context is not necessarily authoritative context. A persistent AI system needs to know not only what to read, but which source owns the fact when sources disagree.

### Reasoning and mutation should have different permissions

A model can be allowed to analyse a structural change without being allowed to write it. Separating proposal, approval and persistence keeps a plausible answer from becoming an accidental state transition.

### Inference must not silently become evidence

Observed facts, estimates and hypotheses need different lifecycles. Otherwise the system eventually retrieves its own speculation as if the world had confirmed it.

### `NO_CHANGE` is a real decision

Closed loops should not optimize for visible adaptation. Sometimes longitudinal context is valuable because it prevents a local observation from causing an unnecessary change.

### Side effects require ordinary correctness engineering

Fingerprints, stale-state checks, idempotent identities, readback, retries and immutable history are not glamorous agent features. They are the mechanics that make durable agent behavior trustworthy.

### “Learning” should describe a mechanism, not a feeling

A system remembering prior decisions and retrieving them later is not automatically learning. A system fitting an experimental model is not automatically allowed to use it. Durable personalized knowledge needs an explicit evidence and promotion path.

---

## The interesting part starts after the answer

The original version of this project was mostly about getting better context into a language model.

That remains useful, but it is no longer the part I spend most time thinking about.

The interesting questions now start after the model has produced a reasonable answer:

- Should this conclusion become state?
- Which state?
- Is this workflow allowed to change it?
- What evidence would justify a larger change?
- Has the state changed since the reasoning happened?
- Did the write succeed completely?
- Will a retry converge?
- What will the next workflow retrieve because of this decision?

That is the point where a stateless assistant begins to look like one component inside a persistent decision system.

And, at least for this project, that is where the engineering became much more interesting than the prompt.