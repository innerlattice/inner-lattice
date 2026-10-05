---
title: "Toward a universal theory of interactive software"
description: "A theory of interactive software with four primitives (choices, resolvers, records, and functions) and eight principles, each answering a constraint every interactive system faces. Undo, offline mode, optimistic updates, safe retries, A/B tests, sharding, access control, delegation to AI agents, and live migration follow from the principles."
date: 2026-10-03T12:00:00-04:00
tags: ["software-engineering", "architecture", "systems-thinking", "ontology", "agents"]
---

A booking site, a shared document, a multiplayer game, a tax questionnaire, and a coding agent are all interactive software. Each one runs until it needs a value it cannot compute, such as a person's input, a sensor reading, or a payment network's reply, and its next output depends on the value that arrives.

Teams build these products with different architectures:

- forms use request handlers and a database;
- shared editors use merge algorithms;
- games use an authoritative server and client-side prediction;
- long processes run on workflow engines;
- A/B tests run on experimentation platforms;
- AI agents run on agent frameworks.

Each architecture has its own vocabulary, and several problems are solved in each under different names. Offline editing in a document, rollback in a fighting game, and a pending transaction in a banking app are one mechanism. The shards of a database and the units of an A/B test can be computed from the same graph.

This post describes a theory small enough to cover all of these. It has four primitives, called *choices*, *resolvers*, *records*, and *functions*, and eight principles. Each principle answers a constraint that every interactive system faces, such as the time information takes to travel, or programs changing while people are using them. Features usually built as separate products follow from the principles: undo, offline mode, optimistic updates, safe retries, A/B tests, sharding, access control, delegation to AI agents, and live migration.

Two later posts build on the theory. [Toward a universal runtime for interactive software](/universal-runtime-for-interactive-software) describes a runtime that executes programs built on the theory, and [Toward a universal set of languages for interactive software](/universal-languages-for-interactive-software) describes a language for writing programs in it.

## Four primitives: choices, resolvers, records, and functions

A running program alternates between computing and waiting for input. Computing is deterministic: the same inputs give the same outputs. Waiting happens where the program needs a value that its code does not determine. The theory names the point where the program waits, the source of the value, the stored value, and the computation.

- A **choice** is a point where a run needs a value from outside its code. The program specifies what the value must satisfy, but not how the value is produced. Every input to a program is the value of some choice, so choices include form fields, button presses, sensor readings, random draws, clock readings, and replies from other systems. Each choice has:
  - a stable identifier: the name of the declaration in the code that opens the choice, and the choice's *address*, which says where in its run it opened;
  - a *view*: the information shown to whatever supplies the value;
  - *options*: the set of values the choice accepts;
  - a *timeout*: how long the choice waits for a value;
  - a *default*: the value used when the timeout passes.

  A choice is *open* until it has a value. One declaration can open many choices, such as one question per guest or one per pass through a loop, and each has its own address.
- A **resolver** supplies a choice's value. A resolver can be a person, an AI model, a random number generator, a deterministic function, a sensor, or another organization's system. A *binding* states which resolver supplies the value for which choice, and only a value from the bound resolver counts.
- A **record** stores one choice's value with its provenance: the choice, the resolver, the view shown to the resolver, the program version, and the time. Records are never modified.
- A **function** is a deterministic map from a set of records to a value: the same records always give the same result. Everything other than records is the output of a function, including current state, screens, search indexes, metrics, access rules, and the set of open choices.

*Choice* names the open question and *record* names the answer. This post avoids the word "decision", which is commonly used for both. *Resolver* names a role and implies no deliberation: a thermometer resolves the choice "current temperature", and a random number generator resolves the choice "which variant this visitor sees".

![A loop from the records through functions to views and open choices, then to resolvers, whose values are appended to the records](../../assets/diagrams/interaction-loop.svg "Functions compute views and open choices from the records. A resolver supplies a value for each open choice, and the value is appended as a record.")

A record is a claim made from one perspective: it contains the value one resolver supplied, given the view that resolver was shown. The claim can be wrong, because a person can mistype an address and a sensor can drift. Records are never modified, and at most one record answers a choice, so a wrong record is corrected by the answer to a later choice, such as an edit, whose record names the record it supersedes.

The theory has no primitive for state. State is a function of the records, so state can always be recomputed, and two devices that store the same records and run the same program version compute the same state.

### How a resolver differs from a function

A deterministic function can serve as a resolver, so a function and a resolver can run the same code. They differ in what happens to the output:

- **A function's output is derived.** The output is computed from the records whenever the output is needed, and it is never stored as a record. Changing a function's code changes every output the function computes from then on, including outputs about the past.
- **A resolver's output is recorded.** Once a resolver supplies a value, later computation reads the record and does not run the resolver again. Changing a resolver changes only the values it supplies afterward.

A price shows the difference. If the price of an order is a function of the catalog's records, a change to the pricing code changes the computed price of every past order. If the price is a choice bound to a pricing function, the quoted price is recorded, and each order keeps the price it was quoted after the pricing code changes. Whether a value should be a function output or a choice depends on whether the value must stay fixed after being shown to someone.

### Resolvers ordered by determinacy

Of the ways resolvers differ, determinacy sets what can be learned from their records.

| Determinacy | Examples | Repeating the choice | Probability of the supplied value |
| --- | --- | --- | --- |
| Deterministic | a pricing function, game physics, a routing table | gives the same value | 1 |
| Randomized | A/B assignment, a bandit algorithm, a seeded shuffle | gives the same value with the same seed | known, and recorded |
| Opaque | a person, an AI model, a payment network, a sensor | may give a different value | unknown |

Opaque resolvers sit outside the *system boundary*, the line between what the program determines and what it receives from its environment. Whoever models a system sets where the system boundary runs, and engineering work moves resolvers across the boundary:

- automation replaces an opaque resolver with a deterministic one;
- a test suite replaces every opaque resolver with values written into the test in advance or recorded from earlier runs, so that runs can be reproduced;
- delegation to an AI agent replaces one opaque resolver with another.

An AI model sampled at temperature zero is deterministic in principle. In practice, batching, hardware differences, and model retirement make such a model's outputs hard to reproduce, so this post classifies AI models as opaque.

Some opaque resolvers have goals of their own: people, AI agents, and other organizations. These *agents* adapt to the program, so the program's design changes the values they supply. Bidders on auction sites, for example, bid later when auctions end at a fixed time than when auctions end after a period with no bids. A sensor does not adapt to the program in this way.

