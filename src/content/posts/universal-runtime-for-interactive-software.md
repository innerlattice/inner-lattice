---
title: "Toward a universal runtime for interactive software"
description: "The decision kernel needs four runtime components: a record, a rules engine, a gateway that binds decisions to choosers, and closers placed by coupling. Familiar architectures are configurations of them."
date: 2026-10-03T12:10:00-04:00
tags: ["software-engineering", "architecture", "systems-thinking", "agents"]
---

[Toward a universal theory of interactive software](/universal-theory-of-interactive-software) reduced interactive software to a kernel of three parts:

- facts, which record decisions;
- rules, which derive everything else from facts;
- decisions, which rules open and choosers fill.

Seven principles followed from it. A runtime executes the kernel. It needs one component for each part, plus one for closure, and the principles fix what each component must guarantee.

Products today assemble the same functions from separate systems:

- a database and a cache for state;
- a message queue for events;
- a workflow engine for long processes;
- a feature-flag service and an experimentation platform for choosers;
- an analytics warehouse for goals;
- a sync library or game server for live features.

Each holds its own copy of what happened, and glue code keeps the copies consistent. In the runtime below, each of these systems is a component, or a configuration of one.

## Four components

![The record, rules engine, gateway and closers on a server, with a client replica of the record, rules and gateway, and choosers connected to both gateways](../../assets/diagrams/runtime-components.svg "Four components, one per part of the kernel plus closure. A client replicates three of them so it can show predicted facts.")

| Kernel part | Component | Principles that constrain it |
| --- | --- | --- |
| Facts | record | 1, 2, 3, 6, 7 |
| Rules | rules engine | 1, 3, 4, 5, 6 |
| Decisions | gateway | 2, 4, 6, 7 |
| Closure | closers | 3, 4, 5 |

### The record

The record is an append-only log of facts, and every other store in the system is derived from it. Each field of an entry exists because some principle reads it:

| Field | Read by |
| --- | --- |
| Decision id | migration, which moves pending decisions by id; analytics, whose schema is the set of decisions |
| Outcome | every rule |
| Chooser | audit, rebinding and evaluation |
| View reference | explanation and counterfactual replay |
| Propensity | off-policy evaluation of program choosers |
| Program version | interpretation under the rules in force at the time |
| Causal position | merge, and the closer's check for conflicts |
| Closure scope | routing to the right closer |

The view reference points at the facts and rule version that produced what the chooser saw. It is not a copy of the screen, so the cost of recording what a chooser was looking at is one position in the log.

Erasure uses per-subject keys. Each person's facts are encrypted under a key held for that person, and deleting the key makes their facts unreadable everywhere the record has been copied, including backups. Aggregates computed before the deletion keep their values. Whether they must be recomputed is a policy decision.

### The rules engine

Recomputing every rule from the whole record on every new fact would be correct and far too slow. The engine instead maintains rule outputs incrementally. DBSP (Budiu, McSherry, Ryzhyk and Tannen, VLDB 2023) gives an algorithm that turns any query in its operator set into one that processes only changes. Differential dataflow (McSherry et al., CIDR 2013) does the same for iterative computations, including recursion.

Four functions that products usually run as separate systems are uses of this one engine:

- **Subscriptions** are influence edges. A client subscribes to the rules that produce its views and receives each change as it happens. Game engines call this interest management.
- **Policies** delete edges. When a policy changes, the engine retracts what has become invisible, as it would retract any other derived fact.
- **Provenance** records which facts produced each output. It explains a view to the person looking at it, attributes a goal to the decisions behind it, and is the influence graph itself.
- **Goals** are ordinary rules. A dashboard is a subscription to them, and a bandit reads them while choosing.

The engine also knows which outputs are final. Some rules conclude something from absence, through negation or an aggregate. While their scope is open, they can only produce provisional results, which are predicted facts in the theory's terms. The engine marks each output as provisional or final, and views use that mark to show what is still pending.

### The gateway

Rules open decisions; the gateway delivers each one to a chooser and returns the answer as a fact. A binding table says which chooser fills which decision under which conditions. A support system's refund decision shows the table's range:

| Decision | Condition | Chooser | Logged with the outcome |
| --- | --- | --- | --- |
| `refund.amount` | up to $20 | rule | rule version |
| `refund.amount` | up to $200 | agent, 90% of cases; support staff, a random 10% holdout | model, context digest, tool results; holdout propensity |
| `refund.amount` | over $200 | support lead | the view shown |

