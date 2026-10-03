---
title: "Toward a universal theory of interactive software"
description: "Four questions about each commit point place any part of a product in one of six regions, and one coupling graph sets its sync, sharding and experiment design."
date: 2026-10-03T12:00:00-04:00
tags: ["software-engineering", "architecture", "systems-thinking", "ontology", "agents"]
---

[GuidedTrack](https://www.guidedtrack.com) is a small language for writing surveys, studies and other interactive programs. A GuidedTrack program reads like a script. Plain lines appear on screen, `*question` waits for an answer, `*save` stores the answer under a name, and `*if` branches on what was stored. A typical teaching example is a sleep study that screens participants, measures how sleepy they feel, assigns each one to count sheep or picture a sunset, and measures sleepiness again.

Two keywords in that study do more than their syntax suggests. `*experiment` assigns a participant to a group while keeping group sizes balanced across all participants, so the statement's meaning depends on every other run of the program as well as the current one. `*save` names a column in the dataset that the study produces. The same text therefore holds the interface, the experimental design and the data schema. Most products keep those three in a design file, a feature-flag service and an analytics tracking plan, maintained by different teams and free to disagree.

Keeping the three together would help a checkout, an onboarding sequence or an approval workflow. Whether the same model can reach a dashboard, a shared whiteboard or a multiplayer game is less clear. Answering that requires a way to locate any part of a product and to say what changes in the software at each boundary.

## Eight primitives

Most GuidedTrack keywords reduce to eight operations:

```text
say     text                        show content
ask     schema -> value             wait for an answer; a handler decides who answers
let     name = expression           keep durable state
choose  name {branches} by policy   pick one branch
wait    duration | event            pause until a time or an event
goal    name = expression           declare what the program is trying to achieve
call    module(inputs) -> outputs   run another program
end     outcome                     finish and record why
```

`*if`, `*randomize` and `*experiment` look like three features, but each one picks a branch from a set. The three differ only in what does the picking. Treating the picker as a policy makes the family explicit:

| Policy | GuidedTrack equivalent or common name |
| --- | --- |
| `fixed(condition)` | `*if` |
| `uniform` | `*randomize` |
| `balanced` | `*experiment` |
| `bandit(goal)` | adaptive allocation toward a goal |
| `contextual(goal, features)` | personalization |
| `model(goal)` | a language model decides |

The author declares which branches exist. The operator decides how they are chosen and can replace an experiment with a bandit, and later with the winning branch, without editing the program. A bandit needs something to optimize, which is why `goal` belongs in the core. The sleep study computes `postInterventionSleepiness` but never declares that score as the study's objective. Once a program declares a goal, every `choose` upstream of the goal can be credited against it.

`ask` is an effect in the programming-language sense: the program states what it needs, and a handler supplies the value. In production the handler is a person using a web form. In testing, the handler can be a language model playing a persona, a recorded session replayed against a new version of the program, or another agent filling in the form for its user. [Ia](https://github.com/innerlattice/ia-lang), a procedural language for work done by people and AI agents, builds the same idea into its grammar: only a named Agent executes a Function, and a person is one kind of Agent.

A program that logs every `ask` answer and every `choose` decision can answer counterfactual questions by replay. Changing one recorded decision and re-running the log shows exactly what would have happened, up to the first later step where an Agent exercised judgment. The log records what that Agent decided in the actual run, not what it would have decided after the change.

## Commit points

Real products are composites. An online store has a catalog, a sizing quiz and a checkout. A design tool has a canvas, a file browser, sharing dialogs and an upgrade flow. A label for the whole product hides parts that work differently.

A smaller unit works better: the *commit point*, a moment when an Agent's decision durably changes shared state. Placing an order, answering a screening question, moving a card on a board and releasing a dragged shape are commit points. Goals and experiments attach to commit points, permissions are checked at them, and the data a product keeps is a record of them.

Coverage then has a precise meaning. A language covers a product to the extent that it can express the product's commit points, regardless of how much screen area it can draw. A design tool's canvas is hard to write in GuidedTrack's model, but sign-up, onboarding, sharing, publishing and upgrading are flows, and those commit points produce most of the design tool's retention and revenue events.

## Nine dimensions

Commit points vary along nine dimensions:

| Group | Dimension | Low | Middle | High |
| --- | --- | --- | --- | --- |
| Control | Initiative: who decides what happens next | program | mixed | person |
| | Determinism: how fully each step is specified | scripted | interpreted within bounds | open |
| | Participants in one instance | one | handoff, one after another | concurrent |
| Structure | Composition | sequence in time | sequence of screens | arrangement in space |
| | Granularity of input | discrete commit | field edit | continuous gesture |
| | Cardinality of data in view | one item | bounded set | unbounded collection |
| Persistence | State scope | session | one person, durable | shared |
| | Horizon | minutes | days to months | indefinite |
| Purpose | Goal shape | terminal outcome | metric over a window | open-ended |

Several dimensions move together. Initiative, composition and cardinality rise together: a program-led step usually shows one thing at a time, while a person-led screen arranges a collection in space. Granularity and participants vary independently: a solo drawing app has continuous input and one participant, while a ticket sale has a hundred thousand concurrent buyers who never see each other. State scope and horizon are nearly independent of the rest, since a coaching program is a narrow, program-led flow that lasts six months.

Determinism and goal shape do not place a commit point. They decide how much of a flow language's advantage survives there. A step whose behavior is open cannot be replayed exactly, and a product with no declared goal gives `choose` nothing to optimize.

## Four questions

The nine dimensions describe a commit point but do not say what software it needs. A theory of interactive software has to derive its regions from thresholds where the cheapest correct architecture changes. Four questions, asked in order, find those thresholds.

![Four questions in sequence, with exits to scripted flow, adaptive flow, workspace, instrument, canvas and arena](../../assets/diagrams/region-tests.svg "Each question marks a threshold where the cheapest correct architecture changes.")

**1. Who chooses the next step?** If the program chooses, the commit point belongs to a flow, and the runtime needs a program counter, a record of where each participant is. Fixed rules make a scripted flow. A policy that learns toward a declared goal makes an adaptive flow, which also needs durable state, timers and a log of assignments. If the person chooses, the screen shows views over data, and each action the person takes starts a short flow. No program counter spans the session.

**2. Must the screen show state before it is committed?** Two conditions force a yes. The first is an unfinished gesture: a dragged shape has to follow the pointer before the drag ends. The second is an undecided order: in a shooter, a player's shot has to appear before the server has ordered it against other players' shots.

Both conditions reduce to one comparison. Each interaction has a *feedback deadline*, the longest delay before the response feels broken. Robert Miller's 1968 study of conversational response times put the limit for a response that feels immediate at about 0.1 s, and continuous input needs a new frame every 16.7 ms at 60 Hz. Each write also has a *commit time*, the time needed to reach whatever orders the write. When the feedback deadline is shorter than the commit time, the client has to render uncommitted state and reconcile it later. A form submission can show a spinner for half a second; a drag cannot. Optimistic updates in an ordinary web application also show uncommitted state, but the application still works without them, and question 2 asks whether the interaction fails without speculation.

**3. Does anyone else see the change as it happens?** If not, the commit point is part of an instrument: one writer, a local frame loop, and commits sent to shared state at the end of a gesture or a session. If others see the change, it has to reach them within their feedback deadline too.

**4. Do concurrent writes keep every invariant?** Peter Bailis, Alan Fekete, Michael Franklin, Ali Ghodsi, Joseph Hellerstein and Ion Stoica named this property [invariant confluence](https://arxiv.org/abs/1402.2237) (PVLDB 8(3), 2014). If any two states that satisfy an invariant merge into a state that still satisfies it, replicas can accept writes without coordinating. Text inserted into a shared document by two people merges into a valid document. Two bids for one lot cannot both win. By coordinating only on the invariants that failed the test, the authors ran the TPC-C New-Order transaction 25 times faster on 200 servers than prior results. A yes makes a canvas, where writes merge without a sequencer. A no makes an arena, where a *sequencer*, whichever party decides the order, has to order conflicting writes.

Question 4 applies to every shared write, not only to live ones. A ticket sale is a flow by questions 1 and 2, but its purchase step fails question 4, so the purchase commits as a transaction at a sequencer.

Each answer changes the runtime. Question 1 decides between a program counter and views. Question 2 decides whether the client runs a speculative frame loop. Question 3 decides whether changes are broadcast before they commit. Question 4 decides whether a write waits for a sequencer.

The questions have a precedent. Robert Johansen's 1988 groupware matrix sorted collaboration tools by whether participants worked at the same or different times and in the same or different places. The four questions keep the matrix's shape and replace both axes. Place becomes coupling: whether one participant's outcome depends on another's action. Time becomes the comparison between a feedback deadline and a commit time.

## Six regions

![Products placed in six regions by who owns the screen and whether the screen shows uncommitted state](../../assets/diagrams/regions-plane.svg "Products placed by who owns the screen and whether the screen must show uncommitted state.")

**Scripted flows** are what GuidedTrack covers today: quizzes, surveys, intake forms and eligibility screeners. A flow language *authors* scripted flows. Every path through one can be enumerated, so a property such as "no participant under 18 reaches the consent form" can be checked before launch.

**Adaptive flows** add policies, declared goals, handoffs between people and agents, and horizons of days or months: onboarding, checkout, approval workflows, a coaching program, an agent that follows a defined procedure. A flow language *orchestrates* adaptive flows.

**Workspaces** are screens the person drives: catalogs, inboxes, work queues, dashboards, admin tables and settings. A flow language *binds* views to shared state, and each button that changes something starts a short flow. A dashboard with create, update and delete actions looks like a poor fit for a flow language, but it is a workspace whose actions are flows.

**Live spaces** show uncommitted state. A flow language *hosts* live spaces through a commit contract, a typed interface through which the embedded component hands a decision back to the surrounding flow. Questions 3 and 4 split live spaces three ways. *Instruments* have one writer and a local frame loop, as in a drawing app, a rhythm game or a music sequencer. *Canvases* let several people write at once with merges that keep every invariant, as in a shared document, a whiteboard or a design file. *Arenas* let several people contest the same state, so a sequencer orders their writes, as in shooters, live auctions, live quiz shows and MMO zones.

The spreadsheet sits on the commit boundary. A single-user spreadsheet commits cell edits and recomputes formulas as views over cells, which places it among workspaces. Google Sheets shows other editors' cursors and edits as they happen, which moves the same grid into canvases.

## Inside live spaces

![Live space products placed by mergeable or contested writes and by feedback deadline](../../assets/diagrams/live-spaces.svg "Live spaces placed by whether writes merge or contest and by how quickly feedback must arrive.")

The left half of the diagram held few products before conflict-free replicated data types (CRDTs) and their relatives. Shared editing meant locks or a fragile operational-transform server. A CRDT merge is commutative, associative and idempotent, which makes the CRDT's own invariants confluent by construction. [Figma's multiplayer design](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/) shows how little of that machinery a product may need. A central server keeps each property of each object under last-writer-wins, and the scheme works because two people rarely change the same property of the same object at the same moment.

The dashed line is a physical floor. Light in optical fiber travels at about 200,000 km/s, so a round trip between London and Sydney along a great-circle path takes about 170 ms before any routing or processing. A product above the line cannot let a distant server order every write. Shooters and fighting games therefore match players by region, while document editors serve the world from one place.

Arenas survive by trading one constraint for another. Interest management syncs only what is near each player, which lowers the number of participants each update reaches. Sharding and layering duplicate the world to cap density. EVE Online's time dilation slows the simulation to as little as 10% of normal speed during large battles, giving up responsiveness to keep one consistent battle. Tab targeting and global cooldowns lengthen a game's feedback deadline until a server round trip fits inside it, which makes combat design a networking decision. Rollback netcode in fighting games predicts the opponent's input and rewrites recent history when the prediction was wrong. The upper right of the diagram, with large rings, is still open: no production shooter runs a thousand players in one area of interest.

## Coupling

The economists' distinction between rival goods, which only one party can hold, and non-rival goods, which anyone can copy, seems to separate arenas from canvases. The economic framing inverts the computational one. Non-rival information needs no contact between its copies, because each copy can be read and extended alone. Rival goods need contact, because every claimant has to meet at a sequencer. The dimension underneath is *coupling*: whether one entity's outcome depends on another entity's action.

Coupling appears under a different name in each of three fields:

| Field | Name for coupling | Standard response |
| --- | --- | --- |
| Distributed systems | coordination | put coupled writes behind one sequencer |
| Experiment design | interference, a violation of SUTVA | randomize coupled units together |
| Interface design | co-presence | sync coupled participants live |

Donald Rubin's stable unit treatment value assumption, SUTVA, holds that one unit's outcome does not depend on another unit's treatment. Physical experiments rarely get that assumption for free: laboratories build shielding, controls and isolation to approximate it. Software experiments get it only where coupling is low. Once users can see each other, a treatment given to one user reaches the others, and a per-user A/B test misstates the treatment's effect.

![A coupling graph cut into three clusters, with cut edges marked and the three uses of the partition listed](../../assets/diagrams/coupling-graph.svg "One cut of the coupling graph decides interest management, sharding and the experiment unit.")

The three standard responses are partitions of one graph, with entities as nodes and coupling as weighted edges. Johan Ugander and Lars Backstrom's [balanced label propagation](https://web.stanford.edu/~jugander/papers/wsdm13-blp.pdf) (WSDM 2013) partitioned Facebook's social graph across servers so that most friend lookups stayed on one machine. In the same year, Ugander, Brian Karrer, Backstrom and Jon Kleinberg published graph cluster randomization (KDD 2013), which assigns treatment to whole clusters of the social graph so that most of a user's friends share that user's treatment. Davide Viviano, Lihua Lei, Guido Imbens, Brian Karrer, Okke Schrijvers and Liang Shi's [causal clustering](https://arxiv.org/abs/2310.14983) (2023) states the trade-off: fewer, larger clusters cut fewer edges and so reduce bias, but leave fewer independent units and so increase variance.

Coupling can also run through time. In a ride-hailing marketplace every rider competes for the same drivers, so riders cannot be randomized independently. Iavor Bojinov, David Simchi-Levi and Jinglong Zhao's [switchback experiments](https://arxiv.org/abs/2009.00148) (Management Science, 2023) randomize whole time periods instead.

A runtime that records which entities each write touches can compute one coupling graph and derive all three partitions from it: live sync within a cluster, one sequencer per cluster and one experiment arm per cluster. Cut edges are where each partition pays, in coordination across sequencers and in treatment that crosses between arms.

## Walls

The regions are bounded by walls of three kinds.

Soft walls are crossed by adding constructs. Moving from scripted to adaptive flows takes policies, goals and timers. Moving from flows to workspaces takes views, events that start flows, and shared state. None of these changes how the program is evaluated.

Hard walls need different runtime semantics. Continuous granularity needs a frame loop and gesture streams in place of a program counter waiting for commits. Concurrent participants need merge semantics or a sequencer in place of one participant's sequential updates. A flow language does not cross the hard walls; it hosts the components behind them and receives their commits.

Value walls leave the program running but remove its advantages. A step with open determinism, such as a language model drafting a reply, cannot be verified in advance, and counterfactual replay stops being exact after that step. A product with only open-ended goals gives `choose` nothing to optimize, so adaptive allocation falls back to random assignment.

## Open problems

The four questions turn the regions into consequences of quantities that can be measured: who chooses, the feedback deadline against the commit time, who sees a change, and whether writes are invariant-confluent. A classification that only describes products after the fact is a taxonomy. A theory should take a product's measured coordinates and derive a design such as "this write needs a sequencer per room, randomization per team and client prediction at 30 Hz." Four problems stand between the current account and that standard.

**Measuring the coordinates.** Products do not record feedback deadlines or coupling weights per commit point. A runtime that logs which entities each write touches could compute coupling, but feedback deadlines still have to come from designers or from usability studies.

**Deciding question 4 automatically.** [Indigo](https://www.dpss.inesc-id.pt/~rodrigo/indigo_eurosys15.pdf) (Balegas et al., EuroSys 2015) and Hamsaz (Houshmand and Lesani, POPL 2019) use an SMT solver to find which pairs of operations can break an invariant, and Hamsaz synthesizes the coordination those pairs need. Both handle invariants written in restricted logics, such as "no two bookings overlap." Invariants that call arbitrary code are outside both tools.

**Re-partitioning a moving graph.** Teams form, matches end and friendships change. A partition that suits sharding today can bias an experiment that began yesterday, and no published rule says when a runtime may re-partition without invalidating running experiments.

**Bounding agent steps.** Each step handed to a language model moves a commit point behind a value wall. Logging the model's inputs and outputs restores replay. Counterfactual questions still stop at the first step where the model would have received different input.

The cheapest test of the account is mechanical: compile the GuidedTrack sleep study by hand into a runtime with entities, tables, transactions and subscriptions, and check whether every keyword lowers cleanly. [Toward a universal runtime for interactive software](/universal-runtime-for-interactive-software) describes that runtime, and [Toward a universal set of languages for interactive software](/universal-languages-for-interactive-software) describes languages that would compile to it. Both rely on older results collected in [Old Foundations, New Agents](/durable-universals-agentic-ai-engineering), including finite state machines, logs, consensus and information hiding.