![Resolvers arranged by determinacy, from deterministic functions through randomized assignment to people, models, and external systems, with the system boundary between randomized and opaque resolvers](../../assets/diagrams/resolvers.svg "A resolver's determinacy sets whether the values it supplies can be reproduced and whether their probabilities are known.")

### The primitives in formal terms

A choice $c$ is a tuple

$$
c = \left(\mathit{id}_c,\ \mathrm{view}_c,\ \mathrm{opt}_c,\ t_c,\ d_c\right)
$$

where:

- $\mathcal{R}$ is the collection of possible sets of records;
- $\mathit{id}_c$ is the choice's stable identifier, made of its declaration's name and its address;
- $\mathrm{view}_c : \mathcal{R} \to V_c$ computes, from a set of records, the view shown to the resolver, a value of type $V_c$;
- $\mathrm{opt}_c : \mathcal{R} \to \mathcal{P}(X_c)$ computes, from a set of records, the admissible values, a subset of the choice's value type $X_c$ ($\mathcal{P}(X_c)$ is the set of all subsets of $X_c$);
- $t_c$ is the timeout;
- $d_c \in X_c$ is the default, recorded when the timeout passes.

A binding $\beta$ maps each choice to a resolver. A resolver selects a value in $\mathrm{opt}_c(R)$ given $\mathrm{view}_c(R)$. A deterministic resolver is a function of the view and the options, a randomized resolver is a probability distribution $\pi(x \mid v)$ over the options for each view $v$, and an opaque resolver is one whose distribution the program does not know. A function is a map $f : \mathcal{R} \to Y$ for some output type $Y$. The view, the options, and the binding are themselves functions, so they change as records arrive.

