---
title: "Toward a universal theory of interactive software"
description: "Interactive software records decisions and derives everything else. Seven principles follow from that kernel, and experiments, sync, permissions, agents, analytics and live migration fall out of them."
date: 2026-10-03T12:00:00-04:00
tags: ["software-engineering", "architecture", "systems-thinking", "ontology", "agents"]
---

A typical product runs a separate system for each kind of interaction it contains. Forms post to request handlers. Shared editors sync through a merge library. Live features run on a game server. Beside these sit a feature-flag service, an experimentation platform, an analytics pipeline and a permissions engine. Each keeps its own state, and each academic field that studies one of them (distributed systems, experiment design, interface design, game networking) has named the same few structures differently.

This post derives those structures from one kernel and seven principles. The kernel says that interactive software records decisions and derives everything else. Each principle adds one fact about the world:

1. rules are deterministic;
2. different parties can make the same decision;
3. information takes time to travel;
4. people need answers sooner than distance allows;
5. rules connect parties;
6. someone wants something;
7. the program itself changes.

Experiments, offline mode, optimistic updates, sharding, permissions, analytics, agent delegation and live migration are usually built as separate products. Here they follow as consequences of the principles.

## The kernel

Interactive software asks parties it does not control to make decisions, and derives from the decisions already made what each party sees and which decisions come next. Three parts are enough to say this:

- A **fact** records one decision: which decision it was, what was chosen, who chose, what they were looking at, and under which version of the program. Facts are never edited. A correction is a new fact.
- A **rule** is a deterministic function from facts to further facts. Current state, the screen, permissions, search indexes, metrics and the list of open decisions are all rules.
- A **decision** is opened by a rule. It has a view, a set of options and a deadline, and it is bound to a *chooser*. When the chooser picks, the decision becomes a fact.

![A loop from facts to rules to open decisions to choosers and back to facts](../../assets/diagrams/decision-loop.svg "Rules derive views and open decisions from facts; a chooser fills each decision, and the result becomes a fact.")

There are four kinds of chooser: people, programs, agents and the world. The world covers the clock, sensors, payment networks and every other system the program does not control, so a timer firing and a card being declined are decisions made by the world. Because rules are deterministic, everything new enters through a decision. Randomness counts too: it is a decision by a program that flips a coin.

Two kinds of decision recur often enough to name. A *closure* decides that a set of facts is complete: a person pressing submit, a turn ending, a deadline passing, a database committing, polls closing. Its chooser is a *closer*. A *program change* decides that the rules themselves change.

Each field that needed this kernel arrived at it on its own:

- **Game theory.** An extensive-form game (Harold Kuhn, 1953) has a history of moves, a player function that says who moves next, information sets that say what each player can see, and Nature as a player who moves by chance.
- **Software design.** Ben Moseley and Peter Marks's [*Out of the Tar Pit*](https://curtclifton.net/papers/MoseleyMarks06a.pdf) (2006) argued that the only essential state in a system is the input its users supply, and that everything else should be derived. The Elm architecture folds messages into a model and derives the view from it, which is the kernel for one person on one device.
- **Distributed systems.** Dedalus (Alvaro et al., 2011) writes distributed programs as Datalog with time, and treats nondeterministic message delivery as a choice made by the network.
- **Accounting.** Double-entry bookkeeping has derived balances from a journal of entries for more than five centuries.

## 1. Record decisions; derive everything else

If rules are deterministic, the record of decisions fixes everything else, so it is the only state that must be kept. Every other store is a rule's output and can be recomputed. That includes the current row in a table, a cache, a search index and a dashboard's numbers. Any of them that disagrees with the record is wrong.

A chess game shows how far this goes. The game is its list of moves. Every position is derived from that list, and the statistics of an opening across millions of games are rules over millions of lists. Real-time strategy games have shipped the same design since the 1990s. Mark Terrano and Paul Bettner's [account of Age of Empires](https://www.gamedeveloper.com/programming/1500-archers-on-a-28-8-network-programming-in-age-of-empires-and-beyond) (2001) describes a network protocol that sent only player commands, with every machine running an identical deterministic simulation. Replay files in such games are command logs.

