---
title: "Toward a universal theory of interactive software"
description: "A model of interactive software with three primitives (records, functions and choices) and seven principles, each following from a constraint every interactive system faces. Undo, offline mode, optimistic updates, A/B tests, sharding, access control, delegation to AI agents and live migration follow from the principles."
date: 2026-10-03T12:00:00-04:00
tags: ["software-engineering", "architecture", "systems-thinking", "ontology", "agents"]
---

A booking site, a shared document, a multiplayer game, a tax questionnaire and a coding agent are all interactive software. Each one runs until it needs a value it cannot compute, such as a person's input, a sensor reading or a payment network's reply, and its next output depends on the value that arrives.

Teams build these products with different architectures:

- forms use request handlers and a database;
- shared editors use merge algorithms;
- games use an authoritative server and client-side prediction;
- long processes run on workflow engines;
- A/B tests run on experimentation platforms;
- AI agents run on agent frameworks.

Each architecture has its own vocabulary, and several problems are solved in each under different names. Offline editing in a document, rollback in a fighting game and a pending transaction in a banking app are one mechanism. Sharding a database and choosing units for an A/B test read the same graph.

This post describes a model small enough to cover all of these. It has three primitives, called *records*, *functions* and *choices*, and seven principles. Each principle follows from a constraint that every interactive system faces, such as the time information takes to travel, or programs changing while people are using them. Features usually built as separate products follow from the principles: undo, offline mode, optimistic updates, A/B tests, sharding, access control, delegation to AI agents and live migration.

Two later posts build on the model. [Toward a universal runtime for interactive software](/universal-runtime-for-interactive-software) describes a runtime that executes it, and [Toward a universal set of languages for interactive software](/universal-languages-for-interactive-software) describes a language for writing programs in it.

## Three primitives: records, functions and choices

A running program alternates between computing and waiting. Computing is deterministic: the same inputs give the same outputs. Waiting happens where the program needs a value that its code does not determine. The model names both activities and the trace they leave.

- A **choice** is a point where a run needs a value, and the program specifies what the value must satisfy without specifying how it is produced. Each choice has a stable identifier, a *view* (what is visible to whatever selects the value), a set of *options* (the admissible values), and a *timeout* with a *default*. A choice is *open* until a value is selected.
- A **resolver** selects the value. It can be a person, an AI model, a random number generator, a deterministic function, a sensor or another organization's system. A *binding* states which resolver selects the value for which choice.
- A **record** stores one selected value with its provenance: the choice, the resolver, what the resolver could see, the program version and the time. Records are never modified. The set of all records is the **history**.
- A **function** is a deterministic map from the history to a value, in the mathematical sense of the word: the same history always gives the same result. Everything other than records is the output of a function, including current state, screens, search indexes, metrics, access rules and the set of open choices.

*Choice* names the open question and *record* names the answer. The word "decision" is avoided because it is used for both. *Resolver* names a role and implies no deliberation: a thermometer resolves the choice "current temperature", and a random number generator resolves the choice "which variant this visitor sees".

![A loop from the history through functions to views and open choices, then to resolvers, whose selections are appended to the history as records](../../assets/diagrams/interaction-loop.svg "Functions compute views and open choices from the history. A resolver selects a value for each choice, and the value is appended as a record.")

A record is a claim made from one perspective. It states what a resolver selected or observed from where it stood, and a person can mistype an address as easily as a sensor can drift. The system treats records as given, because it has nothing else to go on, and corrects one by appending a later record that supersedes it.

The model has no primitive for state. State is a function of the history, so it can always be recomputed, and two parties that hold the same records compute the same state.

### Resolvers ordered by determinacy

Resolvers differ along one axis, determinacy, which sets what the history can do with their selections.

| Determinacy | Examples | Repeating the choice | Probability of the selected value |
| --- | --- | --- | --- |
| Deterministic | a pricing function, game physics, a routing table | gives the same value | 1 |
| Randomized | A/B assignment, a bandit algorithm, a seeded shuffle | gives the same value with the same seed | known, and recorded |
| Opaque | a person, an AI model, a payment network, a sensor | may give a different value | unknown |

Opaque resolvers sit outside the *system boundary*, the line between what the program determines and what it receives from its environment. Where that line runs is a modeling decision, and engineering moves resolvers across it:

- automation replaces an opaque resolver with a deterministic one;
- a test suite replaces every opaque resolver with scripted or recorded values, so that runs can be reproduced;
- delegation to an AI agent replaces one opaque resolver with another.