In programming-language terms, a choice is an [algebraic effect](https://arxiv.org/abs/1312.1399): an operation a program performs, whose result is supplied by a *handler* defined outside the code that performed the operation. A resolver is a handler that supplies one value per choice, and the value is recorded. [Interaction trees](https://arxiv.org/abs/1906.00046) give whole programs a semantics in these terms. A program denotes a possibly infinite tree whose nodes are requests to the environment and whose branches are the possible responses. A run is a path through the tree, and the records list the responses along the path.

## Eight principles

Each principle starts from a constraint that is true of every interactive system and states a rule that meets it. Together the rules keep results agreeing across devices, surviving failures and releases, and arriving in time, and they let resolvers be replaced and compared. They do not guarantee progress: every choice ends at its timeout, but a flow can keep opening new choices, as one that asks about an unknown payment until the network answers does. The sections that follow explain each constraint, state the principle precisely, and list what follows from it.

| Principle | Constraint it follows from | What it requires |
| --- | --- | --- |
| Derivation | Functions are deterministic. | Store every value supplied at a choice, and compute everything else from the stored values. |
| Binding | Different resolvers can supply the same choice. | Specify each choice without naming its resolver, and set separately which resolvers may supply it. A record counts only if its resolver was bound and its value is among the options. |
| Sealing | Records reach different places at different times. | Conclude that a record does not exist only over a sealed scope. |
| Prediction | A response can be needed sooner than records can travel. | When the response deadline is shorter than the time to seal, show provisional values, and recompute them when the seal arrives. |
| Effects | Presenting a choice can change the world, and the reply can be lost. | Present each choice under its identifier so that a repeat has no further effect, open a choice with effects only from final values, and make "unknown" the default when the reply can be lost. |
| Coupling | Functions combine records from more than one resolver. | Derive which choices affect each other from the functions, and use that one graph to place sequencers, sync, and experiment units, and to state what access rules must cut. |
| Goals | Bindings can be compared only against a direction. | State each goal as a function with a direction and limits. |
| Versions | The program changes while its records persist. | Store the program version with every record, and translate old records instead of rewriting them. |

## Derivation: store supplied values and compute everything else

Functions are deterministic, so the only new information that enters a running system is the values supplied at choices. Every other value can be computed from the records of those values. A table's current row, a cache, a search index, and a dashboard are outputs of functions, and each one can be recomputed from the records. When a stored value disagrees with what its function computes from the records, the stored value is wrong.

**Derivation principle:** store every value supplied at a choice as a record, and compute every other value from the records.

Chess notation already follows the principle. A game is recorded as its move list, every position in the game is computed from the move list, and statistics about an opening across millions of games are functions over millions of move lists.

The real-time strategy game Age of Empires (1997) applied the principle to networking. Its developers calculated that sending each unit's position, status, action, facing, and damage over a 28.8 kbps modem would limit a multiplayer match to about 250 moving units. Instead, each machine sent only its player's commands, and every machine ran an identical deterministic simulation from the same commands, so the network traffic no longer grew with the number of units. The developers titled their account of the design [1500 Archers on a 28.8](https://www.gamedeveloper.com/programming/1500-archers-on-a-28-8-network-programming-in-age-of-empires-and-beyond). Real-time strategy games have used this architecture, called deterministic lockstep, since the 1990s, and their replay files are lists of commands. Most web applications do the opposite: a server sends clients its current state, such as rows, documents, or rendered pages, and keeps the inputs that produced the state only in logs, if at all.

Several features follow without further design:

- **The data schema is the list of choice declarations.** Any question an analyst can ask about a product is a function over its records, so an analytics tracking plan can be generated from the program's choices.
- **Version history, audit, and debugging by replay** are functions over the records. Undo appends a record that reverses an earlier one.
- **Caches and indexes** are stored outputs of functions. Keeping them current is incremental computation.
- **Sync** sends records, and **offline work** collects records on the device until they can be sent.
- **Corrections** are new records, as reversing entries are in a ledger.

How choices are defined determines what is recorded. A drag gesture, for example, can be defined as one choice whose value is the point where the drag ends, or as a series of choices, one for each position sampled at 120 Hz. A value supplied by a deterministic resolver could be recomputed instead of recorded. Recording the value costs little and keeps the records interpretable after the binding changes.

Because records are never modified, deleting a person's data on request needs a separate method. Two methods are in use:

- encrypt each person's records under a key of their own, and destroy the key on request;
- add an access rule that removes the person's records from every view.

## Binding: specify each choice separately from its resolver

The lead story on a news site's front page was once chosen by an editor. Today the same choice can be resolved by:

- a 50/50 assignment between two headlines;
- a bandit algorithm that shifts traffic toward the headline with more clicks;
- an AI model that selects a headline per reader;
- an AI agent that writes a new headline.

The view, the options, and the timeout stay the same, and only the resolver changes.

**Binding principle:** specify each choice (its view, options, timeout, and default) without naming a resolver, and set the resolver by configuration, in a binding. A record counts only if its resolver was bound to the choice and its value is among the options, both as of the view the resolver was shown. A default recorded at the timeout counts even outside the options.

With one specification per choice and a separately configured resolver, several features become one construct:

| Usual name | Resolver bound to the choice |
| --- | --- |
| conditional, feature flag | a fixed function |
| A/B test | uniform or balanced randomization |
| bandit | a randomized policy that learns toward a goal |
| personalization, recommendation | a function of the view learned from data |
| classification, routing | an AI model |
| delegation | an AI agent |
| the user interface | a person |

Changing a binding accounts for more features:

- **Automation** moves a choice from a person to a function.
- **Escalation** moves a choice back to a person.
- **Delegation** moves a choice from a person to an AI agent, under limits the person sets.
- **Testing** binds resolvers that return values written into the test, randomized resolvers that search for failures, and AI models playing personas.
- **Regression testing** binds the values recorded in earlier runs and replays them against a new program version.
- **Presentation** depends on the resolver. The same choice can be drawn on a screen, read aloud by a voice interface, or given to an AI agent as a typed schema. An API for agents is the set of a product's choices with the rendering removed.

The choice with the largest effect on a product is which step comes next, and products are usually named after the resolver bound to that choice:

- When a deterministic function selects the next step, the product is an interview, such as a tax questionnaire or a checkout.
- When a person selects the next step, the product is a workspace, such as a spreadsheet.
- When an AI agent selects the next step, the product is a delegated task, such as a coding agent working through a repository.

[Mixed-initiative interfaces](https://erichorvitz.com/chi99horvitz.pdf) move the binding of the next-step choice between a person and a program within one session.

Two properties of a binding limit what an AI agent can do:

- **Discretion** is the number of outcomes that the choices bound to the agent can reach. "Select one of three refund amounts" allows little discretion, and "reply to the customer" allows a great deal. Splitting a choice with a large option set into choices with small ones makes each part checkable, and lowers discretion when some parts are bound to someone else, so how finely a task is divided and bound sets how much autonomy an agent has. [Levels of automation](https://doi.org/10.1109/3468.844354) can be set separately for gathering information, analyzing the information, selecting an action, and carrying the action out, which amounts to one binding per stage.
- **Authority** is the set of choices bound to the agent. Authority is set by the binding, independently of what the agent is capable of, provided the agent can act only through the program's choices, a point developed in [Old Foundations, New Agents](/durable-universals-agentic-ai-engineering).

The binding is the program's only rule for who may supply a value. Releases, seals, and records that a binding reads, such as a grant of a role, are values supplied at choices too, so the question of who may do any of them has one answer: whoever is bound to that choice in the version in force. A value from a resolver that was not bound, or outside the options offered, is recorded as refused, and no function other than an audit reads it. Checking that a record really came from the resolver it names is a matter of signatures, not of the theory.

Cybernetics sets a limit on deterministic bindings. The [law of requisite variety](https://en.wikipedia.org/wiki/Variety_(cybernetics)#Law_of_requisite_variety) says that a regulator keeps outcomes within bounds only if it can produce as many distinct responses as there are distinct disturbances to counter. In other words, a controller with fewer possible responses than the situations it faces will meet a situation for which it has no correct response. A deterministic resolver produces only the responses its author anticipated, so a choice whose views vary in ways nobody listed in advance needs a person or an AI model.

Determinacy also sets what the records can contain. A randomized resolver can record the probability with which it selected the value, called the *propensity* in causal inference. A person's propensities are unknown, and a person cannot be asked the same question again with nothing else changed. The goals principle depends on this difference.

## Sealing: wait for every record that could arrive before concluding that one is absent

Records reach different places at different times, so the records available at one place differ from those available at another. The set of records available to a resolver at a given moment is that resolver's *snapshot*.

"These people have voted" and "this document contains these edits" only grow as records arrive, so an answer given early is later added to but never taken back. Such a function is *monotone*:

$$
R \subseteq R' \implies f(R) \sqsubseteq f(R')
$$

Here $R$ and $R'$ are sets of records, $f$ is a function, and $\sqsubseteq$ is the order on $f$'s outputs, such as inclusion for sets. In words: adding records can only add to the output.

Other functions conclude that some record does not exist:

- "the seat is free";
- "the latest price is 40";
- "this username is available";
- "candidate A won".

One late record can make such a conclusion false. A value is *final* when no record that can still be admitted would change it. The conclusion can be final only if the system waits until every record that could affect the conclusion has had time to arrive, and then refuses any record that arrives later or admits it into a later scope, where it acts as a correction. Three terms describe how a system closes that waiting period:

- A **scope** is a set of records picked out by a condition, such as every booking for seat C14 at tonight's performance.
- The **sequencer** of a scope is the single resolver that admits records into the scope, one at a time and in one order. Each scope that needs an order has exactly one sequencer at a time.
- A **seal** is a record, written by the sequencer, stating that the scope is complete up to some position in that order: no record will later be admitted at or before that position. Admitting a record also seals the part of the scope before the admitted record, which is how a sequencer settles which of two concurrent bookings came first. A scope can also be [split into a fixed set of parts](https://www.neilconway.org/docs/icde2014_blazes.pdf) that are not order-coupled with one another, each with its own sequencer, as the escrow method below does. The whole scope is then sealed as far as every part is, as an election's ballots are complete once every precinct has sealed its own.

**Sealing principle:** later records only add to a monotone function's output over admitted records. A conclusion that depends on records being absent is final only over a sealed scope.

The [CALM theorem](https://arxiv.org/abs/1901.01930) draws the same line for queries, whose outputs are sets ordered by inclusion. When no place knows how records are divided among places, a query has a consistent distributed implementation that needs no coordination if and only if the query is monotone. Even "the current value" is a conclusion about absence, as is any value that a correction or an undo could supersede: last-writer-wins replication orders writes by timestamp, but no replica can tell that no later write exists.

![Records arriving over time, a running count that is correct at every moment, and a winner that is final only after the seal](../../assets/diagrams/sealing-timeline.svg "A monotone function is correct at every moment. A conclusion about absence is final only after the seal.")

Seals appear at every scale under other names:

| Usual name | Scope | Sequencer |
| --- | --- | --- |
| Pressing submit | one person's answers on a form | that person's device |
| A hold's timeout | one held seat | the booking system |
| A transaction commit | the rows the transaction read and wrote | the database |
| An entry reaching consensus | one position in a replicated log | a quorum of replicas |
| A watermark in a stream processor | one input's events before a timestamp | that input's source |
| An analysis cutoff | the data for one experiment | the experimenter |
| Closing the books | one accounting period | the accounting department |
| Polls closing | one precinct's ballots | the precinct's officials |

The smallest scope is one choice. A choice with a timeout can receive both its resolver's value and its default, and each can be admitted alone but not both, so each such choice is a scope with a sequencer of its own, which runs the timer and admits whichever value reaches it first. At most one record answers a choice, which settles duplicate replies and a reply that races its timeout without a further rule.

The sealing method changes what agents do. A [study of online auctions](https://www.cs.princeton.edu/courses/archive/spr08/cos444/papers/roth_ockenfels02.pdf) compared eBay, where auctions ended at a fixed time, with Amazon, where auctions continued until ten minutes passed without a bid. Bids in the final seconds were far more common on eBay. Bidders with more experience bid later on eBay and earlier on Amazon. The sealing method worked as a mechanism in the game-theoretic sense: the method set the incentives, and bidders adapted to the method.

Two methods avoid waiting for a sequencer:

- **Use choices whose records always merge.** Operations are [invariant-confluent](https://arxiv.org/abs/1402.2237) when any two valid sets of records they produce from a common valid set merge into a valid set. Likes on a post are invariant-confluent, and seats in a theater are not.
- **Split the scope.** The escrow method divides a shared quantity into shares, and each share has its own sequencer. A box office holding a block of seats can sell those seats without contacting the central system, and a warehouse can promise its own stock.

Offline work follows from both methods: a disconnected device can admit any record that is invariant-confluent or that falls in a share escrowed to the device.

The sealing method also sets what a statistical conclusion means. A fixed-horizon significance test assumes that its cutoff, which is a seal, was chosen without reading the outcomes. Sealing once the result looks significant reads them, and false positives multiply although the scope is sealed. [Always-valid inference](https://arxiv.org/abs/1512.04922) stays valid at any cutoff, however it was chosen.

## Prediction: show provisional values when records cannot arrive in time

Each choice involves two durations:

- The **response deadline** is the longest time that can pass between supplying a value and showing its consequence before the interaction fails, for example because a game stops feeling responsive or a person concludes that a button did nothing.
- The **sealing latency** is the time between supplying a value and the arrival of the sequencer's admission at the place where the value was supplied. The sealing latency is at least the round trip to the sequencer.

Human perception and physics set both durations. Responses within about 0.1 s [feel immediate](https://doi.org/10.1145/1476589.1476628). Animation at 60 Hz needs a new frame every 16.7 ms. For telephone calls, ITU-T Recommendation G.114 recommends at most 150 ms of one-way delay. On the other side, light in optical fiber travels about 200,000 km/s, so each 100 km of fiber adds about 1 ms to a round trip before any routing or processing. A sealed result within one 60 Hz frame needs the sequencer within about 1,700 km of fiber, and a round trip between London and Sydney takes at least 170 ms.

When the response deadline is shorter than the sealing latency, the view has to include records that the sequencer has not yet admitted. Functions evaluated over those records give **provisional values**, which are replaced when the sequencer's admissions arrive.

**Prediction principle:** when a choice's response deadline is shorter than its sealing latency, show provisional values computed from records not yet admitted, and recompute them when the admissions arrive. A record made from a view that showed provisional values is provisional too.

Several familiar features are this one mechanism:

- optimistic updates in a web app;
- characters appearing as they are typed into a shared document;
- a shooter's client moving the player before the server confirms the move;
- rollback netcode in fighting games;
- the pending line in a banking app after a card payment.

The card payment shows the mechanism plainly. The authorization is a provisional record, labeled pending, and settlement days later is the seal that posts the payment.

![A log-log plot of sealing latency against response deadline, with a diagonal separating choices that can wait for the seal from choices that need provisional values](../../assets/diagrams/deadline-distance.svg "Below the diagonal, the response deadline is shorter than the sealing latency, so the view shows provisional values.")

For invariant-confluent choices, the device admits the record itself, so monotone outputs over it are final at once. For other choices the provisional value can be wrong. The cost of prediction grows with how often provisional values are wrong, because each wrong provisional value becomes a correction that someone sees.

A provisional value can also reach a record. A person who holds seat C14 provisionally and then adds a meal for C14 makes the meal record from a view that showed the hold. If the sequencer refuses the hold, the meal record rests on a record that was never admitted, which rollback recovery calls an *orphan*. Its choice states what happens then: the record is refused, the choice is asked again, or the value is applied again on top of the admitted records, as rollback netcode replays a player's inputs.

Designers have three levers:

1. **Move the sequencer closer.** Trading firms place their servers in the exchange's data center, and a drawing app makes the device the sequencer for its own strokes.
2. **Lengthen the response deadline.** Age of Empires scheduled each command to run two 200 ms communication turns after the command was issued. Turn-based games make the deadline a whole turn. [EVE Online](https://www.eveonline.com/news/view/introducing-time-dilation-tidi) slows its simulation to as little as 10% of normal speed during large battles.
3. **Make the choice invariant-confluent,** so that the choice needs no seal.

[Optimistic simulation with rollback](https://doi.org/10.1145/3916.3988) is the general form of prediction. Each part of a simulation runs ahead using the records available to that part, and when a record arrives with an earlier timestamp, the part rolls back and recomputes.

## Effects: present each choice so that a repeat changes nothing

Presenting a choice to a resolver outside the system boundary can change the world. A request to a card network moves money, a message to a mail server reaches a person, and a request to a deployment service changes what people run. The presentation and the record that answers it are separate events, and a run can fail between them: the card network approves a charge, and the reply is lost or arrives after the timeout. The derivation principle covers replay, because later computation reads the record instead of presenting the choice again. It does not cover a retry before any record exists, or a default recorded after the world has already changed.

**Effects principle:** present each choice under its stable identifier, so that presenting it again has no further effect; open a choice that has effects only from final values; and when the reply can be lost, make "unknown" the default.

Each part uses something the theory already has:

- **The choice's identifier is the idempotency key.** Payment networks and many APIs accept [a key with each request](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) and return the first result when a key repeats. A retry presents the same choice, so it carries the same key.
- **Effects follow final values.** A provisional value can be wrong, and a sent email cannot be unsent, so a confirmation is opened only after the booking it confirms is admitted. An effect that must start sooner is split, as a card authorization holds funds when a trip is requested and the capture waits for the final fare. A compensating choice, such as a refund, is an effect too, and opens from the final record that calls for it.
- **"Unknown" is an option.** A default of "declined" for a payment is wrong whenever the network approved the charge and the reply was lost: the program releases the seat and keeps the money. A default of "unknown" opens a second choice, bound to the same network, that asks for the outcome under the first choice's identifier, and a late reply to the first choice answers it. If the second choice also ends in "unknown", a person decides.

Whether a choice has effects is a property of the choice, not of its resolver. The same card network resolves a balance inquiry, which has no effect, and a charge, which has one.

No method performs an effect exactly once through a system that ignores the key. After a lost reply, the sender cannot tell whether the request arrived, which is the [two generals problem](https://en.wikipedia.org/wiki/Two_Generals%27_Problem). The principle therefore gives one effect per choice where the resolver keeps the identifier for longer than the choice's timeout, and a recorded "unknown" everywhere else.

## Coupling: derive which choices affect each other from the functions

Functions combine records supplied by different resolvers, so the value supplied at one choice can change the view or the options of another choice. Two relations describe how choices affect each other. In the definitions below, $a$ and $b$ are choices, $r_a$ and $r_b$ are records of values supplied at them, $\mathrm{view}_b$ and $\mathrm{opt}_b$ are the view and option functions of $b$, and $I : \mathcal{R} \to \{\text{true}, \text{false}\}$ is an *invariant*, a condition every admitted set of records must satisfy. $R$ ranges over $\mathcal{A} \subseteq \mathcal{R}$, the *reachable* sets of records: those a run of the program can produce, each of which satisfies $I$.

**Read coupling** $a \to b$ holds when a record from $a$ can change $b$'s view or options:

$$
\exists R \in \mathcal{A},\ r_a :\ \mathrm{view}_b(R \cup \{r_a\}) \neq \mathrm{view}_b(R)\ \ \lor\ \ \mathrm{opt}_b(R \cup \{r_a\}) \neq \mathrm{opt}_b(R)
$$

In words: for some reachable set of records, adding some record from $a$ changes what $b$ shows or accepts.

**Order coupling** $a \leftrightarrow b$ holds when records from $a$ and $b$ can each be admitted alone, but not together:

$$
\exists R \in \mathcal{A},\ r_a, r_b :\ I(R \cup \{r_a\}) \land I(R \cup \{r_b\}) \land \lnot I(R \cup \{r_a, r_b\})
$$

In words: for some reachable set of records, adding either record alone keeps the invariant true, and adding both makes the invariant false.

Order-coupled choices need a sequencer to admit one record first and refuse the other. Sets of records merge by union and each admission adds one record, so a set of choices is invariant-confluent exactly when no order coupling holds among them: a failure over longer histories always contains a failing pair. Order coupling can hold without read coupling. When $b$'s options ignore $a$'s records, as a sign-up form that accepts any email address does, the sequencer refuses $b$'s record at admission.

Two people booking the same seat are order-coupled. Two people commenting on the same post are read-coupled. Two people typing into the same paragraph of a shared document are read-coupled when a merge algorithm combines their edits, because every combination of concurrent edits then merges into a valid document, though not always into the text either person meant.

**Coupling principle:** derive which choices affect each other from the functions, and use the resulting graph to set what is synchronized, which records share a sequencer, and which units share an experiment variant, and to locate the edges that access rules remove.

Each use cuts different edges: sequencer scopes keep order edges inside, experiment units keep read edges inside, and sync follows read edges. Exact derivation is undecidable for general code, so a compiler keeps an edge wherever a function, or a resolver that learns from records, reads another choice's records. Extra edges cost coordination or statistical power, not correctness.

![A graph of choices joined by read coupling and order coupling, divided into three parts, with the edges that cross parts marked](../../assets/diagrams/coupling-graph.svg "One partition of the coupling graph sets what syncs live, where sequencers sit, and which units share an experiment variant.")

Most of what a product does about other people uses one of the two relations:

| Feature | Relation | Use |
| --- | --- | --- |
| Subscriptions, interest management in games | read | deliver records along edges |
| Presence, live cursors | read | deliver along edges with short response deadlines |
| Notifications | read | deliver along edges with long response deadlines |
| Access rules, privacy settings, blocking | read | remove edges; the [lattice model of information flow](https://doi.org/10.1145/360051.360056) is the general form |
| Sharding | order | partition so each part has one sequencer; edges that cross parts need distributed transactions |
| Experiment units | read | partition so each part receives one variant; edges that cross parts carry treatment between variants |

The last row is where statistics and systems engineering meet. Causal inference's *stable unit treatment value assumption* (SUTVA) includes the requirement that one unit's outcome not depend on another unit's treatment. Read coupling that crosses between variants can break the requirement, and so can contact outside the program, which no function shows. Software rarely has this property by default, so the property has to be engineered. Three methods are in use:

- **Partition the graph.** [Graph cluster randomization](https://arxiv.org/abs/1305.6979) assigns variants to clusters of a social graph. The same year, [balanced label propagation](https://web.stanford.edu/~jugander/papers/wsdm13-blp.pdf) partitioned that graph across servers, so experiment units and shards were computed from one graph.
- **Randomize over time.** When coupling runs through a shared pool, as when every rider in a city draws on the same drivers, the graph has no useful clusters. [Switchback designs](https://arxiv.org/abs/2009.00148) randomize time periods instead.
- **Change the functions to remove edges.** A [budget-split design](https://arxiv.org/abs/2012.08724) for ad experiments gives each variant its own share of every advertiser's budget, so the variants cannot draw on the same money. This design is the escrow method from the sealing principle, used to obtain statistical independence instead of coordination-free writes.

An access rule removes an edge only when nothing $b$ sees, counts and refusals included, changes with $a$'s records, the property called [noninterference](https://doi.org/10.1109/SP.1982.10014). Access rules can remove read coupling but not order coupling. If two people try to register the same email address, the second person learns that the first exists, whatever the access rules say, because the refusal itself carries the information. A sign-up form that reports "this email is already registered" therefore lets anyone test whether a person has an account. The standard fix moves the outcome to a channel only the address's owner can read: "If an account exists, we have sent a link."

Economics sorts goods into *rival* goods, whose use by one party prevents use by another, and *non-rival* goods, such as information, whose use by one party does not. In this theory, rivalry corresponds to order coupling. Non-rivalry corresponds to read coupling, which is still coupling: an idea one person shares changes what others know and select. The economic terms carry an assumption the structure does not. They make separation the default, describe contact between parties as competition, and describe the most widely shared goods as if their users had no effect on each other. In the coupling graph, both kinds of good are edges. Whether an edge helps or harms the parties it joins depends on the parties' goals, the subject of the next principle, and the same edge can do both.

## Goals: functions with a direction and guardrails

Several resolvers can be bound to one choice, and they can be compared only against a direction. Systems are built to change something: more completed bookings, fewer refunds, faster answers. A goal states such a change as a function of the records, together with limits the change must respect. Formally, a goal is a function $g : \mathcal{R} \to \mathbb{R}$ ($\mathbb{R}$ is the real numbers) to be increased or decreased, together with guardrails $c_i(R) \le k_i$: functions $c_i$ that must stay within bounds $k_i$ while $g$ changes. Conversion rate is a goal, and refund rate, latency, and complaint rate are typical guardrails. The period over which a goal is evaluated belongs in its definition, because a metric that rises over a week can fall over a year.

**Goals principle:** state each goal as a function of the records with a direction and guardrails, and compute analytics, experiments, and optimization from that one definition.

Several practices are uses of goals:

- **Analytics** evaluates goals and their inputs over the records. A dashboard displays goal values.
- **Attribution** follows provenance from a goal's value back to the records that produced the value.
- **An experiment** combines four parts from earlier principles: a randomized resolver with recorded probabilities, a goal, units taken from a partition of the read-coupling graph, and a seal for analysis.
- **Bandit algorithms and personalization models** are resolvers that read a goal's value while they run.
- **Pre-registration** records the goal and the analysis plan before any outcome exists. Medical journals have required registration of clinical trials before enrollment since 2004.

Recorded probabilities make it possible to evaluate a binding that was never deployed. The standard estimator, inverse propensity scoring, is

$$
\hat{G}(\pi') = \frac{1}{n} \sum_{i=1}^{n} \frac{\pi'(x_i \mid v_i)}{p_i}\, g_i
$$

where:

- $n$ is the number of records at a choice;
- $v_i$ is the view in the $i$-th record, and $x_i$ is the value supplied;
- $p_i$ is the recorded probability with which the deployed resolver selected $x_i$;
- $\pi'(x_i \mid v_i)$ is the probability that a candidate resolver $\pi'$ would select $x_i$ given view $v_i$;
- $g_i$ is the goal's value attributed to the $i$-th record;
- $\hat{G}(\pi')$ is the estimated value of the goal had $\pi'$ been bound to the choice.

In words: reweight each recorded outcome by how much more or less often the candidate would have selected the same value. The estimate needs $p_i > 0$ for every value the candidate might select, which is why the records of a deterministic resolver, with probability 1 on one value and 0 on the rest, cannot evaluate alternatives. [Offline evaluation of news recommendation](https://arxiv.org/abs/1003.5956) applied this estimator to a log of randomly selected articles, and [a decision service built on the method](https://arxiv.org/abs/1606.03966) records each probability at the moment of selection.

Counterfactual replay generalizes the estimator. Hold the functions fixed, change one record, and recompute everything after the changed record. The result is exact until the first later opaque resolver whose view would have changed. A pinned AI model can be asked again, but a person cannot, so beyond that point the replay needs a stand-in for the person, such as a predictive model of the person's behavior.

Optimizing a goal without guardrails tends to find the cases where the function differs from what the function was meant to measure, and a more capable resolver finds more of those cases. Experimentation practice handles the problem with guardrail metrics. In this theory, one goal with its guardrails can be shown on a dashboard, steer a bandit, and constrain an AI agent.

## Versions: store the program version with every record

Programs change while choices are open. Some people still run last year's version of an app, an insurance claim may be halfway through a review that takes weeks, and an AI agent may be partway through a task. If every record carries the version it was made under, each record can be read under the functions in force when the record was made. Tax law treats transactions the same way: a sale is taxed under the law in force at the time of the sale, and retroactive change is exceptional and explicit.

**Versions principle:** store the program version with every record, and store each release as a record. A migration is correct when it gives the same state as recomputing from the records under the new version.

- **A release is a record.** Choices opened after the release use the new version.
- **Migrations change how records are read.** Old records stay as they are, and translation between versions is a function.
- **Open choices move by stable identifier.** A form can be edited while thousands of people are partway through the form, as long as every open choice maps to a choice in the new version or to a recorded fallback.
- **Changing a binding is a release,** because the change alters which resolver supplies each value. Changing an AI agent's model is one case.

Records can therefore be read in two ways, and each answers a different question. The *historical reading* evaluates each record under the functions in force when the record was made, and answers what a person was shown and why they selected what they did. The *current reading* evaluates every record under the newest functions, and answers what the state is now. Both are functions of the same records. A release that changes what a choice asks, rather than how its value is written, gives the choice's declaration a new name, because no translation turns an answer to one question into an answer to another. Open choices of the old declaration then receive a recorded fallback.

Rewriting stored state, as a database migration or a codemod does, is an optimization of the same idea, and its correctness condition is exact. Let $\mathrm{state}_v : \mathcal{R} \to S_v$ compute state of type $S_v$ from a set of records under version $v$, and let $\mu : S_v \to S_{v'}$ migrate stored state from version $v$ to version $v'$. The migration is correct when

$$
\mu\big(\mathrm{state}_v(R)\big) = \mathrm{state}_{v'}(R) \quad \text{for every set of records } R
$$

In words: migrating the old state gives the same result as recomputing the state from the records under the new version, which reads old records through translation functions. A diagram of this kind is called a *commuting square*, because both paths around the square arrive at the same value. Where replicas merge state with an operation $\sqcup$, the migration must also preserve merges: $\mu(s_1 \sqcup s_2) = \mu(s_1) \sqcup \mu(s_2)$ for any two states $s_1$ and $s_2$.

The records contain real past runs, so the condition can be tested by replaying those runs along both paths. A finite library of migration operators, each with a known inverse or complement, satisfies the condition by construction. Three such libraries exist: [schema modification operators](https://doi.org/10.14778/1453856.1453939), [bidirectional lenses](https://doi.org/10.1145/1232420.1232424), and [functorial data migration](https://arxiv.org/abs/1009.1166).

One requirement has no exception. If a release changes what an earlier view showed, after someone selected a value based on that view, the change must itself be recorded, as a restatement is in accounting. Otherwise the selection loses the context that gave it meaning.

## How the terms of the theory relate

The four primitives and the eight principles introduce ten terms. Each term after the first is needed because the terms before it leave something undetermined:

1. A **choice** is a point where a run needs a value that its code does not determine.
2. The value has to come from outside the code, so each choice needs a **resolver**.
3. Later computation depends on the value, so the value has to stay fixed, and it is stored as a **record**.
4. Each record holds one value. What the records mean together, such as the current state, the next view, and the next open choice, is computed by a **function**.
5. Functions are deterministic, so what a program does depends on which resolver supplies each choice. A **binding** states that dependence.
6. Functions combine records from different resolvers, which couples choices. When two records cannot both be admitted, one resolver has to put them in order: a **sequencer** orders a **scope** of records, and a **seal** states that the scope is complete up to a position.
7. Bindings can be compared only against a direction, which a **goal** states.
8. Choices, functions, bindings, and goals change as the program changes, and each change is a new **version**.

The matrix below lists the terms in that order and states how each term acts on the others. Each filled cell holds a verb, and the cell reads as a sentence from the term on its row to the term on its column: the cell in row *Resolver* and column *Choice* reads "a resolver resolves a choice". Cells on the diagonal relate two instances of one term, such as a record that supersedes an earlier record.

![A matrix of ten terms, from choice to version, with a verb in each cell where the row term acts on the column term, and every filled cell on or below the diagonal](../../assets/diagrams/term-relations.svg "Read each cell from the row term to the column term. Dashed lines separate the four primitives and the terms added by each principle.")

Every filled cell lies on or below the diagonal. Each relation runs from a later term to an earlier one, so no term depends on a term that comes after it. The row for *Choice* is empty, because everything that gives a choice its content comes later: a function computes its view and options, a resolver supplies its value, and a record stores the value.

The top-left block traces the interaction loop: a function opens a choice, a resolver resolves the choice, the record of the resolver's value answers the choice, and a function reads the record. The rows for scope, sequencer, and seal repeat the first three primitives with records as their subject. A sequencer orders a scope as a resolver resolves a choice, and a seal closes the scope and names its sequencer as a record answers a choice and names its resolver. Two of these terms are cases of the primitives they repeat: a sequencer is a resolver, and a seal is a record. A goal is also a function, and a release is a record.

Four principles add no term. Coupling appears in one cell: a function couples choices. Prediction needs no term, because a provisional value is a function's output that is not yet final. Effects needs no term, because the key that makes a repeat harmless is the choice's identifier and "unknown" is one of the choice's options. Derivation appears as an absence: no term in the matrix denotes stored state.

The principles are independent in a similar sense: each can be broken while the other seven hold. The table gives one such failure per principle, with the two sentences of Binding taken separately, and what goes wrong.

| Principle broken | A failure in which every other principle holds | What goes wrong |
| --- | --- | --- |
| Derivation | A seat count kept by handler code drifts from the bookings after a failed request. | a wrong result |
| Binding, first sentence | The payment choice names its card network, so a test cannot bind a scripted resolver. | changing a resolver needs new code |
| Binding, second sentence | Any signed-in user can approve a refund bound to the support lead. | an unauthorized result |
| Sealing | A results page declares a final winner before every precinct has reported. | a wrong result |
| Prediction | A game waits for the server before moving the player. | a late result |
| Effects | A retry after a lost reply carries a new key, and the card is charged twice. | a repeated effect |
| Coupling | An experiment randomizes riders who draw on the same drivers. | a biased estimate |
| Goals | A bandit maximizes clicks while the declared goal is completed bookings. | the wrong target optimized |
| Versions | A workflow paused under one version resumes under the next and reads an old field with its new meaning. | a misread record |

## Features built from the principles

| Feature | Principles | Construction in the theory |
| --- | --- | --- |
| Version history, audit, undo | derivation | functions over the records; undo appends a reversing record |
| Caches, indexes, search | derivation | stored outputs of functions |
| Analytics, funnels, attribution | derivation, goals | goals and provenance over the records |
| Feature flags, A/B tests, staged rollouts | binding, coupling, goals | a randomized resolver with recorded probabilities, units from a coupling partition, and a goal |
| Personalization, recommendation | binding, goals | a learned resolver that reads a goal |
| Automation, escalation, delegation | binding, coupling | changing a binding, within rules on the binding table |
| Simulated users, regression replay | derivation, binding | resolvers that return values written into a test, or recorded values |
| Voice interfaces, accessibility, agent APIs | binding | one choice presented differently per resolver |
| Durable workflows, reminders | derivation, binding | open choices are functions of the records; timeouts record defaults |
| Submit buttons, turns, commits | sealing | seals |
| Inventory, quotas, rate limits | sealing | escrow: a scope split into shares, each with a sequencer |
| Offline mode | sealing | admitting invariant-confluent or escrowed records on the device |
| Optimistic UI, client prediction, rollback | prediction | provisional values |
| Retries, idempotent payments, reconciliation | effects | presentation keyed by the choice's identifier; an "unknown" default that opens a reconciliation choice |
| Presence, live cursors, notifications | prediction, coupling | read coupling, delivered by response deadline |
| Access control, privacy, blocking | coupling | removed read-coupling edges |
| Sharding | coupling | a partition of the order-coupling graph |
| Experiments with interference | coupling, goals | a partition of the read-coupling graph, or functions that remove edges |
| Off-policy evaluation, counterfactuals | derivation, binding, goals | recorded probabilities and replay |
| Live updates, schema migration, old clients | versions | versioned records and translation functions |

## Six classes of choices by coupling and response deadline

Two quantities defined in the sealing, prediction, and coupling principles determine what a runtime must do for a choice:

- its coupling: independent, read-coupled, or order-coupled;
- its response deadline: long (a second or more, enough for a network round trip) or short (below about 100 ms, shorter than many round trips).

| | Independent | Read-coupled | Order-coupled |
| --- | --- | --- | --- |
| **Long deadline** | compute anywhere; the device is the sequencer | merge, deliver later | wait for the sequencer |
| **Short deadline** | compute on the device | merge, deliver live | show provisional values, reconcile with the sequencer |

The runtime's work grows from the top-left class to the bottom-right one. The resolver varies within every class.

![Six classes of choices by coupling and response deadline, each with the runtime behavior it needs and example choices marked by resolver](../../assets/diagrams/choice-classes.svg "Coupling and response deadline determine what the runtime does. The resolver varies within every class.")

The usual taxonomy of forms, editors, and games hides two of the classes. Comment threads, wikis, and email are read-coupled with long deadlines. Bookings, username registration, and bank transfers are order-coupled with long deadlines: they wait for a sequencer and do not predict.

Products combine classes, so the classes describe choices, not products. A ride-hailing trip uses five of the six:

| Choice | Resolver | Response deadline | Coupling | Runtime behavior |
| --- | --- | --- | --- | --- |
| Destination | rider | long | independent | compute anywhere |
| Price quote | pricing function with a market-balance goal | long | read, through shared supply | merge, deliver later; experiments need switchbacks |
| Rider–driver match | dispatch function | seconds | order, over drivers | wait for a sequencer per zone |
| Accept the trip | driver | about 15 s | order | wait for the sequencer |
| Car on the map | GPS receiver | short | read | merge, deliver live; the view interpolates between samples |
| Message the driver | rider or driver | long | read | merge, deliver later |
| Payment | card network | long | order, over funds | authorization is provisional; capture is the seal |
| Rating | rider | long | independent | compute anywhere |

Groupware research classified collaboration tools by whether people work [at the same or different times, and in the same or different places](https://en.wikipedia.org/wiki/Computer-supported_cooperative_work#CSCW_Matrix). The table above keeps that matrix's shape and replaces both axes with quantities that determine the architecture: place becomes coupling, and time becomes the response deadline compared with the round trip.

## Designs the principles rule out

1. **A sealed result for an order-coupled choice sooner than the round trip to its sequencer.** A sealed result within one 60 Hz frame requires a sequencer within about 1,700 km of fiber. Anything faster is provisional.
2. **A final conclusion about absence over an unsealed scope.** A record still in transit can make the conclusion false.
3. **An unbiased per-person estimate of an effect when read coupling crosses between variants.** Randomizing per person then measures a mixture of direct effects and spillover.
4. **Exact counterfactual replay past an opaque resolver whose view would have changed.**
5. **Hiding the result of an order-coupled choice from the party whose record was refused.** An access rule can make the refusal less specific or send the refusal through another channel, but cannot remove the refusal.
6. **Changing what a past view showed without recording the change.**
7. **Performing an effect exactly once through a system that does not deduplicate by identifier.** After a lost reply, the sender cannot tell whether the request arrived.

## The same structure in five other fields

Several fields reached this structure independently and named its parts differently. The five fields below each have a counterpart for every primitive, and each contributed a result this post uses.

| This theory | Game theory | Reinforcement learning and control | Probabilistic programming | Databases and distributed systems | Causal inference |
| --- | --- | --- | --- | --- | --- |
| record | move in the history | logged transition | entry in an execution trace | log entry | observed outcome |
| function | rules of the game | dynamics, value function | deterministic program code | query, view, state machine | structural equation |
| choice | decision node | decision step | random choice | operation | treatment assignment |
| resolver | player, or Nature for chance | policy, environment | sampler, inference proposal | client, network | assignment mechanism |
| view | information set | observation | distribution and its arguments | snapshot | covariates |
| seal | end of the game | end of an episode | end of an execution | commit, watermark | end of follow-up |
| coupling | strategic interdependence | multi-agent interaction | dependency between random choices | contention | interference |
| goal | payoff | reward | inference objective | objective | estimand |
| release | change of rules | change of environment | program edit | schema version | protocol amendment |

Results proved in one field apply in the others:

- The coordination results behind the sealing principle, from distributed systems, explain why checking an experiment's significance every day produces false positives.
- The budget-split design from ad experiments, described under the coupling principle, uses escrow, a database method, to obtain statistical independence.
- Game theory's *information set*, the set of situations a player cannot tell apart, implies that each record should contain the view shown to its resolver.
- Probabilistic programming [names each random choice by a stable *address*](https://proceedings.mlr.press/v15/wingate11a.html), so that an inference algorithm can change one choice, re-run the program, and reuse every other recorded value at the same address. This procedure is the counterfactual replay described under the goals principle.

Older work reached parts of the structure. [Out of the Tar Pit](https://curtclifton.net/papers/MoseleyMarks06a.pdf) (2006) argued that the only essential state in a system is the input its users supply, and that everything else should be derived. [The Elm Architecture](https://guide.elm-lang.org/architecture/) applies the derivation principle to one person on one device: messages are records, and `update` and `view` are functions. Double-entry bookkeeping has derived balances from a journal for more than five centuries.

## Open problems

1. **Inferring scopes.** A compiler could read functions and invariants and report which choices need a sequencer, over which scope, and where escrow would remove the need. [Indigo](https://www.dpss.inesc-id.pt/~rodrigo/indigo_eurosys15.pdf) and [Hamsaz](https://doi.org/10.1145/3290387) perform this analysis for invariants written in restricted logics.
2. **Estimating coupling.** Read and order coupling can be derived from functions and weighted from the records. No published method says when a runtime may repartition a changing graph without invalidating experiments already running.
3. **Declaring response deadlines.** Products do not record a response deadline per choice. Without one, the prediction principle cannot be applied mechanically.
4. **Specifications for AI agent resolvers.** A choice bound to an agent needs a specification: what the view includes, which options exist, what budget applies, which results a person must confirm, and what must be recorded for replay.
5. **Stand-ins for people.** Counterfactual replay past a person needs a stand-in, and no accepted method validates one.
6. **Sealing methods as mechanism design.** The auction comparison shows that the sealing method changes when agents act. No catalog maps sealing methods to the behavior each one produces.

[Toward a universal runtime for interactive software](/universal-runtime-for-interactive-software) builds the theory as four runtime components: one for records, one for functions, one for choices and their resolvers, and one for seals. [Toward a universal set of languages for interactive software](/universal-languages-for-interactive-software) designs a language whose structure follows the theory, so that a compiler can check the principles.
