---
title: "Toward a universal runtime for interactive software"
description: "A runtime for the theory of choices, resolvers, records, and functions needs four components: a record store, an evaluator, a dispatcher, and sequencers. Databases, caches, workflow engines, experimentation platforms, and sync engines are partial implementations or configurations of them."
date: 2026-10-03T12:10:00-04:00
tags: ["software-engineering", "architecture", "systems-thinking", "agents"]
---

A product with accounts, live collaboration, and an AI assistant typically runs on several separate systems:

- a database and a cache store current state;
- a message queue carries events between services;
- a workflow engine runs processes that wait for days;
- a feature-flag service and an experimentation platform select variants;
- an analytics warehouse computes metrics;
- a sync library or a game server keeps clients up to date.

Each system keeps its own copy of what happened, and glue code keeps the copies consistent. Many familiar bugs are disagreements between copies: a cache that differs from the database, an experiment analysis missing assignments that a feature flag made, or a workflow that resumes under code that changed while the workflow waited.

[Toward a universal theory of interactive software](/universal-theory-of-interactive-software) describes interactive software with four primitives (choices, resolvers, records, and functions) and nine principles. This post derives a runtime from that theory. Each component implements one part of the theory, the principles set what each component must guarantee, and the systems listed above turn out to be partial implementations or configurations of four components.

## Terms and principles from the theory

