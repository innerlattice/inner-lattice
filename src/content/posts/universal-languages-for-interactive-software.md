---
title: "Toward a universal set of languages for interactive software"
description: "One calculus with five levels, each adding one effect: values, policies, rules, flows and procedures. Laws, presentation and modules span the levels, and the record schema, closer placement, experiments and agent APIs can be read off the source."
date: 2026-10-03T12:20:00-04:00
tags: ["software-engineering", "architecture", "systems-thinking", "ontology", "agents"]
---

[Toward a universal runtime for interactive software](/universal-runtime-for-interactive-software) described four components that execute the decision kernel from [the theory post](/universal-theory-of-interactive-software). This post is about the source a programmer writes for them.

The kernel's parts need different guarantees:

- **Configuration, design tokens and copy** arrive from several sources: a design system, a brand, a locale, an experiment arm. They should combine without depending on load order.
- **Permissions** should be checkable before deployment. "Can anyone outside the clinic read this note?" needs an answer, not a test suite.
- **Rules** should terminate and update incrementally. The compiler should also report where a rule concludes something from absence, because that is where the runtime needs a closer.
- **Decisions** need stable ids, chooser slots and deadlines. Those make it possible to derive the record schema, bind experiments and migrate running flows.
- **Everything else** needs a general-purpose language, including the parts left to agents.

A general-purpose language can express all of these and guarantees none of them, because a program that can loop or call arbitrary code cannot be analyzed in general. The W3C's [Rule of Least Power](https://www.w3.org/2001/tag/doc/leastPower.html) (Berners-Lee and Mendelsohn, 2006) gives the usual answer: use the least powerful language that can express each part, because what a language cannot do, a tool can check.

Separate languages for each part would bring back the fragmentation the runtime removed. A schema in one language, a policy in another and a metric in a third each describe a booking differently. The alternative is one calculus in which levels differ only in which effects they allow. A type means the same thing at every level, and one module system spans them. Koka's effect types are the precedent. Each function's type lists the effects it may perform, so a pure function and one that throws or performs I/O are distinguished by type and checked by the compiler.

## Five levels

![Five levels from values to procedures, each adding one effect and keeping a stronger guarantee below it, with laws, presentation and modules spanning all five](../../assets/diagrams/language-ladder.svg "Each level adds one effect and gives up one guarantee. Laws, presentation and modules span all five.")

| Level | Adds | Guarantee | Kernel part |
| --- | --- | --- | --- |
| Values | nothing: data and constraints | merges in any order; conflicts are errors | schemas, tokens, copy, configuration |
| Policies | predicates over entities, without recursion | decidable analysis | deleted influence edges |
| Rules | recursion to a fixpoint over finite facts | termination, incremental evaluation, reported closure points | views, goals, coupling, open decisions |
| Flows | `ask`, `claim` and timers | enumerable paths, stable ids | decisions |
| Procedures | general recursion, I/O and holes | typed boundaries, logged and replayable | everything else, including agent work |

### Values