Several features follow without further design:

- **The data schema is the decision schema.** Anything an analyst can ever ask about a product is a rule over its decisions. A tracking plan is a list of decisions, so it can be generated from the program.
- **History, audit and debugging by replay** read the record. Undo is a new decision that inverts an earlier one.
- **Caches and indexes** are rules whose results have been materialized. Invalidating them means keeping those results up to date incrementally.
- **Sync** means shipping facts, and **working offline** means collecting facts locally.
- **Corrections** are new facts, as reversing entries are in a ledger.

The record needs only the decisions that some rule reads. A drag sampled at 120 Hz can be stored as its endpoint or as a thinned path. Thinning the path is itself a decision, made by a program and recorded as one.

Erasure is the hard case: a request to delete a person's data collides with a record that never changes. Two answers are in use:

- encrypt each person's facts under their own key, and destroy the key on request;
- add a policy (principle 5) that removes the person's facts from every view.

## 2. Separate each decision from its chooser

The same decision can be made by different parties. Which story leads a news front page was once an editor's call. It can also be made by:

- an A/B test that assigns readers to two headlines;
- a bandit that shifts traffic toward the headline getting more clicks;
- a model that picks per reader;
- an agent that writes a new headline.

The view, the options and the deadline stay the same, and only the chooser changes. The view is the candidate stories and what is known about the reader. If each decision has one contract and its chooser is bound separately, a list of features becomes one construct:

| Chooser bound to the decision | Usual name |
| --- | --- |
| A fixed rule | conditional, feature flag |
| Uniform or balanced randomization | A/B test |
| A policy learning toward a goal | bandit |
| A policy that reads context | personalization, recommendation |
| A model | classification, routing |
| An agent | delegation |
| A person | the interface |

Changing the binding accounts for more features:

- **Automation** moves a decision from a person to a program.
- **Escalation** moves it back.
- **Delegation** moves it from a person to an agent, under a policy the person sets.
- **Testing** binds simulated choosers: scripted ones, random ones that search for failures, and models playing personas.
- **Regression testing** replays recorded choosers against new rules.
- **Presentation** depends on the chooser. The same decision can be drawn on a screen, read aloud by a voice assistant, or handed to an agent as a typed schema. An API for agents is a product's decisions with the rendering removed.

The decision that shapes a product most is what happens next:

- When the program fills it, the product is an interview, such as a tax-filing questionnaire, a checkout or an onboarding sequence.
- When a person fills it, the product is a workspace, such as a spreadsheet.
- When an agent fills it, the product is a delegated task, such as a coding agent working through a repository.

Eric Horvitz's [principles of mixed-initiative interfaces](https://erichorvitz.com/chi99horvitz.pdf) (CHI 1999) describe products in which this binding passes back and forth within one session.

Agents differ from fixed programs mainly in discretion, which is the size of the option set. "Choose one of three refund amounts" is narrow; "reply to the customer" is wide. Splitting a wide decision into narrow ones lowers discretion and makes each piece checkable, so the depth of decomposition is how a designer sets an agent's autonomy. Raja Parasuraman, Thomas Sheridan and Christopher Wickens (2000) proposed a separate level of automation for each stage of a task: acquiring information, analyzing it, selecting an action and carrying it out. That amounts to a binding per decision. Authority belongs to the binding rather than to the chooser's ability, a point developed in [Old Foundations, New Agents](/durable-universals-agentic-ai-engineering).

In programming-language terms, the decision is an algebraic effect (Plotkin and Pretnar, ESOP 2009). The program performs `ask`, and a handler supplies the answer. The handler is the chooser.

![Six choosers under one decision contract, compared by whether propensities are known and how far replay reaches](../../assets/diagrams/choosers.svg "Any chooser can fill a decision. They differ in what the record can hold about them.")