The table covers automation, delegation, escalation and an experiment that compares the agent with people. Changing a row is a program change, so the table's history is in the record, and every refund can be traced to the binding that produced it.

For each decision the gateway also:

- checks that the answer is one of the declared options;
- checks the policy on the binding, such as "agents never issue refunds above $200";
- enforces the deadline. Expiry is a decision by the clock, with a default or an escalation as its outcome.

Pending decisions are facts too. A claim waiting three weeks for a document is a fact in the record, not a sleeping process, so it survives restarts and deployments without further machinery. Durable execution engines such as [Temporal](https://docs.temporal.io/workflows) and Restate reach the same result from the other side. They log each step's result and replay deterministic workflow code to rebuild where it stopped.

The gateway also chooses the channel. The same decision goes to a screen, a voice assistant, a notification or an agent as a typed schema, and the third post in this series covers how a decision declares what it needs from a presentation.

### Closers

Each conflict scope needs one closer. Theater seats are a typical scope: every booking for one performance must pass through the same closer. Placing closers is the main architectural decision the runtime leaves open. The conflict partition sets the scopes, and the feedback deadlines set how far away each closer can be.

![Five placements of a closer with the typical wait for one contested decision on a logarithmic scale, from under a millisecond on the device to an hour for permissionless consensus](../../assets/diagrams/closer-ladder.svg "Each rung covers a wider scope and costs more time per contested decision.")

Each rung up the ladder covers parties that are farther apart, or trust each other less, and costs more time per decision. The runtime picks the lowest rung that covers each scope:

- A drawing app closes strokes on the device.
- A document editor closes structural operations, such as moving a section two people are both editing, at one owner per document.
- A bank closes transfers between accounts with a quorum.
- A multiplayer game closes contested actions at one server per zone. It accepts that players far from that server will predict more and roll back more.

Escrow moves the scope. A box office holding a block of seats is the closer for that block until it returns the unsold seats. The allocation and the return are both facts, so moving a closer leaves a record like any other decision. Decisions that span scopes need the scopes' closers to coordinate. Two-phase commit and sagas are the standard methods. Both are costly, which is why the partition should keep most contested decisions inside one scope.

## Clients replicate the runtime

A client runs a local record, a local rules engine and a local gateway. The local record holds the person's own facts and the facts they subscribe to. This is how the runtime shows predicted facts. When the person chooses, the local gateway records the choice at once and the local rules render it within the frame. The fact then travels to the server, and what happens next depends on its coupling:

| Coupling | Reconciliation | Familiar name |
| --- | --- | --- |
| None | the local fact is final | local-first app |
| Influence | merge and forward to subscribers | CRDT sync |
| Conflict | the closer rules; local predicted facts are rebased on the result, or the simulation rolls back and replays | optimistic UI with rebase; rollback netcode |

Replicache and Zero rebase pending client mutations on the server's authoritative state. GGPO rolls a fighting game back to the last confirmed frame and resimulates with the corrected inputs. Both are the third row, at different deadlines.

## One decision through the runtime

A person books a theater seat on their phone.

1. **Rules** derive the seat map from earlier holds and bookings. They open `seat.choose` for the person with a view of the available seats.
2. **The local gateway** records the person's choice of C14 as a predicted fact. Local rules draw the seat as pending.
3. **The gateway** on the server sends a claim to the closer for that performance. The closer finds no conflicting hold and records "C14 held until 20:10".
4. **The rules engine** updates the seat map. Subscriptions deliver the change to everyone else viewing the performance. A policy hides who holds the seat.
5. **The clock** is bound to the hold's expiry. If no payment fact arrives from the card network by 20:10, the clock closes the hold and the seat returns.
6. **Goal rules** for fill rate read the same facts. Suppose a recommender suggested C14. Its propensity was logged when the suggestion was made, so a different recommender can be evaluated against this booking later.

No step copies state into a second system. The warehouse, the cache, the workflow engine and the experiment log are all views of one record.

## Familiar architectures as configurations

| Configuration | Record | Rules | Gateway | Closer |
| --- | --- | --- | --- | --- |
| Interview: program picks next | server | server | server; pending decisions last weeks | the person, at submit |
| Workspace: person picks next | device, synced | device | device | owner, for the few contested decisions such as sharing |
| Commons | server, fanned out | server | server | none; influence delivered with long deadlines |
| Registry | server | server | server | one per scope; escrow to channels; the clock closes holds |
| Instrument | device | device | device | the device |
| Canvas | device and server | device and server | device | owner, only for contested operations |
| Arena | device and server | device and server | device, predicting | one per zone, ticking at a fixed rate |
| Delegated task | server | server | agent bound to "what next" | the delegating person, for consequential decisions |

A product runs several of these at once in one runtime. Its decisions differ in binding and closure scope, not in stack. The ride-hailing trip in the theory post spans five cells of the grid but needs only one record.

## Release as a fact

The theory's seventh principle says the program is a fact. The runtime records each release as a program-change decision at an epoch, and every fact carries the version it was made under.

![Two paths from the record to the new state, which must agree, above a timeline in which a release fact divides facts under v1 from facts under v2 and a pending decision keeps its stable id across the epoch](../../assets/diagrams/migration-square.svg "A migration is correct when deriving under the new version and migrating the old state give the same result. Pending decisions cross the epoch by stable id.")

Several mechanisms carry decisions across the epoch:

- **The rules engine** runs both versions while facts under the old version are still arriving. Old clients keep sending them, so the engine reads those facts under their own version and translates them through a rule. Ink & Switch's [Cambria](https://www.inkandswitch.com/cambria/) (2020) translates edits between schema versions with lenses, so that peers on different versions can keep editing one document.
- **The gateway** moves each pending decision to the decision with the same stable id in the new version. A decision with no counterpart gets a recorded fallback.
- **Changing an agent's model** is a release. Replaying recent decisions under both versions before the epoch shows what the change would have done.
- **The square is checked** before the epoch closes. Replaying recorded histories through both paths, deriving under the new version and migrating the old state, tests the square on real data rather than examples.

Temporal's versioning API is a small instance of the same idea. Workflow code branches on a version marker that is recorded in the workflow's own history, so a workflow started under old code replays under old code. Erlang's `code_change` callback lets a running process convert its state when new code is loaded.

## What exists today

Every component has mature partial implementations:

| Component | Systems |
| --- | --- |
| Record | Kafka, Datomic, workflow histories |
| Rules engine | Feldera (DBSP), Materialize (differential dataflow) |
| Gateway | Temporal and Restate (durable execution); Microsoft's Decision Service (Agarwal et al., 2016), which logged propensities at decision time; feature-flag services |
| Closers | Spanner, CockroachDB, FoundationDB, Cloudflare Durable Objects, game servers |
| Several at once | SpacetimeDB (log, reducers and subscriptions in one process; BSL 1.1, converting to AGPL in 2031), Replicache and Zero, LiveStore, Automerge, Yjs |

Game engines reached a related split on their own. The entity-component-system pattern separates identity, state and behavior in roughly the way the kernel separates decision ids, facts and rules.

No existing system unifies three things:

- a decision contract with interchangeable choosers and logged propensities;
- closer placement and sync partitions derived from the coupling graph;
- versioned interpretation of the record.

These are the parts the theory adds, and they are where most glue code lives now.

## Limits

- **Hard real-time control.** Recording a decision costs time, which a motor controller below the jitter of a scheduler cannot spare.
- **Media.** Video and audio frames are world facts far too dense to record. The record holds summaries and references, and the data plane stays separate.
- **Expensive simulations.** A physics or weather model can cost too much to recompute from the record. Snapshots then become stored state that cannot be rederived, and should be labeled as such.
- **Distrust.** Parties who do not trust each other push the closer to the top rung, and every contested decision pays for it.

## Open problems

1. **Joint placement.** Closer placement, sync partition and experiment unit all come from the same coupling graph but are chosen separately today. An optimizer would take deadlines and conflict weights, measured from the record, and choose all three together.
2. **Compaction against replay.** Snapshots save storage and recovery time. They also cut off replay, counterfactual evaluation and reinterpretation under later versions. No published policy says which facts a runtime may compact once erasure, audit and the program's version history are taken into account.
3. **Propensities for agents.** A sampled model exposes token probabilities, not the probability of the decision it made. A runtime can log an estimate, sample the model several times to measure one, or treat agent decisions as replayable only when pinned. Which choice keeps off-policy evaluation valid is unsettled.
4. **Presenting predicted facts.** People need to see what is pending, what was corrected and why, without the interface becoming a ledger. Card statements and collaborative editors handle this differently, and no shared vocabulary exists.

[Toward a universal set of languages for interactive software](/universal-languages-for-interactive-software) describes the source a programmer writes for this runtime. Each part of the kernel is written in the least powerful language that can express it, so the runtime's configuration can be read off the program.