A value is data with constraints and no evaluation order. [CUE](https://cuelang.org) unifies values in a lattice: combining two constraints yields the most specific value that satisfies both, and incompatible constraints yield an error. Unification is commutative, associative and idempotent, which is the same algebra as a CRDT merge. A brand's tokens, a product's overrides and an experiment arm's variant can therefore be combined in any order. A conflict between them is a build error rather than a silent override.

Design tokens and copy belong at this level. The Design Tokens Community Group published the first stable version of its [format](https://www.designtokens.org/tr/2025.10/format/) in October 2025. Unicode MessageFormat 2, which handles plurals, gender and other variants in localized messages, became stable in CLDR 47 in March 2025. Copy written as values can vary by locale, plural form, channel and reading level. A copy experiment is a randomized chooser over the variants.

### Policies

Policies delete influence edges, and their value lies in answering questions before deployment. [Cedar](https://www.cedarpolicy.com) (Cutler et al., OOPSLA 2024) leaves out loops and recursion so that an SMT solver can decide properties of a policy set, such as whether two versions permit the same requests. Its developers proved the language's core properties in the Lean proof assistant and test the production implementation against that model. The restriction is the feature: the questions a policy author most needs answered are decidable only because the language cannot express everything.

### Rules

Rules derive facts from facts, recursively, to a fixpoint over finite data. Datalog terminates and can be evaluated incrementally. With time added, as in Dedalus, it can describe distributed state. Rules are also where the CALM theorem becomes a compiler check:

- Rules that are monotone, using no negation and no aggregation over open sets, can run anywhere without coordination.
- Rules that negate or aggregate over a scope that is still open need a closer for that scope, and the compiler can name the scope.

Two languages track monotonicity in types or lattices. Datafun (Arntzenius and Krishnaswami, ICFP 2016) is a functional language that tracks monotonicity in its type system. Bloom^L (Conway et al., SoCC 2012) extends Datalog-style rules to arbitrary lattices.

### Flows

A flow sequences decisions. It adds three effects:

- `ask` opens a decision, with a view, options, a deadline and a chooser slot.
- `claim` sends a request to a closer.
- Timers let the clock decide.

Between effects, control is finite, so every path through a flow can be listed and model-checked. Each `ask` has a stable id, so the set of a program's asks is the schema of its record. When the program changes, pending decisions move by id.

[GuidedTrack](https://www.guidedtrack.com), a language for surveys and behavioral studies, shows how much follows from this level. Its source order matches what a participant experiences. A study's data schema and its random assignment follow from the program without a separate specification. Ink, inkle's language for branching narrative in games, and BPMN, the process notation used in workflow engines, are flow languages for other choosers and deadlines.

### Procedures

Procedures have general recursion and I/O, and they can leave *holes*: places where the program's author leaves a decision to an agent at run time. A hole is a decision with a typed boundary. The type says what the agent sees and what it must return, and a runtime monitor checks the return before it becomes a fact. Several systems already work this way:

- [Hazel](https://hazel.org) (Omar et al., POPL 2019) runs programs that contain typed holes and continues evaluating around them.
- [DSPy](https://dspy.ai) (Khattab et al., 2023) writes model calls as signatures of inputs and outputs, and compiles the prompts that fill them.
- [Ia](https://github.com/innerlattice/ia-lang) treats a name with no definition, used as a function, as a function that an agent interprets at run time, given the name and its arguments.

Procedures guarantee the least, so they should be the smallest part of a program. The level of each module is a design choice, and lowering a module from procedure to flow, or from flow to rules, buys a guarantee.

## Across the levels

Three concerns apply at every level: laws, presentation and modules.

### Laws

A law is a property a module promises at a universal contract. Five examples recur across products:

- merges commute;
- the migration square commutes;
- no policy grants a given request;
- money is conserved;
- a slot is never booked twice.

How a law is checked depends on the level of the code it covers:

| Level | How laws are checked |
| --- | --- |
| Values, policies, rules | decided automatically |
| Flows | model-checked over enumerated paths |
| Procedures | proved where a law is declared, and monitored at run time otherwise |

The cost of the last row is falling. DeepMind's AlphaProof (Nature, 2025) used reinforcement learning to write proofs in Lean, whose small kernel checks each one. Models can increasingly produce proofs, and checking them stays cheap and trustworthy. The scarce work becomes writing the specification: deciding which laws a module should obey.

### Presentation

A decision's view declares *intents* rather than widgets: choose one of N, enter an amount, confirm, watch a status. A design system binds each intent to a component for each channel:

- a screen;
- a voice interface;
- a typed schema for an agent.

Content priority is data too, so the layout for a small screen or a spoken summary can be derived from the same declaration.

Who arranges the components is itself a decision, and principle 2 says its chooser can vary:

- a designer fixes the layout;
- a responsive rule computes it;
- an agent composes it from a catalog of approved components.

Google's [A2UI](https://a2ui.org) has agents send declarative UI drawn from a catalog the client trusts. MCP Apps, the first official extension to the Model Context Protocol (January 2026), lets tools return interactive interfaces that hosts render. In both, the catalog is a policy on the layout decision.

### Modules

[Notion architecture](https://github.com/ayahohner/notion-architecture) organizes a codebase into *notions*, modules that each own one concept. Each file in a notion has two coordinates:

- **Orientation:** inward (meaning and state), process (transformation and policy) or outward (expression).
- **Determination:** universal (laws and contracts), particular (kinds and strategies) or individual (concrete compositions).

Imports may point only toward inward orientations and universal determinations. The level is a third coordinate. A checker can then enforce three things together: each file stays within its level, imports follow the order, and laws sit at universal positions.

## A worked module: reservations

Restaurants, clinics, theaters, airlines and hotels all take reservations, and the concept exercises every level. A Reservation notion might contain:

| File | Coordinate | Level | Contents |
| --- | --- | --- | --- |
| `reservation.values` | inward universal | values | Slot, Hold, Booking |
| `reservation.laws` | inward universal | laws | at most one booking per slot; holds expire; escrow conserves capacity |
| `access.policy` | process universal | policies | who sees holds and who cancels; agents never pay without approval |
| `availability.rules` | process particular | rules | which slots are available |
| `goals.rules` | process particular | rules | fill rate, guarded by no-show rate |
| `book.flow` | process individual | flows | choose, hold, details, deposit, confirm |
| `alternatives.proc` | process individual | procedures | an agent suggests up to three other slots |
| `intents.values`, `tokens.values`, `copy.values` | outward universal and particular | values | intents, design tokens, copy |
| `web`, `voice` bindings | outward individual | values | components per channel |

A sketch of three of the files shows how much the levels expose to tools. The syntax is illustrative.

```text
# availability.rules
held(s)      :- hold(s, until), now < until.
booked(s)    :- booking(s), not cancelled(s).
available(s) :- slot(s), not held(s), not booked(s).
```

The compiler sees `not held(s)` and `not booked(s)`, which are conclusions about absence. It reports that `available` needs a closer, with each slot as its scope.

```text
# book.flow
slot    = ask choose_slot from available, by person, within 10 min
hold    = claim hold(slot), expires 10 min
details = ask contact_details, by person
deposit = ask deposit(slot), by world.card
claim confirm(hold, details, deposit)
```

Three asks and two claims make up the record schema for a booking. `choose_slot` may be rebound to a recommender with logged propensities, and `goals.rules` already supplies the goal, so an experiment needs no further code.

```text
# alternatives.proc
alternatives(party, wanted) -> slots: [Slot] where len(slots) <= 3, all available
  = ?suggest_alternatives(party, wanted)
```

The hole `?suggest_alternatives` is an agent decision. Its type is the contract. The monitor rejects a fourth slot or an unavailable one, and the log records the model, context and result for replay.

Several artifacts that teams usually write by hand follow from these files:

| Artifact | Read off |
| --- | --- |
| Record schema and analytics tracking plan | the `ask` and `claim` ids in flows |
| Closer placement | negation and aggregation in rules |
| Experiment design | a randomized binding on an `ask`, plus a goal rule |
| Agent API | the decision contracts, without their rendering |
| Migration plan | stable ids and the operators that changed between versions |
| Permission analysis | the policy files, by solver |

## Open problems

1. **Inferring levels.** A tool could infer the lowest level each module needs and suggest refactorings that lower it. One example is turning a procedure that only reads facts into rules.
2. **Proving rule migrations.** Schema migration has operator libraries with known inverses. Migrations of rules, where a metric's definition or an eligibility rule changes, do not. A checker would need to verify the commuting square from the operator library and from replay of recorded histories.
3. **Declaring deadlines.** Flows are the natural place to declare a feedback deadline for each decision. A language that does so lets the compiler apply principle 4 and choose between waiting and predicting. Which deadlines can be declared in advance, and which must be measured in use, is open.
4. **Validating specifications.** If models write proofs and kernels check them, wrong laws become the main risk. Methods to test a specification against recorded behavior and against what stakeholders intended are still informal.

[The theory](/universal-theory-of-interactive-software) gives the kernel and principles. [The runtime](/universal-runtime-for-interactive-software) executes them. The levels above make each principle visible in source, where a compiler can check it. [Old Foundations, New Agents](/durable-universals-agentic-ai-engineering) covers the older ideas that agent systems still depend on: state machines, logs, consensus and the separation of authority from intelligence.
