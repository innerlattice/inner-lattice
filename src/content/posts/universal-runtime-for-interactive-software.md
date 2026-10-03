---
title: "Toward a universal runtime for interactive software"
description: "An append-only log, sequencers placed per contested decision, and entities, tables, reducers and subscriptions can serve every region of a product, with analytics, experiments and migrations read from the same log."
date: 2026-10-03T12:10:00-04:00
tags: ["software-engineering", "architecture", "systems-thinking", "agents"]
---

[Toward a universal theory of interactive software](/universal-theory-of-interactive-software) sorted the commit points of a product into six regions: scripted flows, adaptive flows, workspaces, and three kinds of live space called instruments, canvases and arenas. A typical product today runs a different stack for nearly every region. Flows run on a workflow engine or in request handlers. Workspaces run on a database, an API server, a websocket layer and a cache. Canvases add a CRDT library, and arenas run on a game server. Beside all of them sit a feature-flag service and an analytics pipeline. Each system keeps its own state and its own record of what happened, and engineers write code to keep those records consistent.

A runtime that served every region would need one substrate whose guarantees can be chosen per commit point. Two constraints decide what that substrate looks like: which decisions need coordination, and where the coordination happens.

## The log grows; decisions about absence need a sequencer

Every system can keep a monotonic substrate. An append-only log only grows, and game servers, databases and blockchains all keep one. Appending to a log never invalidates an earlier conclusion drawn from it, so replicas can append and exchange entries in any order and still agree once they have the same entries.

Non-monotonic reasoning enters through decisions derived from the log. "This player picked up the sword" is true only if no earlier conflicting claim exists. That is a statement about absence, and a late-arriving entry can overturn it. A safe decision requires someone to declare that the log is complete up to some point, and that declaration is coordination. The party that makes it is the *sequencer*.

Joseph Hellerstein and Peter Alvaro's [CALM theorem](https://arxiv.org/abs/1901.01930), proved by Tom Ameloot, Frank Neven and Jan Van den Bussche, makes the boundary exact: a problem has a consistent, coordination-free distributed implementation if and only if it is monotonic. A runtime therefore cannot avoid sequencers, but it can confine them to the decisions that test for absence and place each one as close to its participants as possible.

![Five sequencer placements with the wait per contested decision on a logarithmic scale](../../assets/diagrams/sequencer-ladder.svg "Each step down the ladder trusts fewer parties and waits longer for each contested decision.")

The placements form a ladder. CRDTs and local-first sync need no sequencer, because their merges are monotonic. One owner per object, as in a Cloudflare Durable Object or an authoritative game server, costs one round trip to the owner. Raft or Paxos inside one region costs a quorum round trip of a few milliseconds. Consensus across regions, as in Spanner-style databases, pays for distance. Public blockchains order writes without trusting any party and pay the most: Ethereum produces a block every 12 s and finalizes after about 13 minutes, and the customary six Bitcoin confirmations take about an hour.

Moving from a distributed design to a centralized one is a per-decision choice. A product can place one sequencer per contested decision, as small and as near its participants as possible, and leave everything monotonic coordination-free. Three techniques move decisions further toward the monotonic end:

| Technique | Mechanism | Example |
| --- | --- | --- |
| Escrow | split a contested quantity in advance so each node decides locally until its share runs out | each ticket server holds 100 seats; Patrick O'Neil's escrow transactional method (1986) |
| Speculation with rollback | act as if no conflict exists and retract the action if one appears | client prediction in shooters, rollback netcode in fighting games |
| Sealing | declare a window closed so decisions about absence inside it become safe | "no bids accepted after 20:00," end-of-day settlement |