| Term | Meaning |
| --- | --- |
| choice | a point where a run needs a value from outside its code; a choice has a stable identifier (its declaration's name and its address in the run), a view, options, a timeout, and a default |
| resolver | whatever supplies a choice's value: a function, a randomizer, a person, an AI model, a sensor, or an external system |
| record | an immutable entry containing a value supplied at a choice, with its provenance |
| function | a deterministic map from a set of records to a value; state, views, indexes, and the set of open choices are function outputs |
| binding | configuration stating which resolver supplies the value for which choice; only a value from the bound resolver counts |
| scope | a set of records picked out by a condition, such as every booking for one performance |
| sequencer | the single resolver that admits records into a scope in one order and writes the scope's seals |
| seal | a record stating that a scope is complete up to a position |
| provisional value | a function's output that is not yet final, shown before the seal and replaced after it |
| read coupling | a record from one choice can change another choice's view or options |
| order coupling | records from two choices can each be admitted alone but not together |
| goal | a function of the records with a direction and guardrails |
| response deadline | the longest time that can pass between supplying a value and showing its consequence before the interaction fails |
| release | a record that changes the program version |

The nine principles, as stated in [the theory](/universal-theory-of-interactive-software#nine-principles):

| Principle | What it requires |
| --- | --- |
| Derivation | Store every value supplied at a choice, and compute everything else from the stored values. |
| Binding | Specify each choice without naming its resolver, and set separately which resolvers may supply it. A record counts only if its resolver was bound and its value is among the options. |
| Sealing | Conclude that a record does not exist only over a sealed scope. |
| Prediction | When the response deadline is shorter than the time to seal, show provisional values, and treat a record made from a provisional view as provisional too. |
| Effects | Present each choice under its identifier so that a repeat has no further effect, open a choice with effects only from final values, and make "unknown" the default when the reply can be lost. |
| Coupling | Derive which choices affect each other from the functions, and use that one graph to place sequencers, sync, and experiment units, and to state what access rules must cut. |
| Grounding | Interpret each value against the view it was selected from, and record any interpretation that the view does not determine as a choice of its own. |
| Goals | State each goal as a function of the records with a direction and guardrails. |
| Versions | Store the program version with every record, and translate old records instead of rewriting them. |

The sections below restate each requirement where a component meets it.

## Four components, one per part of the theory

![A server running a record store, an evaluator, a dispatcher, and sequencers, and a device running replicas of the first three plus a sequencer for its private scopes, with resolvers connected to both dispatchers](../../assets/diagrams/runtime-components.svg "One component per part of the theory. A device replicates three of the components and sequences its own private scopes.")

| Part of the theory | Component | Guarantee | Principles |
| --- | --- | --- | --- |
| Records | record store | every acknowledged record is durable, never modified, and reaches every replica that subscribes to it | derivation, sealing, versions |
| Functions | evaluator | every output equals the function applied to the records the evaluator has received, and is labeled final or provisional | derivation, sealing, prediction, coupling, goals |
| Choices, resolvers, and bindings | dispatcher | every open choice reaches its bound resolver under the choice's identifier, a value counts only from the bound resolver and within the choice's options, and every timeout records the default | binding, prediction, effects, goals, versions |
| Scopes and seals | sequencers | each scope that needs order has exactly one sequencer at a time, which admits the scope's records in one order and writes the scope's seals | sealing, prediction, coupling |

Seals are records, so a fifth primitive is not needed for them. A separate component is needed, because a sequencer has properties that storage does not: there is one per scope, its placement sets the latency of every order-coupled choice, and its failure stops admission to its scope.

## The record store

The record store contains every record. Every other store in the system, including caches, indexes, search engines, and the analytics warehouse, contains outputs of functions and can be rebuilt from the record store. Replicas merge by set union, so merging is commutative, associative, and idempotent, and replicas that store the same records and run the same program version compute the same state.

### Record fields

Each field exists because some principle reads it.

| Field | Definition | Used by |
| --- | --- | --- |
| `id` | a unique identifier, such as the pair of the creating replica and a counter | merging, which discards duplicates |
| `choice` | the stable identifier of the choice that was resolved: its declaration's name and its address in the run | the analytics schema, which is the set of declarations (derivation principle); presentation under the identifier (effects principle); migration, which moves open choices by identifier (versions principle) |
| `value` | the supplied value, one of the choice's options | every function |
| `resolver` | the identity and version of whatever supplied the value: a function version, an AI model and its version, a person, or an external system | audit, rebinding, and evaluation (binding and goals principles) |
| `snapshot` | the records from which the view was computed, identified by a version vector | recomputing the view exactly; causal order |
| `version` | the program version whose functions computed the view and options, including the libraries and data files those functions read | reading the record under the functions in force when the record was made (versions principle) |
| `probability` | the probability with which the resolver selected the value given its view: 1 for a deterministic resolver, the recorded value for a randomized one, and absent for an opaque one | off-policy evaluation (goals principle) |
| `time` | the wall-clock time where the value was supplied | display and timeouts; not order, because clocks drift by unknown amounts |

A [version vector](https://en.wikipedia.org/wiki/Version_vector) has one counter per replica that creates records. The counter for a replica states that every record of that replica up to the count, of those the view reads, is included. Each replica's records must therefore arrive in order, and a snapshot is then identified in a few numbers instead of a copy of the screen. Given the snapshot and the version, the evaluator can recompute the view exactly, as long as none of those records has been erased or compacted. The snapshot also orders records causally: record $a$ precedes record $b$ when $a$ is inside $b$'s snapshot, and two records are concurrent when neither precedes the other. Devices usually receive other parties' records through a server, so a device's snapshot can be stated as the server's position plus the device's own counter.

Causal inference calls the `probability` field a *propensity*. It records the resolver's own randomization. When a binding itself selects a resolver at random, as the refund holdout below does, that selection is a separate choice resolved by a randomizer, and it gets its own record and probability.

### Admission and seal records

A sequencer writes two kinds of record, both ordinary records whose resolver is the sequencer:

- An **admission** resolves the choice of whether a record enters an ordered scope. Its value names the record, the outcome (admitted or refused), and, if admitted, the position assigned in the scope.
- A **seal** resolves the choice of whether a scope is complete up to a position. Its value names the scope and the position.

An admission at position $p$ also seals positions before $p$, since nothing can later be admitted ahead of it. Separate seal records are needed when a scope must be closed without a new admission, as when polls close or a sale ends.

### Erasure

Records are never modified, so deleting a person's data on request needs a separate method. Each person's records are encrypted under a key held for that person, and destroying the key makes the records unreadable in every replica and backup. Outputs computed before the key was destroyed, such as aggregate counts, keep their values until recomputed. Whether a given aggregate must be recomputed depends on the applicable law. Copies that left the record store in plaintext, such as exports, are beyond the key's reach. Erasure is the one event that changes a final output.

## The evaluator

The evaluator computes every function output: state, views, indexes, goals, access rules, and the set of open choices. Recomputing every function over all records after each new record would be correct and far too slow, so the evaluator maintains outputs incrementally, processing only the change. [DBSP](https://arxiv.org/abs/2203.16684) converts any query built from its operators into an incremental query, and [differential dataflow](https://www.cidrdb.org/cidr2013/Papers/CIDR13_Paper111.pdf) does the same for iterative computation, including recursion. Other code, such as a game's step function, is incremental only when written as a step from its previous output.

Four services that products usually run as separate systems are outputs of the evaluator:

- **Subscriptions** deliver changes along read-coupling edges. A device subscribes to the functions that compute its views and receives each change to their outputs. Game engines call this *interest management*.
- **Access rules** remove read-coupling edges or narrow what a view shows along them. When an access rule changes, the evaluator retracts the outputs that are no longer visible, as it would retract any other output.
- **Provenance** maps each output to the records it was computed from. Provenance explains a view to the person looking at the view, and traces a goal's value to the choices behind the value.
- **Goals** are functions like any other. A dashboard subscribes to them, and a bandit reads them while it runs.

### Final and provisional outputs

Each element of an output is *final* when no record that can still be admitted would retract it, and *provisional* otherwise. The evaluator labels an element final only when one of two checks proves it.

1. **A check on the function's definition.** A function built only from monotone operators (selection, projection, join, union, and recursion without negation) can only gain elements as records are admitted. Every element it outputs from admitted records is final.
2. **A check on seals.** A function that uses negation, aggregation over a scope, or "the latest value" can lose elements when a record arrives. For each such function the evaluator tracks the scopes it reads, and an element becomes final once the evaluator holds seals covering every position the element depends on, from each part's sequencer when the scope is split, and the records at those positions. Positions are consecutive, so a gap shows a missing record.

A seat map for one performance shows both. "C14's hold was admitted at position 88" is final once the admission arrives. "Seat C15 is free" and "seat C14 is held" each state that a record does not exist, a hold or a release, so a seal through position 88 makes them final only as of that position. Stream processors apply the second check with *watermarks*, which are seals over time windows. Views use the label to show what is still pending.

## The dispatcher

The evaluator outputs the set of open choices, and the dispatcher delivers each open choice to its bound resolver and records the value that comes back. A binding table states which resolver supplies the value for which choice, under which condition. The refund amount in a support system shows the range a table can cover (amounts in dollars):

| Choice | Condition | Resolver | Recorded with the value |
| --- | --- | --- | --- |
| `refund.amount` | up to 20 | refund function | function version; probability 1 |
| `refund.amount` | 20 to 200 | AI agent in a random 90% of cases, support staff in the other 10% | for the agent: model version and prompt digest, with each tool call recorded as a choice of its own; for the assignment: a separate record with probability 0.9 or 0.1 |
| `refund.amount` | over 200 | support lead | snapshot of the view |

One table covers automation, delegation, escalation, and an experiment that compares the agent with people. The table is part of the program, so changing a row is a release (versions principle), and every refund can be traced to the binding in force when it was made.

For each choice the dispatcher also:

- **checks the value against the binding and the options.** A value counts only if its resolver is bound to the choice and the value is among the options computed from the resolver's snapshot, or if it is the default recorded at the timeout; any other value is recorded as refused. For an order-coupled choice the sequencer also checks the invariant and the binding at admission, because records admitted since the snapshot can make the value violate the invariant or revoke the binding.
- **checks rules on bindings** when a binding is deployed. A rule such as "AI agents do not resolve refunds over 200" is a function over the binding table, and a table that violates it is refused before it takes effect.
- **runs the timeout.** The dispatcher keeps a timer for each open choice. If the timeout passes with no value recorded, the dispatcher appends a record whose value is the choice's default and whose `resolver` field names the timeout. The resolver's value and the default cannot both count, so the dispatcher that runs the choice's timer is its sequencer and records whichever reaches it first. An escalation is a choice whose default opens another choice bound to a different resolver.
- **presents each choice under its identifier.** A retry after a dropped connection presents the same choice again, and an external system that accepts an idempotency key returns its first result instead of acting twice. A choice with effects opens only from final outputs, and when its reply can be lost, its default is "unknown", which opens a reconciliation choice, bound to the same resolver, whose value is the outcome under the first choice's identifier. A late reply supplies the reconciliation's value, and a reconciliation that ends in "unknown" escalates to a person.
- **selects the channel.** The same choice can go to a screen, a voice interface, a notification, or an AI agent as a typed schema. [Toward a universal set of languages for interactive software](/universal-languages-for-interactive-software) covers how a choice declares what any presentation must convey.

Open choices survive restarts without further machinery. An insurance claim waiting three weeks for a document is not a suspended process or a sleeping thread. The open choice is an output of a function over the records, and after a restart the evaluator computes the same set of open choices from the same records. [Durable execution](https://docs.temporal.io/workflows) engines such as Temporal and Restate reach the same property by a different route: they record the result of every step and rebuild a workflow's position by replaying its deterministic code against those results.

## Sequencers

Every scope that contains order-coupled choices needs exactly one sequencer at a time. Scopes come from the order-coupling graph (coupling principle): every booking for one performance can be one scope, because bookings for the same seat are order-coupled and bookings for different performances are not. The sequencer admits each record into the scope or refuses it, and an admitted record receives the next position.

Where a sequencer runs is configuration. Three requirements of the scope set it:

- **which parties' records enter the scope.** A scope that contains only one device's records can be sequenced on that device.
- **how many failures the scope must survive.** A single server stops admitting while it is down, and a quorum of replicas keeps admitting while a majority is up and can reach one another.
- **whether the parties trust a common operator.** Parties that do not trust a common operator need [Byzantine fault tolerance](https://en.wikipedia.org/wiki/Byzantine_fault), which keeps admitting correctly while some participants send false messages.

Each requirement rules out some of the placements in the figure below. Admission time grows down the list, so the best placement is the highest one that meets all three requirements.

![Five placements of a sequencer with the typical time to admit one record on a logarithmic scale, from under a millisecond on the device to an hour for permissionless consensus](../../assets/diagrams/sequencer-ladder.svg "Each placement survives more failures or less trust than the one above it, and admission takes longer.")

Examples of placements in use:

- A drawing app sequences strokes on the device.
- A document editor merges concurrent text edits without a sequencer, and sequences structural operations, such as moving a section two people are editing, at one server per document.
- A bank sequences transfers with a quorum of replicas.
- A multiplayer game sequences contested actions at one server per match or zone. Players far from that server see more provisional values and more corrections.

Escrow changes the scope a sequencer covers. A box office holding a block of seats is the sequencer for that block until it returns the unsold seats, and the allocation and the return are both records. Moving a scope to a new sequencer is a handoff: the old sequencer seals the scope at its last position, and the new one admits from the next position. A failed sequencer cannot seal, so a quorum seals for it: in [Raft](https://raft.github.io/), a majority that votes in a new numbered term refuses the old leader's entries, and the new leader already holds every committed entry.

A choice whose invariant spans two scopes, such as a transfer between accounts held on different shards, needs both sequencers. [Two-phase commit](https://en.wikipedia.org/wiki/Two-phase_commit_protocol) admits the record in both scopes or in neither. A [saga](https://doi.org/10.1145/38713.38742) admits it in one scope and, if the second refuses, appends a compensating record to the first. Both cost extra round trips, so scopes are drawn to keep most order coupling inside one scope.

## Replicas on devices

A device runs replicas of the record store, the evaluator, and the dispatcher, plus a sequencer for scopes that contain only the device's own records. The local record store contains the device's own records and the records the device subscribes to, without the fields that access rules hide from the device. When a person selects a value, the local dispatcher records the value immediately and the local evaluator updates the view within the frame. The record then travels to the server, and what happens next depends on the choice's coupling:

| Coupling | Reconciliation | Usual name |
| --- | --- | --- |
| Independent | the local record is final | local-first app |
| Read | records merge by set union and are forwarded to subscribers | CRDT sync |
| Order | outputs that depend on the record stay provisional until admission; after a refusal, each local record made from a view that showed the refused record is refused, asked again, or reapplied on top of the admitted ones, as its choice states, or the simulation rolls back and recomputes | optimistic UI with rebase; rollback netcode |

[Bayou](https://www.cs.princeton.edu/courses/archive/fall15/cos518/papers/bayou.pdf) kept writes tentative until a primary server committed them, and rolled back and reapplied tentative writes to follow the committed order. [Replicache](https://doc.replicache.dev/concepts/how-it-works) reapplies pending local changes on top of the server's admitted state. [GGPO](https://www.ggpo.net/) rolls a fighting game back to the last frame with confirmed inputs and recomputes the frames since. All three implement the third row, at different response deadlines.

## A seat booking through the four components

A person books a theater seat on a phone for performance 311.

1. **Evaluator.** The phone's evaluator computes the seat map from the records stored on the phone and outputs the open choice `seat.select` with a view of the free seats. A bandit has recommended C14, and the bandit's record contains the probability of that recommendation.
2. **Dispatcher, on the phone.** The person selects C14. The local dispatcher appends a record, and the local evaluator draws C14 as held but provisional, because the record has not been admitted.
3. **Sequencer.** The record reaches the server, and the dispatcher there forwards it to the sequencer for performance 311. The sequencer finds no earlier admitted hold on C14 and admits the record at position 88.
4. **Evaluator, on the server.** The seat map changes. Subscriptions deliver the change to everyone else viewing the performance, and an access rule removes the holder's identity from their views. The admission is final, so the evaluator can open `payment.authorize`, a choice with effects, bound to the card network, with a timeout at 20:10 and the default "unknown".
5. **Dispatcher, on the server.** The dispatcher presents `payment.authorize` under its identifier, so a retry cannot charge the card twice. If the card network's reply arrives first, the dispatcher records the reply and the sequencer admits the record. If 20:10 passes first, the dispatcher records "unknown", and the evaluator opens `payment.reconcile`, whose value the card network supplies: the outcome under the identifier of `payment.authorize`. The seat-map function computes C14 as free again only after a record states that no payment was authorized.
6. **Evaluator, for goals.** The fill-rate goal reads the same records. Because the recommendation's probability is recorded, a different recommender's booking rate can later be estimated from this booking. The estimate is approximate, because each recommendation changes which seats later customers see.

The booking appends these records:

| Record | Choice | Value | Resolver | Probability |
| --- | --- | --- | --- | --- |
| r1 | `seat.recommend` | C14 | bandit, version 4 | 0.35 |
| r2 | `seat.select` | C14 | the person | absent |
| r3 | admission to performance 311 | r2 admitted at position 88 | sequencer for performance 311 | 1 |
| r4 | `payment.authorize` | approved | card network | absent |
| r5 | admission to performance 311 | r4 admitted at position 91 | sequencer for performance 311 | 1 |

Each record also carries its `id`, `snapshot`, `version` and `time`. The seat map, the hold's expiry, the open choice that sends the confirmation email, the fill-rate dashboard, and the recommender's evaluation are all function outputs over these five records. No step copies state into a second system.

## Runtime configuration for each class of choice

The theory post sorts choices into six classes by coupling and response deadline. Each class sets where the components run:

| Coupling | Deadline | Record store | Evaluator | Dispatcher | Sequencer | Familiar systems |
| --- | --- | --- | --- | --- | --- | --- |
| Independent | long | server, device, or both | where the view is needed | where the resolver is | the device, or none | form backends, local-first apps |
| Independent | short | device | device | device | device | drawing apps, instruments |
| Read | long | server, delivered to subscribers | server | server | none; records merge | comment systems, wikis, feeds |
| Read | short | device and server | device and server | device | none; records merge | collaborative editors |
| Order | long | server | server | server or device | one per scope | booking systems, banks |
| Order | short | device and server | device and server, with rollback | device, recording provisional values | one per scope, placed close to the parties | multiplayer game servers, exchanges |

A product combines classes in one runtime, because the classes describe choices, not products. The ride-hailing trip in the theory post uses four of the six classes over one set of records.

A delegated task, such as a coding agent working through a repository, is not a seventh class. It is a binding: the choice of next step is bound to an AI agent, and choices with large consequences are bound to the delegating person.

## Releases

A release is a record. Its value is the new program version, and each choice keeps the version it was opened under: choices opened before the release, or on a device not yet updated, keep the old one. Every record carries the version it was made under, so each component handles a release in its own way:

- **The evaluator** runs both versions while records made under the old version still arrive. Clients on the old version keep producing them, so the evaluator reads each one under its own version and converts it through a translation function. [Cambria](https://www.inkandswitch.com/cambria/) translates edits between schema versions with lenses, so peers on different versions can keep editing one document.
- **The dispatcher** maps each open choice by stable identifier to its counterpart in the new version, where its value counts after translation. A choice with no counterpart receives a recorded fallback, or "unknown" if an external system already received it.
- **Changing an AI agent's model** is a release. Replaying recent choices with both models before the release shows what the change would have done.
- **The migration square is tested by replay.** The theory post defines a migration $\mu$ from stored state under version $v$ to stored state under version $v'$ as correct when $\mu(\mathrm{state}_v(R)) = \mathrm{state}_{v'}(\tau(R))$ for every set of records $R$ that runs can produce before the release, where $\tau$ translates old records: migrating the old state gives the same result as translating the records and recomputing under the new version. Before the release record is appended, the evaluator computes both sides over every prefix of the stored records and reports each prefix on which the two sides differ.

![Two paths from the records to state under version 2, which must agree, above a timeline in which a release record separates records made under version 1 from records made under version 2, and an open choice keeps its stable identifier across the release](../../assets/diagrams/migration-square.svg "A migration is correct when migrating the old state and recomputing under the new version agree. Open choices carry over a release by stable identifier.")

[Temporal's versioning API](https://docs.temporal.io/develop/typescript/versioning) is a small instance of the same design: workflow code branches on a version marker recorded in the workflow's own event history, so a workflow started under old code replays under old code.

## Existing systems by component

Every component has mature partial implementations:

| Component | Systems |
| --- | --- |
| Record store | Kafka with retention disabled, Datomic, the event histories of durable execution engines |
| Evaluator | Feldera (DBSP), Materialize (differential dataflow), spreadsheet recalculation engines |
| Dispatcher | Temporal and Restate; feature-flag services; a [contextual-bandit service](https://arxiv.org/abs/1606.03966) that records each probability at the moment of selection |
| Sequencers | Spanner, CockroachDB, FoundationDB, [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/), authoritative game servers |
| Several components in one system | SpacetimeDB, Replicache, Zero, LiveStore, Automerge, Yjs, [Daml](https://arxiv.org/abs/2303.03749) |

None of these systems combines three capabilities:

- bindings with interchangeable resolvers and recorded probabilities;
- sequencer scopes, sync, and experiment units computed from one coupling graph;
- records read under the program version that produced them.

These are the parts the theory adds, and they are where much of today's glue code sits.

## Limits

- **Hard real-time control.** Recording a selection takes time, which a motor controller with microsecond deadlines cannot spare.
- **Media.** Video and audio frames are sensor readings too dense to store one record per frame. The records contain references and summaries, and the media travels on a separate path.
- **Expensive simulations.** A physics or weather simulation can cost too much to recompute from the records. Its stored checkpoints then contain state that cannot be cheaply recomputed, and the runtime should label the checkpoints as such.
- **Parties without mutual trust.** Such parties require Byzantine fault tolerance, and every order-coupled choice among them pays its latency.

## Open problems

1. **Joint placement.** Sequencer placement, sync partitions, and experiment units all come from the coupling graph, but today they are chosen separately. An optimizer could take response deadlines and coupling weights measured from the records and choose all three together.
2. **Compaction against replay.** Checkpoints of state save storage and recovery time, and they cut off replay, counterfactual evaluation, and reading under later versions. No published policy states which records a runtime may compact once erasure, audit, and the program's earlier versions are taken into account.
3. **Probabilities for AI model resolvers.** A sampled model exposes the probability of each token, but a value such as a refund amount is reached through many possible reasoning texts, and the value's probability is a sum over all of those texts. A runtime can estimate that probability by sampling the model several times, record the probability only for constrained outputs, or treat the model as opaque. Which option keeps off-policy evaluation valid is unsettled.
4. **Presenting provisional values.** People need to see what is pending, what was corrected, and why, without the interface becoming a ledger. Card statements and collaborative editors present this differently, and no shared vocabulary exists.

[Toward a universal set of languages for interactive software](/universal-languages-for-interactive-software) describes the source code a programmer writes for this runtime. Each part of a program is written in the least powerful language that can express it, so the runtime's configuration, including scopes, sequencers, and the record schema, can be computed from the program.