An AI model sampled at temperature zero is deterministic in principle. In practice batching, hardware differences and model retirement make its outputs hard to reproduce, so the model treats it as opaque.

Some opaque resolvers pursue goals of their own: people, AI agents and other organizations. These *agents* adapt to the program, so the program's design changes what they select. Principle 3 includes an example from online auctions. A sensor does not adapt to the program in this way.

![Resolvers arranged by determinacy, from deterministic functions through randomized assignment to people, models and external systems, with the system boundary between randomized and opaque resolvers](../../assets/diagrams/resolvers.svg "Determinacy determines whether a selection can be repeated and whether its probability is known.")

### The model in formal terms

A choice $c$ is a tuple

$$
c = \left(\mathit{id}_c,\ \mathrm{view}_c,\ \mathrm{opt}_c,\ t_c,\ d_c\right)
$$

where:

- $\mathcal{H}$ is the set of possible histories, each a set of records;
- $\mathrm{view}_c : \mathcal{H} \to V_c$ maps a history to what the resolver sees, a value of type $V_c$;
- $\mathrm{opt}_c : \mathcal{H} \to \mathcal{P}(X_c)$ maps a history to the admissible values, a subset of the value type $X_c$ ($\mathcal{P}$ is the power set);
- $t_c$ is the timeout, and $d_c \in X_c$ is the default recorded when the timeout passes.

A binding $\beta$ maps each choice to a resolver. Functions are maps $f : \mathcal{H} \to Y$ for some output type $Y$.