CRDTs do not settle every question on their own. Shadaj Laddad, Conor Power, Mae Milano, Alvin Cheung, Natacha Crooks and Joseph Hellerstein's [Keep CALM and CRDT On](https://arxiv.org/abs/2210.12605) (PVLDB 16(4), 2023) points out that CRDT guarantees cover updates only. A query that reads a CRDT and tests a threshold, such as "the document has fewer than ten comments," can observe a state that a later merge contradicts. Their proposal applies the same monotonicity analysis to queries. The Berkeley group's [Hydro](https://github.com/hydro-project/hydro) project goes further and compiles programs whose coordination points are found by analysis, continuing a line that began with Dedalus, a Datalog with explicit time, and the Bloom language.

## One substrate

A model that serves every region already exists in production. [SpacetimeDB](https://github.com/clockworklabs/SpacetimeDB) keeps application state in relational tables held in memory, changes the tables only through *reducers*, which are transactional functions, and pushes changes to clients through *subscriptions*, which are live queries. Clockwork Labs runs its MMO BitCraft on it. Version 2.0 shipped in February 2026. The license is the Business Source License 1.1, which permits one production instance and converts to AGPL v3 with a linking exception on 2031-09-15, so a stack that depends on SpacetimeDB carries license risk. The model itself is not proprietary and can be rebuilt.

The model is relational, and entity-component-system (ECS) design, the standard architecture in game engines, is a special case of it:

| ECS | Relational | Ia |
| --- | --- | --- |
| Entity, identity only | primary key | Boundary |
| Component, data | row in a table | Store |
| System, behavior over a query | reducer plus query | Function executed by an Agent |

ECS separates identity, state and behavior, which object-oriented design joins in one object. The separation is one reason ECS engines are fast: components stored in contiguous columns keep the processor's cache full. The same separation lets one substrate serve every region, because each region adds behavior and views without changing how identity and state are stored.

![Four surfaces compile to entities, tables, reducers and subscriptions, which append to a log ordered by sequencers](../../assets/diagrams/substrate-stack.svg "Each region adds its own client behavior over one substrate.")

Each region keeps its own client behavior on top of the shared substrate. Flows keep a program counter, adaptive flows add policies and goals, workspaces render views over subscriptions, and live spaces run a client frame loop that commits at the end of a gesture or through a merge. Client-side databases extend the substrate toward the device. Geoffrey Litt, Nicholas Schiefer, Johannes Schickling and Daniel Jackson's [Riffle](https://dl.acm.org/doi/10.1145/3586183.3606801) (UIST 2023) stores user interface state in a reactive relational database on the client, and [LiveStore](https://livestore.dev) synchronizes an event log into SQLite in the browser.

## Compiling a flow

The cheapest test of the substrate is whether a flow compiles to it without new machinery. Each construct from the theory post maps to something the substrate already has:

| Flow construct | Compiles to |
| --- | --- |
| A running flow, such as one participant's session | an entity with a program-counter component |
| `ask` | a pending-input row; the answer arrives as a reducer call from the participant's Agent |
| `wait` | a scheduled reducer |
| `choose` | an assignment row on the randomization unit, written by the policy Agent's reducer |
| `goal` | a subscription over a window of the log |
| Experiment analysis and counterfactuals | replay of the log |
| Coupling graph | the read and write sets of reducer calls |

For the sleep study, the tables and the answering reducer look like this in pseudocode:

```text
table flow       (id, participant, program_version, pc)
table pending    (flow, question_id, schema)
table answer     (flow, question_id, value, at)
table assignment (unit, choice, branch, policy, at)

reducer answer_question(flow, question_id, value) by participant:
  require pending(flow, question_id)
  insert answer(flow, question_id, value, now)
  delete pending(flow, question_id)
  run(flow)   # advance to the next ask, wait or end
```

`*wait: 10.seconds` becomes `schedule run(flow) at now + 10 s`. `*experiment` becomes a policy reducer that reads the counts in `assignment` and writes the next participant's branch. Each `question_id` is a stable identifier, independent of the question's wording and position, which matters again when the program changes while participants are partway through it.

Goals compile to incremental views. Mihai Budiu, Leonid Ryzhyk and colleagues' [DBSP](https://arxiv.org/abs/2203.16684) (VLDB 2023 best paper) gives a mechanical way to turn a query over changing data into a computation that processes only the changes. A goal such as the average change in sleepiness per branch is a query over `answer` and `assignment`. Maintained incrementally, the same query feeds a bandit's policy, the experiment report and a dashboard.

The log therefore serves four purposes that usually need four systems. It is the analytics dataset, because every answer and assignment is in it. It is the audit trail, because every reducer call is recorded with its caller. It is the experiment dataset, because assignments and outcomes share one timeline. It is the counterfactual engine, because replaying it with one decision changed shows what would have followed, exactly up to the first later step where an Agent exercised judgment.

## Experiments on the coupling graph

Every reducer call reads some rows and writes others. Two entities are coupled when calls on behalf of one read rows written on behalf of the other, as when two bidders write to the same lot or two editors write to the same document. Recording read and write sets lets the runtime compute the coupling graph instead of asking engineers to declare it.

The theory post showed that one partition of the coupling graph serves three purposes. In the runtime, those purposes become configuration derived from the graph. Interest management sends a subscriber updates from its own cluster. Sharding places one sequencer per cluster. The experiment service assigns one branch per cluster, using graph cluster randomization where users are linked, or switchback periods where users compete for a shared pool such as drivers in a marketplace.

The derived settings differ by region:

| Region | Client runtime | How writes commit | Experiment unit | Checked before launch |
| --- | --- | --- | --- | --- |
| Scripted flow | program counter | one transaction per answer | person | every path |
| Adaptive flow | durable program counter and timers | transactions; contested steps at a sequencer | person, or cluster when coupled | paths and policy bounds |
| Workspace | views over subscriptions | transactions, optimistic when safe | person or account | permissions and invariants |
| Instrument | local frame loop and undo stack | one commit when a gesture or session ends | commits only, plus usability studies | undo reverses each action |
| Canvas | local replica and presence | merges | team or file | merge laws |
| Arena | prediction and reconciliation | sequencer per area of interest | match or server | latency budget and fairness |

## Migrating live schemas

A runtime that keeps state in memory, with clients holding replicas and flows paused partway through, has to change the shape of that state without disconnecting anyone. Code migrations in most web applications run against a database while servers restart; a live runtime has no such pause.

One proposal treats each migration as a codemod: a transformation shipped to every client and server and run on in-memory state. Because schemas change through a small number of structural operations, the codemods could come from a fixed library. Some could run in place, and some could be reversed. Published systems already implement most of the proposal, and four requirements follow from them.

**The structural operations form a small library.** Carlo Curino, Hyun Moon and Carlo Zaniolo's PRISM workbench (VLDB 2008) expressed schema evolution with schema modification operators, such as adding, renaming and dropping a column, or copying, merging, partitioning, decomposing and joining tables. Some operators preserve information, such as renaming a table or adding a column, and some lose it, such as dropping a column. Operators cover structure only. A change in meaning, such as splitting a name into given and family names or changing a unit from pounds to kilograms, still needs a function written for that change.

**Reversal needs the lost information.** Kai Herrmann and colleagues' [InVerDa](https://arxiv.org/abs/1608.05564) (SIGMOD 2017) defined bidirectional operators that keep the information each direction loses in auxiliary tables, so several schema versions stay readable and writable at once. A reversible codemod is a lens: a pair of transformations plus a store for what the forward direction drops.

**Clients upgrade at different times.** Ink & Switch's [Cambria](https://www.inkandswitch.com/cambria/) translates documents and individual edits between schema versions with bidirectional lenses, so a client on the old version and a client on the new one can edit the same document. A runtime has to translate operations as well as stored state, because old clients keep sending old-shaped writes until they upgrade.

**A migration on a canvas must commute with merge.** If replica A migrates and then merges an edit from replica B, the result has to equal merging first and migrating afterward: `migrate(merge(a, b)) == merge(migrate(a), migrate(b))`. A migration that fails this law leaves replicas that migrated at different times permanently different. The law can be checked at the migration's module boundary, as described in the languages post.

These requirements fix where a migration belongs: in the log, as an entry at an epoch. The sequencer orders the migration entry like any other write, so every replica agrees about which entries came before it. Entries before the epoch are read through the lens. Writes from old clients after the epoch pass through the lens before they are appended.

![A migration entry splits the log at an epoch; old clients write through a lens and a running flow moves to the new version at its next commit point](../../assets/diagrams/migration-epoch.svg "Recording the migration in the log gives every replica the same epoch.")

Running flows need one more rule. Jonathan Edwards, Tomas Petricek, Tijs van der Storm and Geoffrey Litt's [Schema Evolution in Interactive Programming Systems](https://arxiv.org/abs/2412.06269) (The Art, Science, and Engineering of Programming 9(1), 2025) lists eight challenges. Two apply directly. A running state machine can only switch versions at a quiescent point, and deleting the state a program is currently in requires a heuristic for where to put it. In a flow, the quiescent points are commit points: a participant waiting at `ask` holds no partial work. At the next commit point, the flow's program counter moves to the step with the same stable question identifier in the new version. If the new version deletes that question, the migration has to name a destination, and the analyzer can refuse a migration that leaves any live flow without one.

Production systems already use pieces of this design. Expand-and-contract deployments add the new shape, move readers and writers, then remove the old shape. Erlang's `code_change` callback converts a process's state during a hot upgrade. Kitsune (Hayden et al., OOPSLA 2012) updates running C programs at points the programmer marks. Event-sourced systems upcast old events when they read them. [Lamdera](https://lamdera.com) requires a type-checked migration function for every changed type between deployed versions, applies it to server and client state, and since version 1.1 generates most of that code. [Unison](https://www.unison-lang.org) identifies definitions by the hash of their content, so renaming a definition breaks no reference.

## What one runtime does not cover

Several needs fall outside the substrate.

**The client frame loop and prediction.** Instruments and fast arenas still simulate locally. The substrate receives their commits and orders their contested writes, but it does not draw frames.

**Offline and local-first editing.** A client that edits for a week without a connection needs a local replica that merges into the log on reconnect. Riffle and LiveStore are steps toward that; SpacetimeDB does not offer it.

**Analytics over long history.** An in-memory transactional store is a poor engine for scanning years of events. The log has to stream into a columnar store, and the incremental views from the log have to agree with batch queries over that store.

**Permissions on live queries.** A subscription is a standing read. When a policy changes, the runtime has to retract rows a client should no longer see, not just deny the next request. Row-level visibility therefore has to be evaluated incrementally, like any other view.

**More than one sequencer.** Coupling says where to cut the state. Running a transaction that crosses two sequencers still needs a commit protocol, and every cross-cluster edge adds latency to the writes that cross it.

## Open problems

**Placing sequencers automatically.** Hydro finds coordination points by analysis, and Indigo and Hamsaz find conflicting operations for invariants in restricted logics. No runtime yet combines the two with measured coupling to choose the smallest sequencer for each decision.

**Proving migrations commute with merge.** The law is easy to state and hard to prove for a migration that splits or merges entities, which are the operations Edwards and colleagues found to lose information.

**Incremental permissions.** Policies that can be analyzed statically, such as those written in Cedar, are checked per request today. Maintaining their results as views that retract rows when a policy or an attribute changes is not yet standard.

**Replay across Agents.** Every Agent call can be logged and replayed, but counterfactual analysis still stops at the first Agent that would have seen different input.

[Toward a universal set of languages for interactive software](/universal-languages-for-interactive-software) describes the languages an author would write for this runtime, from configuration values to Agent-interpreted procedures.