Choosers differ in what the record can hold about them, and principle 6 depends on the difference. A program that randomizes can log the probability it gave each option, called its *propensity*. A person's propensities are unknown. A model can be asked again if the model, its context and its random seed are pinned. A person cannot be asked again.

## 3. Conclusions about absence need a closer

Facts reach different places at different times. Some rules only add conclusions as facts arrive, such as "these people have voted" or "this document contains these edits". Such a rule reaches the same answer everywhere once the facts have spread, whatever order they arrived in. Other rules conclude something from the absence of facts:

- "the seat is free";
- "the latest price is $40";
- "this username is available";
- "candidate A won".

Each claims that no other relevant fact exists, and one late fact can make it false. Such conclusions are safe only after a closure, a decision that the relevant facts are complete.

Joseph Hellerstein and Peter Alvaro's [CALM theorem](https://arxiv.org/abs/1901.01930) states this precisely. A problem has a consistent distributed implementation that needs no coordination if and only if it is monotone. Coordination is needed exactly where a conclusion about absence is drawn (CACM 2020, building on Ameloot, Neven and Van den Bussche, PODS 2011). Even "the current value" is such a conclusion. Last-writer-wins therefore hands closure to timestamps.

![Facts arriving over time, a running tally that is safe at any moment, and a winner that is known only after closure](../../assets/diagrams/closure-timeline.svg "A monotone rule is safe at any moment; a conclusion about absence waits for closure.")

Closure appears at every scale under different names:

| Who closes | What they close |
| --- | --- |
| A person pressing submit | their own answers |
| A clock | a hold, when it expires |
| A database | a transaction, at commit |
| A replicated log | an entry, at consensus |
| A stream processor | an event-time window, at its watermark |
| An experimenter | the data, at the analysis cutoff |
| An accountant | the books, at period end |
| An election authority | the ballot, when polls close |