In programming-language terms, a choice is an [algebraic effect](https://arxiv.org/abs/1312.1399): an operation a program performs, whose result is supplied by a *handler* defined outside the code that performed it. A resolver is a handler. [Interaction trees](https://arxiv.org/abs/1906.00046) give whole programs a semantics in these terms. A program denotes a possibly infinite tree whose nodes are requests to the environment and whose branches are the possible responses. A run is a path through the tree, and the history lists the responses along the path. Replaying a run means supplying recorded responses in place of live ones, and testing means supplying scripted ones.

### The same structure in other fields

Several fields reached this structure independently and named its parts differently:

| This model | Game theory | Control and reinforcement learning | Databases and distributed systems | Experiment design |
| --- | --- | --- | --- | --- |
| record | move in the history | logged transition | log entry | recorded assignment or outcome |
| function | rules of the game | dynamics, value function | query, view, state machine | estimator |
| choice | decision node | decision step | operation | treatment assignment |
| resolver | player, or Nature for chance | policy, environment | client, network | assignment mechanism |
| view | information set | observation | snapshot | covariates |
| seal | end of the game | end of an episode | commit, watermark | analysis cutoff |
| coupling | strategic interdependence | multi-agent interaction | contention | interference |
| goal | payoff | reward | objective | estimand |
| release | change of rules | change of environment | schema version | protocol amendment |

Results proved in one column apply in the others. The coordination results in principle 3 explain why checking an experiment's significance every day produces false positives. A technique from ad experiments in principle 5 shows that reserving capacity, a database method, can also buy statistical independence. The *information set* of an extensive-form game, the set of situations a player cannot tell apart, implies that what a resolver could see belongs in the record.

[Out of the Tar Pit](https://curtclifton.net/papers/MoseleyMarks06a.pdf) (2006) argued that the only essential state in a system is the input its users supply, and that everything else should be derived. [The Elm Architecture](https://guide.elm-lang.org/architecture/) applies the model to one person on one device: messages are records, and `update` and `view` are functions. Double-entry bookkeeping has derived balances from a journal for more than five centuries.

## Seven principles

Each principle starts from a constraint that holds for every interactive system and states what the constraint requires.

| | Principle | Constraint it follows from |
| --- | --- | --- |
| 1 | Records and derived values | Functions are deterministic. |
| 2 | Binding | Different resolvers can resolve the same choice. |
| 3 | Sealing | Records reach different places at different times. |
| 4 | Prediction | A response can be needed sooner than records can travel. |
| 5 | Coupling | Functions read records from more than one resolver. |
| 6 | Goals | Systems are built to change something. |
| 7 | Versions | The program changes while its history persists. |

## 1. Records and derived values

**Store every selected value as a record, and compute everything else.**

Functions are deterministic, so the only new information that enters a system is the values selected at choices. The history therefore determines every other value. A table's current row, a cache, a search index and a dashboard are outputs of functions and can be recomputed. A store that disagrees with the history is wrong.

A chess game shows how far this goes. The game is its list of moves, every position is computed from that list, and statistics about an opening across millions of games are functions over millions of lists. Real-time strategy games have shipped the same design since the 1990s. The network protocol of [Age of Empires](https://www.gamedeveloper.com/programming/1500-archers-on-a-28-8-network-programming-in-age-of-empires-and-beyond) sent only player commands, and every machine ran an identical deterministic simulation. Replay files in such games are lists of commands.

Several features follow without further design:

- **The data schema is the list of choices.** Any question an analyst can ask about a product is a function over its records, so an analytics tracking plan can be generated from the program.
- **History, audit and debugging by replay** read the history. Undo appends a record that reverses an earlier one.
- **Caches and indexes** are stored outputs of functions. Keeping them current is incremental computation.
- **Sync** sends records, and **offline work** collects records locally until they can be sent.
- **Corrections** are new records, as reversing entries are in a ledger.

The definition of a choice sets what is recorded. A drag sampled at 120 Hz can be one choice whose value is the endpoint, or a stream of samples. A selection made by a deterministic resolver could be recomputed, but recording it costs little and keeps the history meaningful after the binding changes.

Erasure is the hard case, because a request to delete a person's data meets a history that never changes. Two methods are in use:

- encrypt each person's records under a key of their own, and destroy the key on request;
- add an access rule (principle 5) that removes the person's records from every view.

## 2. Binding

**Specify each choice independently of its resolver, and set the resolver by configuration.**

The lead story on a news site's front page was once chosen by an editor. Today the same choice can be resolved by:

- a 50/50 assignment between two headlines;
- a bandit algorithm that shifts traffic toward the headline with more clicks;
- a model that selects per reader;
- an AI agent that writes a new headline.

The view, the options and the timeout stay the same, and only the resolver changes. If each choice has one specification and its resolver is bound separately, several features become one construct:

| Resolver bound to the choice | Usual name |
| --- | --- |
| A fixed function | conditional, feature flag |
| Uniform or balanced randomization | A/B test |
| A randomized policy that learns toward a goal | bandit |
| A function of the view learned from data | personalization, recommendation |
| An AI model | classification, routing |
| An AI agent | delegation |
| A person | the user interface |

Changing a binding accounts for more:

- **Automation** moves a choice from a person to a function.
- **Escalation** moves it back to a person.
- **Delegation** moves it from a person to an AI agent, under limits the person sets.
- **Testing** binds scripted resolvers, randomized resolvers that search for failures, and models playing personas.
- **Regression testing** binds recorded selections and runs them against a new program version.
- **Presentation** depends on the resolver. The same choice can be drawn on a screen, read aloud by a voice interface or given to an AI agent as a typed schema. An API for agents is the set of a product's choices with the rendering removed.

The choice that most shapes a product is which step comes next. When a deterministic function resolves it, the product is an interview, such as a tax questionnaire or a checkout. When a person resolves it, the product is a workspace, such as a spreadsheet. When an AI agent resolves it, the product is a delegated task, such as a coding agent working through a repository. [Mixed-initiative interfaces](https://erichorvitz.com/chi99horvitz.pdf) pass this choice back and forth within one session.

Two quantities set how much an agent can do. *Discretion* is the size of a choice's option set: "select one of three refund amounts" is narrow, and "reply to the customer" is wide. Splitting a wide choice into narrow ones lowers discretion and makes each part checkable, so the depth of decomposition sets an agent's autonomy. [Levels of automation](https://doi.org/10.1109/3468.844354) can be set separately for gathering information, analyzing it, selecting an action and carrying it out, which amounts to a binding per stage. Authority belongs to the binding, not to the resolver's capability, a point developed in [Old Foundations, New Agents](/durable-universals-agentic-ai-engineering).

Cybernetics sets a limit on deterministic bindings. The [law of requisite variety](https://en.wikipedia.org/wiki/Variety_(cybernetics)#Law_of_requisite_variety) says that a regulator keeps outcomes within bounds only if it can produce as many distinct responses as there are distinct disturbances to counter. A deterministic resolver produces only the responses its author anticipated. A choice whose views vary in ways nobody enumerated in advance therefore needs a person or a model.

Determinacy also sets what the history can hold. A randomized resolver records the probability it gave the selected value, called its *propensity* in causal inference. A person's propensities are unknown, and a person cannot be asked the same question again with nothing else changed. Principle 6 depends on this difference.

## 3. Sealing

**A function that only accumulates is correct on any snapshot. A conclusion that depends on records being absent is final only after its scope is sealed.**

Records reach different places at different times, so different parties see different subsets of the history. Call the subset visible to a resolver at a moment its *snapshot*. Some functions give useful answers on any snapshot. "These people have voted" and "this document contains these edits" only grow as records arrive, and every party reaches the same answer once the records have spread, whatever order they arrived in. Such a function is *monotone*:

$$
H \subseteq H' \implies f(H) \sqsubseteq f(H')
$$

Here $H$ and $H'$ are histories, $f$ is a function, and $\sqsubseteq$ is the order on $f$'s outputs, such as inclusion for sets. In words: adding records can only add to the output.

Other functions conclude something from the absence of records:

- "the seat is free";
- "the latest price is 40";
- "this username is available";
- "candidate A won".

Each states that some record does not exist, and one late record can make it false. Such a conclusion is final only over a *sealed* scope:

- A **scope** is a set of records picked out by a condition, such as every booking for seat C14 at tonight's performance.
- A **seal** is a record stating that a scope is complete up to some position: no further record will be admitted into it before that position.
- The **sequencer** of a scope admits records into the scope in one order and writes its seals. Each scope that needs seals has exactly one sequencer at a time. Admitting a record seals the part of the scope that precedes it, which is how a sequencer settles which of two concurrent bookings came first.

The [CALM theorem](https://arxiv.org/abs/1901.01930) makes this exact. A problem has a consistent distributed implementation that needs no coordination if and only if it is monotone, so coordination is needed exactly where a conclusion about absence is drawn. Even "the current value" is such a conclusion, and last-writer-wins replication lets timestamps act as the sequencer.

![Records arriving over time, a running count that is correct at every moment, and a winner that is final only after the seal](../../assets/diagrams/sealing-timeline.svg "A monotone function is correct at every moment. A conclusion about absence is final only after the seal.")

Seals appear at every scale under other names:

| Seal | Scope | Sequencer |
| --- | --- | --- |
| Pressing submit | one person's answers on a form | that person's device |
| A hold's timeout | one held seat | the booking system |
| A transaction commit | the rows the transaction read and wrote | the database |
| An entry reaching consensus | one position in a replicated log | a quorum of replicas |
| A watermark in a stream processor | all events before a timestamp | the stream processor |
| An analysis cutoff | the data for one experiment | the experimenter |
| Closing the books | one accounting period | the accounting department |
| Polls closing | one election's ballots | the election authority |

How a scope is sealed changes what agents select. A [study of online auctions](https://www.cs.princeton.edu/courses/archive/spr08/cos444/papers/roth_ockenfels02.pdf) compared eBay, whose auctions ended at a fixed time, with Amazon, whose auctions continued until ten minutes passed without a bid. Bidding in the final seconds was far more common on eBay. With experience, eBay bidders bid later and Amazon bidders bid earlier. The sealing rule worked as a mechanism in the game-theoretic sense: it set the incentives, and bidders adapted to it.

Two methods avoid waiting for a sequencer:

- **Use choices whose records always merge.** Operations are [invariant-confluent](https://arxiv.org/abs/1402.2237) when any two valid histories merge into a valid history. Likes on a post are invariant-confluent, and seats in a theater are not.
- **Split the scope.** The escrow method divides a shared quantity into shares, and each share has its own sequencer. A box office holding a block of seats can sell them without contacting the central system, and a warehouse can promise its own stock.

Offline work follows from both: a disconnected device can admit any record that is invariant-confluent or that falls in a share escrowed to the device.

The same structure explains a common statistical error. A fixed-horizon significance test is valid only at its declared cutoff, which is a seal. Checking the result every day and stopping once it looks significant draws a conclusion before the seal, and false positives multiply. [Always-valid inference](https://arxiv.org/abs/1512.04922) makes the conclusion valid whenever the experimenter stops.

## 4. Prediction

**When a response is needed sooner than the seal can arrive, show provisional values and replace them when the seal arrives.**

Each choice involves two durations:

- The **response deadline** is the longest a resolver can wait, after selecting a value, to see its consequence before the interaction fails.
- The **sealing latency** is the time from the selection until the sequencer's admission reaches the resolver. It is at least the round trip to the sequencer.

Human perception and physics set both. Responses within about 0.1 s [feel immediate](https://doi.org/10.1145/1476589.1476628). Animation at 60 Hz needs a new frame every 16.7 ms. For telephone calls, ITU-T Recommendation G.114 recommends at most 150 ms of one-way delay. On the other side, light in optical fiber travels about 200,000 km/s, so each 100 km of fiber adds about 1 ms to a round trip before any routing or processing. A sealed result within one 60 Hz frame needs the sequencer within about 1,700 km of fiber, and a round trip between London and Sydney takes at least 170 ms.

When the response deadline is shorter than the sealing latency, the view has to show records the sequencer has not yet admitted. Functions evaluated over them give **provisional values**, which are replaced when the seal arrives. Several familiar features are this one mechanism:

- optimistic updates in a web app;
- characters appearing as they are typed into a shared document;
- a shooter's client moving the player before the server confirms the move;
- rollback netcode in fighting games;
- the pending line in a banking app after a card payment.

The card payment shows the mechanism plainly. The authorization is a provisional record, labeled pending, and settlement days later is the seal that posts it.

![A log-log plot of sealing latency against response deadline, with a diagonal separating choices that can wait for the seal from choices that need provisional values](../../assets/diagrams/deadline-distance.svg "Below the diagonal, the response deadline is shorter than the sealing latency, so the view shows provisional values.")

For invariant-confluent choices, the local result is already final, and only other parties' view of it waits. For other choices the provisional value can be wrong. The cost of prediction grows with how often it is wrong, because every wrong provisional value becomes a correction someone sees.

Designers have three levers:

1. **Move the sequencer closer.** Trading firms place their servers in the exchange's data center, and a drawing app makes the device the sequencer for its own strokes.
2. **Lengthen the response deadline.** Age of Empires scheduled each command to run two 200 ms communication turns after it was issued. Turn-based games make the deadline a whole turn. [EVE Online](https://www.eveonline.com/news/view/introducing-time-dilation-tidi) slows its simulation to as little as 10% of normal speed during large battles.
3. **Make the choice invariant-confluent,** so that it needs no seal (principle 3).

[Optimistic simulation with rollback](https://doi.org/10.1145/3916.3988) is the general form of prediction. Each part of a simulation runs ahead on the records it has, and when a record arrives with an earlier timestamp, that part rolls back and recomputes.

## 5. Coupling

**Which choices affect each other follows from the functions. One analysis of that structure sets sync, sequencer scopes, experiment units and access.**

Functions combine records from different resolvers, so the selection at one choice can change what another resolver sees or may select. Two relations capture this. In the definitions below, $a$ and $b$ are choices, $r_a$ and $r_b$ are records produced by resolving them, $H$ is a history, $\mathrm{view}_b$ and $\mathrm{opt}_b$ are the view and option functions of $b$, and $I : \mathcal{H} \to \{\text{true}, \text{false}\}$ is an *invariant*, a condition every admitted history must satisfy.

**Read coupling** $a \to b$ holds when a record from $a$ can change what $b$'s resolver sees or may select:

$$
\exists H :\ \mathrm{view}_b(H \cup \{r_a\}) \neq \mathrm{view}_b(H)\ \ \lor\ \ \mathrm{opt}_b(H \cup \{r_a\}) \neq \mathrm{opt}_b(H)
$$

**Order coupling** $a \leftrightarrow b$ holds when records from $a$ and $b$ can each be admitted alone, but not together:

$$
\exists H, r_a, r_b :\ I(H \cup \{r_a\}) \land I(H \cup \{r_b\}) \land \lnot I(H \cup \{r_a, r_b\})
$$

Order-coupled choices need a sequencer to put one record first and refuse the other. Because merging two histories means taking their union, order coupling is exactly the failure of invariant confluence for a pair of records. Every order coupling is also a read coupling, since the first record changes the options of the second.

Two people booking the same seat are order-coupled. Two people commenting on the same post are read-coupled. Two people typing into the same paragraph of a shared document are read-coupled when a merge algorithm combines their edits, because every combination of concurrent edits merges into a valid document.

![A graph of choices joined by read coupling and order coupling, divided into three parts, with the edges that cross parts marked](../../assets/diagrams/coupling-graph.svg "One partition of the coupling graph sets what syncs live, where sequencers sit and which units share an experiment variant.")

Most of what a product does about other people uses one of the two relations:

| Feature | Relation | Use |
| --- | --- | --- |
| Subscriptions, interest management in games | read | deliver records along edges |
| Presence, live cursors | read | deliver along edges with short response deadlines |
| Notifications | read | deliver along edges with long response deadlines |
| Access rules, privacy settings, blocking | read | remove edges; the [lattice model of information flow](https://doi.org/10.1145/360051.360056) is the general form |
| Sharding | order | partition so each part has one sequencer; edges that cross parts need distributed transactions |
| Experiment units | read | partition so each part receives one variant; edges that cross parts carry treatment between variants |

The last row is where statistics and systems engineering meet. Causal inference's *stable unit treatment value assumption* (SUTVA) requires that one unit's outcome not depend on another unit's treatment, which means no read coupling crosses between variants. Software rarely has this property by default, so it has to be engineered. Three methods are in use:

- **Partition the graph.** [Graph cluster randomization](https://arxiv.org/abs/1305.6979) assigns variants to clusters of a social graph. The same year, [balanced label propagation](https://web.stanford.edu/~jugander/papers/wsdm13-blp.pdf) partitioned that graph across servers, so experiment units and shards were computed from one graph.
- **Randomize over time.** When coupling runs through a shared pool, as when every rider in a city draws on the same drivers, the graph has no useful clusters. [Switchback designs](https://arxiv.org/abs/2009.00148) randomize time periods instead.
- **Change the functions to remove edges.** A [budget-split design](https://arxiv.org/abs/2012.08724) for ad experiments gives each variant its own share of every advertiser's budget, so the variants cannot draw on the same money. This is escrow from principle 3, used to obtain statistical independence instead of coordination-free writes.

Access rules can remove read coupling but not order coupling. If two people try to register the same email address, the second learns that the first exists, whatever the access rules say, because the refusal itself carries the information. A sign-up form that reports "this email is already registered" therefore lets anyone test whether a person has an account. The standard fix moves the outcome to a channel only the address's owner can read: "If an account exists, we have sent a link."

Economics sorts goods into *rival* goods, whose use by one party prevents use by another, and *non-rival* goods, such as information, whose use by one party does not. In this model rivalry corresponds to order coupling. Non-rivalry corresponds to read coupling, which is still coupling: an idea one person shares changes what others know and select. The terms carry an assumption the structure does not. They make separation the default, describe contact between parties as competition, and describe the most widely shared goods as if their users had no effect on each other. In the coupling graph, both kinds of good are edges. Whether an edge helps or harms the parties it joins depends on their goals (principle 6), and the same edge can do both.

## 6. Goals

**A goal is a function of the history with a direction and guardrails. Analytics, experiments and optimization are uses of goals.**

Formally, a goal is a function $g : \mathcal{H} \to \mathbb{R}$ to be increased or decreased, together with guardrails $c_i(H) \le k_i$: functions $c_i$ that must stay within bounds $k_i$ while the goal is pursued. Conversion rate is a goal, and refund rate, latency and complaint rate are typical guardrails.

Several practices are uses of goals:

- **Analytics** evaluates goals and their inputs over the history. A dashboard displays goal values.
- **Attribution** follows provenance from a goal's value back to the records that produced it.
- **An experiment** combines four parts from earlier principles: a randomized resolver with recorded probabilities, a goal, units taken from a partition of the read-coupling graph, and a seal for analysis.
- **Bandit algorithms and personalization models** are resolvers that read a goal while they run.
- **Pre-registration** records the goal and the analysis plan before any outcome exists. Medical journals have required registration of clinical trials before enrollment since 2004.

Recorded probabilities make it possible to evaluate a binding that was never deployed. The standard estimator, inverse propensity scoring, is

$$
\hat{G}(\pi') = \frac{1}{n} \sum_{i=1}^{n} \frac{\pi'(x_i \mid v_i)}{p_i}\, g_i
$$

where:

- $n$ is the number of recorded selections at a choice;
- $v_i$ is the view at the $i$-th selection, and $x_i$ is the value selected;
- $p_i$ is the recorded probability that the deployed resolver gave $x_i$;
- $\pi'(x_i \mid v_i)$ is the probability that a candidate resolver $\pi'$ would give $x_i$ in view $v_i$;
- $g_i$ is the goal's value attributed to the $i$-th selection.

In words: reweight each recorded outcome by how much more or less often the candidate would have made the same selection. The estimate needs $p_i > 0$ for every value the candidate might select, which is why the records of a deterministic resolver, with probability 1 on one value and 0 on the rest, cannot evaluate alternatives. [Offline evaluation of news recommendation](https://arxiv.org/abs/1003.5956) applied this to a log of randomly selected articles, and [a decision service built on the method](https://arxiv.org/abs/1606.03966) records each probability at the moment of selection.

Counterfactual replay generalizes the estimator. Hold the functions fixed, change one record, and recompute everything after it. The result is exact until the first later opaque resolver whose view would have changed. A pinned model can be asked again, but a person cannot, so beyond that point the replay needs a model of the person.

A goal without guardrails invites a capable resolver to find the gap between the function and what it was meant to measure. Experimentation practice handles this with guardrail metrics, and in this model the same goal and guardrails can steer a bandit, a person's dashboard or an AI agent.

## 7. Versions

**Record which program version produced each record, and record each release. A migration is correct when it gives the same state as recomputing under the new version.**

Programs change while choices are open. Some people still run last year's version of an app, an insurance claim may be halfway through a review that takes weeks, and an AI agent may be partway through a task. If every record carries the version it was made under, each record can be read under the functions in force when it was made. Tax law treats transactions the same way: a sale is taxed under the law in force at the time of the sale, and retroactive change is exceptional and explicit.

- **A release is a record.** Choices opened after it use the new version.
- **Migrations change how records are read.** Old records stay as they are, and translation between versions is a function.
- **Open choices move by stable identifier.** A form can be edited while thousands of people are partway through it, as long as every open choice maps to a choice in the new version or to a recorded fallback.
- **Changing an AI agent's model is a release,** because it changes what the agent would select.

Rewriting stored state, as a database migration or a codemod does, is an optimization of the same idea, and its correctness condition is exact. Let $\mathrm{state}_v : \mathcal{H} \to S_v$ compute state of type $S_v$ from a history under version $v$, and let $\mu : S_v \to S_{v'}$ migrate stored state from version $v$ to version $v'$. The migration is correct when

$$
\mu\big(\mathrm{state}_v(H)\big) = \mathrm{state}_{v'}(H) \quad \text{for every history } H
$$

In words: migrating the old state gives the same result as recomputing the state from the history under the new version, which reads old records through translation functions. A diagram of this kind is called a *commuting square*, because both paths around the square arrive at the same value. Where replicas merge state with an operation $\sqcup$, the migration must also preserve merges: $\mu(s_1 \sqcup s_2) = \mu(s_1) \sqcup \mu(s_2)$.

The history holds real past runs, so the condition can be tested by replaying them along both paths. A finite library of migration operators, each with a known inverse or complement, satisfies the condition by construction. Three such libraries exist: [schema modification operators](https://doi.org/10.14778/1453856.1453939), [bidirectional lenses](https://doi.org/10.1145/1232420.1232424) and [functorial data migration](https://arxiv.org/abs/1009.1166).

One requirement has no exception. If a release changes what an earlier view showed, after someone selected a value based on that view, the change must itself be recorded, as a restatement is in accounting. Otherwise the selection loses the context that gave it meaning.

## Consequences of the principles

Principles: 1 records and derived values; 2 binding; 3 sealing; 4 prediction; 5 coupling; 6 goals; 7 versions.

| Feature | Principles | Construction in the model |
| --- | --- | --- |
| History, audit, undo | 1 | functions over the history; undo appends a reversing record |
| Caches, indexes, search | 1 | stored outputs of functions |
| Analytics, funnels, attribution | 1, 6 | goals and provenance over the history |
| Feature flags, A/B tests, staged rollouts | 2, 5, 6 | a randomized resolver with recorded probabilities, units from a coupling partition, a goal |
| Personalization, recommendation | 2, 6 | a learned resolver that reads a goal |
| Automation, escalation, delegation | 2, 5 | changing a binding, within access rules on bindings |
| Simulated users, regression replay | 1, 2 | scripted or recorded resolvers |
| Voice interfaces, accessibility, agent APIs | 2 | one choice presented differently per resolver |
| Durable workflows, reminders | 1, 2 | open choices are functions of the history; timeouts record defaults |
| Submit buttons, turns, commits | 3 | seals |
| Inventory, quotas, rate limits | 3 | escrow: a scope split into shares, each with a sequencer |
| Offline mode | 3 | admitting invariant-confluent or escrowed records on the device |
| Optimistic UI, client prediction, rollback | 4 | provisional values |
| Presence, live cursors, notifications | 4, 5 | read coupling, delivered by response deadline |
| Access control, privacy, blocking | 5 | removed read-coupling edges |
| Sharding | 5 | a partition of the order-coupling graph |
| Experiments with interference | 5, 6 | a partition of the read-coupling graph, or functions that remove edges |
| Off-policy evaluation, counterfactuals | 1, 2, 6 | recorded probabilities and replay |
| Live updates, schema migration, old clients | 7 | versioned records and translation functions |

## Classes of choices by coupling and response deadline

Two quantities from principles 3 to 5 determine what a runtime must do for a choice:

- its coupling: independent, read-coupled or order-coupled;
- its response deadline: long (a second or more, enough for a network round trip) or short (below about 100 ms, shorter than many round trips).

| | Independent | Read-coupled | Order-coupled |
| --- | --- | --- | --- |
| **Long deadline** | compute anywhere; the device is the sequencer | merge, deliver later | wait for the sequencer |
| **Short deadline** | compute on the device | merge, deliver live | show provisional values, reconcile with the sequencer |

The runtime's work grows from the top-left class to the bottom-right one. The resolver varies within every class.

![Six classes of choices by coupling and response deadline, each with the runtime behavior it needs and example choices marked by resolver](../../assets/diagrams/choice-classes.svg "Coupling and response deadline determine what the runtime does. The resolver varies within every class.")

The usual taxonomy of forms, editors and games hides two of the classes. Comment threads, wikis and email are read-coupled with long deadlines. Bookings, username registration and bank transfers are order-coupled with long deadlines: they wait for a sequencer and do not predict.

Products combine classes, so the classes describe choices, not products. A ride-hailing trip uses five of the six:

| Choice | Resolver | Response deadline | Coupling | Runtime behavior |
| --- | --- | --- | --- | --- |
| Destination | rider | long | independent | compute anywhere |
| Price quote | pricing function pursuing market balance | long | read, through shared supply | merge, deliver later; experiments need switchbacks |
| Rider–driver match | dispatch function | seconds | order, over drivers | wait for a sequencer per zone |
| Accept the trip | driver | about 15 s | order | wait for the sequencer |
| Car on the map | GPS receiver | short | read | merge, deliver live; the view interpolates between samples |
| Message the driver | rider or driver | long | read | merge, deliver later |
| Payment | card network | long | order, over funds | authorization is provisional; capture is the seal |
| Rating | rider | long | independent | compute anywhere |

Groupware research classified collaboration tools by whether people work [at the same or different times, and in the same or different places](https://en.wikipedia.org/wiki/Computer-supported_cooperative_work#CSCW_Matrix). The table above keeps that matrix's shape and replaces both axes with quantities that determine the architecture: place becomes coupling, and time becomes the response deadline compared with the round trip.

## Designs the principles rule out

1. **A sealed result for an order-coupled choice sooner than the round trip to its sequencer.** A sealed result within one 60 Hz frame requires a sequencer within about 1,700 km of fiber. Anything faster is provisional.
2. **A conclusion about absence without coordination.** This is the CALM theorem.
3. **An unbiased per-person estimate of an effect when read coupling crosses between variants.** Randomizing per person then measures a mixture of direct effects and spillover.
4. **Exact counterfactual replay past an opaque resolver whose view would have changed.**
5. **Hiding the result of an order-coupled choice from the party whose record was refused.** An access rule can make the refusal less specific or send it through another channel, but cannot remove it.
6. **Changing what a past view showed without recording the change.**

## Open problems

1. **Inferring scopes.** A compiler could read functions and invariants and report which choices need a sequencer, over which scope, and where escrow would remove the need. [Indigo](https://www.dpss.inesc-id.pt/~rodrigo/indigo_eurosys15.pdf) and [Hamsaz](https://doi.org/10.1145/3290387) do this for invariants written in restricted logics.
2. **Estimating coupling.** Read and order coupling can be derived from functions and weighted from the history. No published method says when a runtime may repartition a changing graph without invalidating experiments already running.
3. **Declaring response deadlines.** Products do not record a response deadline per choice. Without one, principle 4 cannot be applied mechanically.
4. **Specifications for AI agent resolvers.** A choice bound to an agent needs a specification: what the view includes, which options exist, what budget applies, which results a person must confirm, and what must be recorded for replay.
5. **Models of people.** Counterfactual replay past a person needs a stand-in, and no accepted method validates one.
6. **Sealing rules as mechanism design.** The auction comparison shows that sealing rules change what agents select. No catalog maps sealing rules to the behavior each one produces.

[Toward a universal runtime for interactive software](/universal-runtime-for-interactive-software) builds the model as four runtime components, one each for records, functions, choices and seals. [Toward a universal set of languages for interactive software](/universal-languages-for-interactive-software) designs a language whose structure follows the model, so that a compiler can check the principles.