The way closure is decided changes how people choose. Alvin Roth and Axel Ockenfels ([AER 2002](https://www.cs.princeton.edu/courses/archive/spr08/cos444/papers/roth_ockenfels02.pdf)) compared eBay auctions, which ended at a fixed time, with Amazon auctions, which continued until ten minutes passed without a bid. eBay bidders bid in the closing seconds far more often. Experience made eBay bidders bid later and Amazon bidders bid earlier. The closure rule was a mechanism, and bidders optimized against it.

There are two ways to avoid waiting for a closer:

- **Make the decision confluent.** Peter Bailis and colleagues ([PVLDB 2014](https://arxiv.org/abs/1402.2237)) call operations *invariant-confluent* when any two valid states merge into a valid state. Likes on a post are confluent; seats in a theater are not.
- **Move the closure.** Patrick O'Neil's escrow method (TODS 1986) splits a contested quantity into shares so that each holder can decide locally within its share. A box office holding a block of seats can sell them without asking the central system, and a warehouse can promise its own stock.

Offline capability follows from the two: a disconnected device can decide whatever is confluent or escrowed to it.

The same structure explains a familiar statistical error. A test analyzed with a fixed-horizon p-value is valid only at its declared cutoff. Checking the result every day and stopping once it looks significant draws a conclusion before closure, and false positives multiply. Ramesh Johari, Pete Koomen, Leonid Pekelis and David Walsh's [always-valid inference](https://arxiv.org/abs/1512.04922) (Operations Research) makes the conclusion valid at whatever moment the experimenter stops.

## 4. When feedback must come before closure, predict

Every decision has two times. The *feedback deadline* is the longest its chooser can wait for a response before the interaction fails. The *commit time* is the round trip to its closer, or to the people who must see it.

On the deadline side:

- Robert Miller's 1968 study put the limit for a response that feels immediate at about 0.1 s.
- Animation needs a new frame every 16.7 ms at 60 Hz.
- For telephone conversation, ITU-T Recommendation G.114 recommends no more than 150 ms of one-way delay.

On the commit side, light in optical fiber travels about 200,000 km/s. Each 100 km of fiber therefore adds about 1 ms to a round trip, before any routing or processing. A contested decision confirmed within one 60 Hz frame needs its closer within about 1,700 km of fiber, and a round trip between London and Sydney takes at least 170 ms.

When the deadline is shorter than the commit time, the view has to show facts before they are closed. These *predicted facts* are reconciled when closure arrives. Several familiar features are this one mechanism:

- optimistic updates in a web app;
- characters appearing as they are typed into a shared document;
- a shooter's client moving the player before the server agrees;
- rollback netcode in fighting games;
- the "pending" line in a banking app after a card is tapped.

The card case shows the mechanism plainly. The authorization is a predicted fact, labeled pending. Settlement days later is the closure that posts it.

![A log-log plot of commit time against feedback deadline, with a diagonal separating decisions that can wait from decisions that must show predictions](../../assets/diagrams/deadline-distance.svg "Below the diagonal, the deadline is shorter than the round trip to the closer, so the view must show predicted facts.")

For confluent decisions the local result is already final; only other people's view of it waits. For contested decisions the local result can be wrong. The cost of prediction grows with how often it is wrong, because each wrong prediction is a correction someone sees.

Designers have three levers:

1. **Shorten the distance by moving the closer.** Trading firms colocate their servers in the exchange's data center, and a drawing app makes the device its own closer.
2. **Lengthen the deadline.** Age of Empires scheduled each command to execute two 200 ms communication turns after it was issued. Turn-based games make the deadline a whole turn. [EVE Online](https://www.eveonline.com/news/view/introducing-time-dilation-tidi) slows its simulation clock to as little as 10% of normal speed during large battles.
3. **Make the decision confluent,** so that it needs no closure (principle 3).

David Jefferson's Time Warp (TOPLAS 1985) is the general form of prediction. A simulation runs ahead optimistically, and when a message arrives with an earlier timestamp, it rolls back.

## 5. Coupling follows from the rules

Rules connect the decisions of different parties, and two graphs can be read off them:

- **Influence.** An edge runs from A to B when some rule that produces B's view or B's outcome reads A's facts.
- **Conflict.** A and B are joined when a rule that needs closure depends on both, so their decisions cannot both stand without a closer.

Two people booking the same seat conflict. Two people commenting on the same post only influence each other. Every conflict edge is also an influence edge.

![A graph with influence and conflict edges, partitioned into three parts; cut edges are marked, and the partition sets sync, closer placement and experiment arms](../../assets/diagrams/coupling-graph.svg "One partition of the coupling graph sets what syncs live, where closers sit and which units share an experiment arm.")

Most of what a product does about other people is a use of one of these graphs:

| Feature | Graph | What the feature does |
| --- | --- | --- |
| Subscriptions, interest management | influence | deliver facts along edges |
| Presence, live cursors | influence | deliver along edges with short deadlines |
| Notifications | influence | deliver along edges with long deadlines |
| Permissions, privacy settings, blocking | influence | delete edges; Dorothy Denning's lattice model of information flow (CACM 1976) is the general form |
| Sharding | conflict | partition so that each closer handles one part; cut edges become distributed transactions |
| Experiment units | influence | partition so that each part gets one arm; cut edges carry treatment between arms |

The last row is where statisticians and systems engineers meet, often without noticing. Donald Rubin's stable unit treatment value assumption (SUTVA) holds that one unit's outcome does not depend on another unit's treatment. Equivalently, no influence edge crosses between arms. Software rarely gets SUTVA for free, so it has to be engineered. Three methods are in use:

- **Partition the graph.** In 2013 Johan Ugander and Lars Backstrom published [balanced label propagation](https://web.stanford.edu/~jugander/papers/wsdm13-blp.pdf), which partitioned Facebook's social graph across servers (WSDM). In the same year Ugander, Brian Karrer, Backstrom and Jon Kleinberg published graph cluster randomization, which assigns treatment to clusters of the same graph (KDD). Both papers partition one graph.
- **Randomize over time.** When coupling runs through a shared pool, as when every rider in a city competes for the same drivers, the graph has no useful clusters. [Switchback designs](https://arxiv.org/abs/2009.00148) randomize time periods instead (Bojinov, Simchi-Levi and Zhao, Management Science 2023).
- **Change the rules to cut edges.** LinkedIn's [budget-split design](https://arxiv.org/abs/2012.08724) (Liu, Mao and Kang, KDD 2021) gives each arm of an ads experiment its own share of every advertiser's budget, so the arms cannot compete for it. That is escrow from principle 3, used to buy statistical independence rather than writes that need no coordination.

Policies cannot remove conflict edges. If two people try to register the same email address, the second learns that the first exists, whatever the policy says about what each can see. Every conflict edge is an information channel. That is why a sign-up form that reports "this email is already registered" lets anyone test whether a person has an account. The standard fix moves the outcome into a channel that only the address's owner controls: "If an account exists, we've sent a link."

Economists distinguish rival goods, which only one party can hold, from non-rival goods, which anyone can copy. The distinction looks like the same axis, but for computing it runs backwards. Non-rival information spreads without coordination and needs no closer. Rival goods need every claimant to meet at a closer. The underlying quantity is coupling.

## 6. Goals are rules with a direction

A goal is a rule over facts with a direction, such as more conversions, fewer cancellations or shorter waits. It also carries constraints that must hold while it is pursued. Program choosers can pursue a goal, and people and agents can be shown one. Several practices follow:

- **Analytics** evaluates goal rules and their inputs over the record. A dashboard is a view of goal rules.
- **Attribution** follows provenance from a goal back to the decisions that produced it.
- **An experiment** combines four earlier parts: a program chooser with known propensities, a goal, a unit taken from the influence partition, and a closure for analysis.
- **Bandits and personalization models** are choosers that read a goal while they run.
- **Pre-registration** records the goal and the analysis plan as facts before any outcome exists. Medical journals have required registration of clinical trials before enrollment since a 2004 statement by the International Committee of Medical Journal Editors.

Logged propensities make it possible to evaluate a chooser that was never deployed. Lihong Li, Wei Chu, John Langford and Xuanhui Wang ([WSDM 2011](https://arxiv.org/abs/1003.5956)) evaluated news-recommendation policies for the Yahoo! front page offline. They replayed a log of randomly chosen articles and kept only the events where the candidate policy would have chosen the same article. Microsoft's [Decision Service](https://arxiv.org/abs/1606.03966) (Agarwal et al., 2016) built the requirement into infrastructure: it logs each decision with its probability at the moment the decision is made.

Counterfactual replay generalizes the method. Hold the rules fixed, change one recorded decision, and recompute everything after it. The result is exact until the first later chooser whose view would have changed. A pinned model can be asked again. A person cannot, so beyond that point the replay needs a model of the person.

A goal without constraints invites a capable chooser to find the gap between the rule and what the rule was meant to measure. Experimentation practice handles this with guardrail metrics (Kohavi, Tang and Xu, *Trustworthy Online Controlled Experiments*, 2020). A conversion goal, for example, is pursued only while refund rate, latency and complaint rate stay within bounds. In the kernel, guardrails are invariants on a goal, and the same goal and guardrails can steer a bandit or an agent.

## 7. The program is a fact

Programs change while decisions are in progress. Some people still run last year's version of an app. An insurance claim may be halfway through a review that takes weeks. An agent may be partway through a task. If each program change is recorded as a decision, every fact can be read by the rules in force when it was made. Tax law treats transactions the same way: a sale is taxed under the law at the time of the sale, and retroactive change is exceptional and explicit.

- **A release is a closure:** an epoch at which pending decisions move to the new version.
- **Migrations change interpretations, not facts.** Old facts stay as they were, and translation between versions is a rule.
- **Pending decisions move by stable decision id.** A flow can be edited while thousands of people are partway through it, provided every pending decision maps to a decision in the new version or to a recorded fallback.
- **Changing an agent's model is a program change,** because it changes what a pinned agent would answer.

Rewriting stored state with a codemod is an optimization of the same idea, and its correctness has an exact form. Let *derive* map the record to state under a given version. A migration of stored state is correct when migrating the old derived state gives the same result as deriving under the new version: `migrate(derive_old(record)) = derive_new(record)`. Where replicas merge state, the migration must also commute with the merge.

Because the record holds real histories, this condition can be tested by replaying them through both paths. A finite library of migration operators, each with a known inverse or complement, satisfies the condition by construction. Three versions of such a library exist:

- the schema modification operators in Carlo Curino, Hyun Jin Moon and Carlo Zaniolo's PRISM (VLDB 2008);
- bidirectional lenses (Foster et al., TOPLAS 2007);
- David Spivak's functorial data migration (Information and Computation 2012).

One requirement has no exception. Suppose a change alters what an earlier view showed, after someone acted on that view. The change must itself be recorded, as a restatement is in accounting. Otherwise the decision loses the context that gave it meaning.

## What falls out

| Feature | Principles | What it is in the kernel |
| --- | --- | --- |
| History, audit, undo | 1 | views over the record; undo is a new decision |
| Caches, indexes, search | 1 | materialized rules |
| Analytics, funnels, attribution | 1, 6 | goal rules and provenance over the record |
| Feature flags, A/B tests, rollouts | 2, 5, 6 | a program chooser with logged propensities, a unit from the partition, a goal |
| Personalization, recommendation | 2, 6 | a learned chooser that reads a goal |
| Automation, escalation, delegation | 2, 5 | rebinding a decision, with a policy on the binding |
| Simulated users, regression replay | 1, 2 | substituted or recorded choosers |
| Voice, accessibility, agent APIs | 2 | one decision rendered per chooser |
| Durable workflows, reminders | 1, 2 | pending decisions are facts; the clock is a chooser |
| Submit buttons, turns, commits | 3 | closure |
| Inventory, quotas, rate limits | 3 | escrow |
| Offline mode | 3 | decisions that are confluent or escrowed to the device |
| Optimistic UI, prediction, rollback | 4 | predicted facts |
| Presence, live cursors, notifications | 4, 5 | influence edges, by deadline |
| Permissions, privacy, blocking | 5 | deleted influence edges |
| Sharding | 5 | a partition of the conflict graph |
| Experiments under interference | 5 | a partition of the influence graph, or rules that cut edges |
| Off-policy evaluation, counterfactuals | 1, 2, 6 | propensities and replay |
| Live updates, schema migration, old clients | 7 | versioned interpretation |

## Where familiar architectures sit

Three coordinates locate any decision:

- who fills the next decision;
- whether its feedback deadline is short or long compared with a network round trip;
- whether it is uncoupled, coupled by influence only, or contested.

Deadline and coupling form a grid of six cells. The machinery a decision needs grows from the top-left cell to the bottom-right one.

![A grid of six cells by deadline and coupling, with the mechanism each cell needs and example decisions colored by who picks next](../../assets/diagrams/decision-grid.svg "Familiar architectures are cells of a grid derived from principles 3 to 5; who picks next varies within every cell.")

The names in the cells are shorthand; the coordinates carry the theory. Two of the cells are hidden by the usual taxonomy of forms, editors and games:

- **Commons**, such as comment threads, wikis and mail, are coupled by influence and can wait.
- **Registries**, such as bookings, username claims and bank transfers, are contested but not live. They wait for a closer rather than predicting.

Who picks next runs through every cell. A rhythm game is an instrument whose program chooses the next note. A booking agent works in the registry cell on its owner's behalf.

Products are composites, and the grid describes their decisions, not their categories. A ride-hailing trip spreads across five of the six cells:

| Decision | Chooser | Deadline | Coupling | Cell |
| --- | --- | --- | --- | --- |
| Set the destination | rider | long | none | private work |
| Quote a price | program pursuing market balance | long | influence through shared supply | commons; experiments need switchbacks |
| Match rider to driver | dispatch program | seconds | conflict over drivers | registry, with a closer per zone |
| Accept the trip | driver | about 15 s | conflict | registry |
| Show the car on the map | world (GPS) | short | influence | canvas: the view predicts positions between samples |
| Message the driver | rider or driver | long | influence | commons |
| Pay | world (card network) | long | conflict over funds | registry: authorization is predicted, capture closes it |
| Rate the trip | rider | long | none | private work |

Robert Johansen's 1988 groupware matrix sorted collaboration tools by whether people worked at the same or different times, and in the same or different places. The grid keeps the matrix's shape and replaces both axes with quantities that decide the architecture. Place becomes coupling, and time becomes deadline against commit time.

## One structure, five vocabularies

| Kernel | Game theory | Databases and distributed systems | Interface design | Experiment design |
| --- | --- | --- | --- | --- |
| Fact | move in the history | log record | event | recorded assignment or outcome |
| Rule | rules of the game | query, view, state machine | render function, reducer | metric definition |
| Decision | move | operation, transaction | action | treatment assignment |
| Chooser | player, Nature | client, process, network | user | assignment mechanism |
| View | information set | snapshot, read set | screen | covariates |
| Closure | end of turn, terminal history | commit, consensus, watermark | submit | analysis cutoff |
| Coupling | strategic interdependence | conflict | co-presence | interference |
| Goal | payoff | objective | task success | estimand |
| Program change | rule change | schema or protocol version | release | protocol amendment |

Each field has proved results about its own column, and the table carries those results across:

- The CALM theorem explains to an experimenter why peeking fails.
- Budget-split shows a database engineer that escrow can buy statistical independence.
- Extensive-form games tell an interface designer that the information set, meaning what a chooser could see when it chose, belongs in the record.

## What the theory rules out

1. **Confirmed feedback on a contested decision faster than the round trip to its closer.** Confirmation within one 60 Hz frame requires a closer within about 1,700 km of fiber. Anything faster is a prediction.
2. **A conclusion about absence without coordination.** This is the CALM theorem.
3. **An unbiased per-person estimate of an effect when outcomes are coupled across arms.** Randomizing per person then measures a mixture of direct effects and spillover.
4. **Exact counterfactual replay past a chooser who would have seen a different view and cannot be asked again.**
5. **Hiding the outcome of a contested decision from the party that lost it.** A policy can coarsen a conflict edge or reroute it, but cannot delete it.
6. **Reinterpreting a view someone acted on without recording the change.**

## Open problems

The principles turn architecture into consequences of measurable quantities. Six problems stand between that and a tool that derives a design from a product's decisions.

1. **Inferring closure.** A compiler could read rules and invariants and report which decisions need closers, at what scope, and where escrow would remove the need. [Indigo](https://www.dpss.inesc-id.pt/~rodrigo/indigo_eurosys15.pdf) (Balegas et al., EuroSys 2015) and Hamsaz (Houshmand and Lesani, POPL 2019) do this for invariants written in restricted logics.
2. **Estimating coupling.** Influence and conflict edges can be derived from rules and weighted from the record. No published rule says when a runtime may re-partition a moving graph without invalidating experiments already running.
3. **Declaring deadlines.** Products do not record a feedback deadline per decision. Without one, principle 4 cannot be applied mechanically.
4. **Contracts for agent choosers.** An agent's decision needs a specification. It should state what the view includes, which options exist, what budget applies, which outcomes must be handed back to a person to close, and what must be logged for replay.
5. **Models of people.** Counterfactual replay past a person needs a stand-in, and no accepted method yet validates one.
6. **Closure as mechanism design.** The auction comparison shows that closure rules change behavior. No catalog yet maps closure rules to the behavior each induces.

[Toward a universal runtime for interactive software](/universal-runtime-for-interactive-software) builds the kernel as four runtime components. [Toward a universal set of languages for interactive software](/universal-languages-for-interactive-software) gives each part of the kernel the least powerful language that can express it.
