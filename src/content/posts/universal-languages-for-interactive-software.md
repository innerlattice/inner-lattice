---
title: "Toward a universal set of languages for interactive software"
description: "A language for programs built on the theory of choices, resolvers, records, and functions, derived from what existing languages give up and gain. Code varies along two independent axes: computational power, and whether the code uses the one effect, choose. Laws, commitments, bindings, scopes, goals, presentation, and versions are declarations. A reservation module shows what a compiler can derive from source."
date: 2026-10-03T12:20:00-04:00
tags: ["software-engineering", "architecture", "systems-thinking", "ontology", "agents"]
---

One interactive product is usually written in many languages:

- SQL for queries;
- a configuration language for settings and feature flags;
- a policy language, or scattered conditionals, for permissions;
- a general-purpose language for request handlers;
- a workflow definition for processes that wait for days;
- prompt templates for model calls;
- JSON for design tokens and message files for translated copy;
- a spreadsheet for the analytics tracking plan.

Each language describes the same entities in its own terms, and none of them can read the others. Properties that span them, such as whether every recorded choice appears in the tracking plan or whether an AI agent's tools obey the permission rules, are checked by review, if at all.

[Toward a universal theory of interactive software](/universal-theory-of-interactive-software) describes interactive software with four primitives (choices, resolvers, records, and functions) and nine principles. [Toward a universal runtime for interactive software](/universal-runtime-for-interactive-software) builds a runtime for that theory from four components. This post derives a language for writing programs that run on that runtime.

The method is to start from particular languages. Each successful special-purpose language gives something up, and the restriction buys a guarantee that tools can rely on. Sorting those trades shows two independent axes along which code varies. A language built on the two axes, plus a small set of declarations, can express every part of the theory. A reservation module written in the language shows what a compiler can derive from source, a comparison with other products tests whether the constructs generalize, and the last section states the language on one page.

## Terms and principles from the theory

| Term | Meaning |
| --- | --- |
| choice | a point where a run needs a value from outside its code; a choice has a stable identifier (its declaration's name and its address in the run), a view, options, a timeout, and a default |
| resolver | whatever supplies a choice's value: a function, a randomizer, a person, an AI model, a sensor, or another program |
| record | an immutable entry containing a value supplied at a choice, with its provenance |
| snapshot, view | the records available where a choice's view was computed; the information presented to the choice's resolver, computed from the snapshot |
| function | a deterministic map from a set of records to a value |
| binding | configuration stating which resolver supplies the value for which choice; only a value from the bound resolver counts |
| scope, seal, sequencer | a set of records picked out by a condition; a record stating that the scope is complete up to a position; the single resolver that admits records into the scope in one order |
| invariant | a condition that every set of admitted records must satisfy |
| read coupling, order coupling | a record from one choice can change another choice's view or options; records from two choices can each be admitted alone but not together |
| goal | a function of the records with a direction and guardrails |
| release | a record that changes the program version |
| commitment | a record whose value is a law over its resolver's later records |

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

## What existing languages give up and what they gain

A general-purpose language can express every part of a program and guarantees little about what any of them computes, because nontrivial properties of what arbitrary programs compute cannot be decided. The W3C's [Rule of Least Power](https://www.w3.org/2001/tag/doc/leastPower.html) draws the practical conclusion: use the least powerful language that can express each part, because the restriction is what makes the part analyzable. Successful special-purpose languages follow the rule, each in its own way:

| Language | What it gives up | What the restriction guarantees |
| --- | --- | --- |
| [CUE](https://cuelang.org) | evaluation order; values are constraints that are combined | combining configurations gives the same result in any order, and contradictions are errors |
| Spreadsheet formulas, before `LAMBDA` | assignment and loops | a dependency graph, so only affected cells are recalculated |
| SQL without recursive queries | recursion | every query terminates in polynomial time, and an optimizer may reorder it freely |
| [Cedar](https://arxiv.org/abs/2403.04651) | loops, recursion, and unbounded quantification | a solver can decide whether two policy sets permit the same requests |
| Datalog | everything except recursion to a least fixpoint over finite data | polynomial time, incremental evaluation, and monotonicity visible in the syntax |
| [Lean](https://lean-lang.org), [Dhall](https://dhall-lang.org) | non-terminating recursion (by default, in Lean) | every function terminates, and in Lean properties can be proved and machine-checked |
| [Elm](https://guide.elm-lang.org/effects/) | side effects in `update` and `view` | all input arrives as messages, so a session can be replayed exactly |
| [Temporal](https://docs.temporal.io/workflows) workflows | nondeterminism in workflow code | a workflow's position is rebuilt by replaying its code against recorded step results |
| [GuidedTrack](https://www.guidedtrack.com), [Ink](https://www.inklestudios.com/ink/), [BPMN](https://www.omg.org/spec/BPMN/2.0.2/) | unrestricted control between input points | every path can be listed, and a study's data schema follows from the source |
| [DSPy](https://dspy.ai) | free-form prompts | model calls have typed signatures, so prompts can be optimized against a metric and models swapped |
| [Koka](https://koka-lang.github.io/koka/doc/book.html) | untracked effects | each function's type lists the effects it may perform, and the compiler checks them |

The restrictions fall into two kinds. CUE, SQL, Cedar, Datalog, Lean, and spreadsheet formulas limit *computational power*: what a piece of code can compute. Elm, Temporal, GuidedTrack, DSPy, and Koka limit *effects*: how a piece of code interacts with anything outside the code. The two kinds vary independently, so they form two axes.

## Axis one: computational power

Five levels of power recur across the languages above. Each level contains the one before it, and each step up gives up a guarantee. The first three levels come from *descriptive complexity*, which classifies queries over finite data by the logic needed to express them.

| Level | What code at this level can express | What a tool can decide or guarantee |
| --- | --- | --- |
| 0. Constraints | conjunctions of bounds, patterns, and equalities on one value, without quantifiers | whether constraints are compatible, and their combination, independent of order |
| 1. Queries | first-order logic over the finite set of records (joins, filters, negation), plus aggregation | termination in polynomial time; equivalence only for restricted forms |
| 2. Recursive queries | queries plus recursion to a least fixpoint | termination in polynomial time; incremental evaluation; monotonicity from syntax |
| 3. Total functions | recursion that provably terminates, over any data type | termination; properties provable with machine-checked proofs |
| 4. General recursion | anything computable | no nontrivial property in general; tests, runtime monitors, and per-program proofs |

Polynomial time, in both tables, is in the number of records for a fixed query.

**Level 0, constraints.** A constraint states what a value must satisfy, such as "a string of at most 40 characters" or "a color token equal to the brand's primary color". Combining two constraints, called *unification*, gives the most specific value satisfying both, and contradictory constraints give an error. Unification is commutative, associative, and idempotent, the same algebra as a merge of replicas. Configuration, [design tokens](https://www.designtokens.org/tr/2025.10/format/), and translated copy belong here, so a brand's tokens, a product's refinements, and an experiment variant can be combined in any order. Unification orders values by how much they state, so level-0 values form a lattice, and a type can declare an order of its own for values that grow, such as a counter that only increases or a set that only gains members. A test that every larger value also passes, such as `count >= 100`, stays true once true, so it needs no seal.

**Level 1, queries.** Safe first-order queries over a finite database have the same expressive power as relational algebra ([Codd's theorem](https://en.wikipedia.org/wiki/Codd%27s_theorem)), which is the core of SQL. Every query terminates in polynomial time. Deciding whether two first-order queries are equivalent is undecidable over finite databases ([Trakhtenbrot's theorem](https://en.wikipedia.org/wiki/Trakhtenbrot%27s_theorem)), which is why Cedar restricts further: without unbounded quantification, its policies translate into a logic that [SMT solvers](https://en.wikipedia.org/wiki/Satisfiability_modulo_theories) decide. Access rules are functions at this level or level 0. They need no level of their own. SQL queries are at this level, so SQL can serve as a syntax for level-1 functions. SQL's statements that modify tables have no counterpart, because records are added only at choices.

**Level 2, recursive queries.** Adding recursion to a least fixpoint, as Datalog does, expresses reachability, hierarchies, and graph partitions. On ordered finite data, first-order logic with least fixpoints expresses exactly the queries computable in polynomial time (the Immerman–Vardi theorem of [descriptive complexity](https://en.wikipedia.org/wiki/Descriptive_complexity_theory)). Evaluation can be incremental, and monotonicity is visible in the syntax. At levels 1 and 2 the compiler gives each input of a query a polarity: positive through selection, projection, join, and union; reversed by each negation, such as `not exists` or a set difference; and unknown through an aggregate, unless the aggregate grows in an order declared for its result and is read only by tests that every larger value also passes. Polarities compose like signs, so the compiler can mark every edge at which a query may conclude something from absence, and by the CALM theorem from the sealing principle, the marked edges include every place that needs a seal. The marked edges divide the program into strata, as in Datalog's stratified negation, and the seals sit between strata. Code at levels 3 and 4 has unknown polarity in every input unless a proof states otherwise. [Datafun](https://doi.org/10.1145/2951913.2951948) carries the same monotonicity tracking into a typed functional language.

**Level 3, total functions.** Functions whose recursion provably terminates can compute over any data type, including trees and higher-order functions, and are no longer limited to polynomial time. A game's step function, a migration, and a pricing formula belong here.

**Level 4, general recursion.** By [Rice's theorem](https://en.wikipedia.org/wiki/Rice%27s_theorem), no nontrivial property of what arbitrary programs compute can be decided.

## Axis two: one effect, choose

In the theory, a function is deterministic, and every value a function cannot compute arrives through a choice. Apart from nontermination, which the power level records, the language therefore needs exactly one effect:

$$
\mathsf{choose} : (c : C) \to X_c
$$

where $C$ is the set of declared choices with their arguments and $X_c$ is the value type of choice $c$. In words: `choose c` opens a new choice declared as $c$ and evaluates to the value that the bound resolver supplies. Code that performs no `choose` is *pure*, and code that does is *interactive*. Every interaction that languages usually treat as a separate effect is a choice bound to a particular resolver:

| Usual effect | As a choice |
| --- | --- |
| user input | a choice bound to a person |
| random numbers | a choice bound to a randomizer, which records its probability |
| the current time | a choice bound to a clock, treated as a sensor |
| a timer | a choice whose only outcome is its default, recorded when the timeout passes |
| an HTTP call, a payment, an email | a choice bound to another program, whose reply is the value |
| a model call | a choice bound to an AI model |
| a database transaction | a choice bound to a sequencer: admit or refuse a record into a scope |

A `choice` declaration gives a name, a view, options, a timeout, a default, and optionally a response deadline, and the set of declarations is the program's record schema, which, with the declared goals, makes the analytics tracking plan a compiler output. Each `choose` opens a new choice, whose stable identifier is the declaration's name and an [*address*](https://proceedings.mlr.press/v15/wingate11a.html): the record that started the run, the calls and `choose` steps that led to this one, and the count of each enclosing loop. A declaration can also mark the choice `acts`, meaning that presenting it changes the world, as a payment or an email does. The runtime presents such a choice under its identifier and opens it only when its view, and the condition under which the flow reaches it, read only final outputs (effects principle). This is a property of a choice, separate from the programming-language sense in which `choose` is the only effect.

The table is the binding principle in language form. In programming-language terms, `choose` is an [algebraic effect](https://arxiv.org/abs/1312.1399) and a resolver is the effect's handler, so the code that opens a choice never names the resolver. The binding names the resolver, and a test, a replay, or an experiment substitutes a different handler without changing the code. Koka shows that an effect can be tracked in types. With one effect, the type of every definition states whether the definition can open choices at all, and pure code can be cached, moved, and replayed freely.

### Interactive code is notation for a function

A sequential program with `choose` reads like a script that pauses at each choice. The theory has no paused processes, though: the set of open choices is a function of the records. The sequential program is notation for that function. The examples in this post use an invented sketch syntax, explained where each construct first appears; the syntax is not an existing language. In the sketch syntax, `flow` defines interactive code and `--` starts a comment:

```text
flow checkout() {
  address = choose shipping_address()
  method  = choose shipping_method(address)
  choose confirm(address, method)
}
```

The flow above denotes the following function from the records `R` to the set of open choices:

```text
fn open_choices(R) =
  if   not recorded(R, shipping_address) then { shipping_address() }
  elif not recorded(R, shipping_method)  then { shipping_method(value(R, shipping_address)) }
  elif not recorded(R, confirm)          then { confirm(value(R, shipping_address), value(R, shipping_method)) }
  else {}
```

`recorded(R, c)` is true when `R` contains a record of the choice `c` opened in this run, and `value(R, c)` is that record's value. In a flow with a loop, `c` stands for an address, because each pass opens a new choice. The runtime does not need the second form written out. The runtime computes the same result by replaying the flow against the records, using the record at each `choose`'s address until the replay reaches an address with no record. Semantically, a flow denotes an [interaction tree](https://arxiv.org/abs/1906.00046): each `choose` is a node, each possible value is a branch, and the records determine a path through the tree.

The equivalence places interactive code on the first axis. The control, which determines the next open choice, is a function, and its power level determines what can be checked:

| Power of the control between choices | Example | What can be checked |
| --- | --- | --- |
| Levels 0–1: fixed sequence, conditions, loops back to earlier points | a tax interview, a checkout, or a booking flow | control has finitely many locations, so properties over all paths through them, such as "every hold is eventually paid or released," can be [model-checked](https://en.wikipedia.org/wiki/Model_checking) |
| Levels 2–3: loops bounded by data | one question per guest, one step per line item | every step between choices terminates; properties can be checked for bounded data or proved |
| Level 4: unbounded computation between choices | an agent loop, a planner | monitors and tests; replay is still exact because the control is deterministic |

Any piece of code therefore has two coordinates: its power level, and whether it is pure or interactive. The distinctions that languages usually draw between a query, a policy, a flow, and a procedure are positions in this grid.

![A grid with computational power from constraints to general recursion across the top and pure or interactive code down the side, with example languages and the guarantee available in each column](../../assets/diagrams/language-axes.svg "Two independent axes. Power sets what a tool can decide; the one effect, choose, marks code that opens choices.")

### Unresolved names are choices

A choice can also be declared implicitly. A function with a type signature and no body cannot be computed, so a call to it needs a value from outside the program, which is the definition of a choice. The choice's view is the function's name, signature, documentation, and arguments, its options are the values of the return type that satisfy the stated conditions, and its default resolver is an AI model. [Ia](https://github.com/innerlattice/ia-lang) is a language built on this idea: an undefined name used as a function is interpreted by a model at run time. Here the signature is required, so a misspelled name is a compile error. Typed holes in [Hazel](https://hazel.org) are a related construct at edit time. A program with holes still runs, evaluating everything that does not depend on a hole, and each hole is filled in later by the programmer or by a tool.

Treating a call to an unresolved name as a choice gives the call everything a choice has: the dispatcher checks the returned value against the type, the record contains the AI model, the model's version, and the view for replay, and the binding can be changed to a deterministic function once someone writes one.

## Declarations that are not code

Some parts of a program are never executed. Bindings configure the code, scopes configure how its records are ordered and stored, laws state properties of the code, commitments state which laws hold across programs, goals define how outcomes are evaluated, presentation defines how views are shown, and releases define how the program changes. Each is a declaration whose content is code at a low power level.

### Bindings

A binding maps each choice, optionally under a condition, to a resolver. A binding table is configuration at level 0 or 1, so the table can be analyzed before deployment. The table is versioned with the program, so changing a binding is a release.

### Scopes

The compiler derives which scopes need a sequencer and which outputs need seals. A `scope` declaration states the settings of a scope that the program's owners choose: where its sequencer runs, how many admitted records a failure may lose, which parties must trust it, a seal schedule such as a tick, how long its records are retained, and whether devices receive its records or only its outputs. A declaration may add coordination but never remove it. It can sequence a scope whose records would merge without order, or require a quorum, and the compiler refuses a declaration that leaves a derived scope without a sequencer or an output without the seals its polarity requires.

### Laws

A law is a property that every run of the program has. How a law is checked depends on what it states and on the power level of the code it covers. Each law below comes from the reservation module later in this post or from the runtime post:

| Law | Plain statement | How it is checked |
| --- | --- | --- |
| an invariant | "a slot never has two live holds" | for invariants written in a restricted logic, a solver checks whether the invariant is invariant-confluent, that is, whether two sets of records that each satisfy the invariant and grow from a common admitted set always merge into a set that also satisfies the invariant. [Indigo](https://www.dpss.inesc-id.pt/~rodrigo/indigo_eurosys15.pdf) and [Hamsaz](https://doi.org/10.1145/3290387) run related checks on pairs of operations. If the invariant is not shown to be invariant-confluent, the compiler derives a scope and requires every record that can violate the invariant to pass through that scope's sequencer, which evaluates the invariant at admission |
| a temporal property of a flow | "every admitted hold is eventually paid or released" | model checking over the flow's control locations, using the guarantee that every choice with a timeout eventually has a record |
| a property of a binding table | "AI models never resolve the deposit payment" | the compiler translates the binding table and the law into a decidable logic and runs an SMT solver to search for a binding table that satisfies the configuration and violates the law; because the logic is decidable, the solver either finds such a table or proves that none exists, unless it runs out of time or memory first |
| a property of a merge | "concurrent edits merge to the same document in any order" | true by construction when the merge is unification at level 0; otherwise checked by a proof or by property-based tests |
| a migration square | "migrating stored state gives the same result as recomputing the state under the new version" | tested by replaying stored records along both paths and comparing the results, or proved where the functions allow it |
| a property of a level-3 or level-4 function | "a refund never exceeds the amount paid" | a machine-checked proof where one exists; otherwise a runtime monitor that refuses a value violating the law and records the refusal |

Writing proofs has long been the costly step in the last row. A reinforcement-learning system has [written proofs in Lean for olympiad mathematics problems](https://www.nature.com/articles/s41586-025-09833-y), and each proof was verified by Lean's proof checker, a small program whose verdict does not depend on how the proof was produced. If such systems become able to prove properties of programs, the cost of the last row falls, and the work that remains for people is stating the right laws.

### Commitments

A commitment is a law with an owner. `rely` declares a law over another program's records that this program depends on, and the law must match a commitment that the other program has recorded. `commit` publishes one of the program's own laws, as a commitment, to the resolvers bound to its choices. The runtime checks a relied-on law against the other program's replies and records each breach.

### Goals

A goal declares a function, a direction, and guardrails, as the goals principle requires. Analytics, experiments, and bandit resolvers read the declaration, so the metric an experiment optimizes and the metric a dashboard displays are the same definition.

### Presentation

A choice's view states what the resolver must be able to perceive and do, as *intents*: select one of several options, enter an amount, confirm, or follow a status. A design system maps each intent to a component for each channel: a screen, a voice interface, or a typed schema for an AI agent. Priorities among the parts of a view are data, so a small-screen layout or a spoken summary can be computed from the same declaration.

Arranging components on a screen is itself a choice. Its options are the arrangements that a component catalog allows, and its resolver can be a designer who fixes the layout, a layout function that responds to screen size, or an AI model that composes an arrangement per person. [A2UI](https://a2ui.org) has agents send declarative interfaces built from a catalog of trusted client components, and [MCP Apps](https://blog.modelcontextprotocol.io/posts/2026-01-26-mcp-apps/), the first official extension to the Model Context Protocol, lets tools return interactive interfaces that a host renders. In A2UI, the catalog is the option set of the layout choice.

A layout that changes per person makes positions on the screen useless as references, so options that refer to things have identifier types, such as `Id<Slot>` (grounding principle). The presentation shows each slot by its start time and converts a tap into the slot's identifier on the device, and only the identifier is recorded. When a resolver supplies free text that refers to things, such as a chat message asking for "the later slot", the program reads the text through a choice whose options are identifiers and whose record the author can supersede.

### Versions

A `release` declaration names a new program version and the migrations that read old records or convert stored state. Choices keep their identifiers across releases that do not change what their values mean, so an open choice's value still counts under the new version, as the versions principle requires. When the control between choices is at level 0 or 1, it has finitely many locations, so the compiler can map each location at which a choice may be open in the old version to a location in the new one or to a fallback, and report every location with neither. With that map, a release can take effect on servers and devices while runs are partway through, without waiting for them to finish.

## Modules organized by notion architecture

The declarations above need an organization that keeps related code together and keeps dependencies pointing one way. [Notion architecture](https://github.com/ayahohner/notion-architecture) provides one. A codebase is divided into *notions*. A notion is a module that owns one concept, such as Reservation, Payment, or Venue, together with everything that changes when the concept changes. Grouping by concept, rather than by technical layer, means most changes to how reservations work stay inside one notion.

Inside a notion, each file has two coordinates. The first, *orientation*, is the side of the concept the file faces:

- **Inward:** what the concept is. Types, stored values, and invariants.
- **Process:** what the concept does. Transformations, policies, and coordination.
- **Outward:** how the concept meets everything else. Pages, endpoints, events, and APIs.

The second, *determination*, is how specific the file is:

- **Universal:** what is true of every instance of the concept. Laws and contracts.
- **Particular:** what is true of one kind or strategy. Implementations of the contracts.
- **Individual:** one concrete composition. Wiring, bindings, and configuration for a specific product.

The import direction combines both coordinates. A file may import only files that are at least as inward and at least as universal as itself. Laws, which are inward and universal, import nothing from their notion, and a concrete page, which is outward and individual, may import anything. Files that change rarely sit where everything depends on them, and files that change often sit where nothing does.

The language adds the two axes as further coordinates. Each file declares its power level and whether it is interactive, and the compiler checks three things together: that the code stays within its declared level, that imports follow the import direction, and that laws sit at universal positions. The parts of the theory map onto these coordinates: types and laws are inward and universal, functions and flows are process files, presentation is outward, and bindings are individual.

## A reservation module

Restaurants, clinics, theaters, airlines, and hotels all take reservations, and a reservation system uses every construct above. The module below books a slot for a party, holds the slot while a deposit is paid, and suggests alternatives when nothing near the requested time is free. The module is written in the same invented sketch syntax as before.

### Types and functions

```text
-- level 0: types of the values that choices produce
type Slot    = { start: Time, seats: Nat }
type Party   = { size: Nat, contact: Contact }
type Hold    = { slot: Id<Slot>, party: Party }
type Release = { hold: Id<Hold> }
type Payment = approved | declined | unknown

-- level 1: functions over the records
fn slots = values(publish_slot)

fn released(h: Id<Hold>) = exists r in admitted(Release) where r.hold == h
fn paid(h: Id<Hold>)     = exists p in records(pay_deposit) ∪ records(reconcile_deposit) ∪ records(settle_deposit) where p.hold == h, p.value is approved

fn live_holds(s: Id<Slot>) =
  { h in admitted(Hold) | h.slot == s, not released(h.id) }

fn open_slots(size: Nat) =
  { s in slots | s.seats >= size, live_holds(s.id) == {} }

fn near(size: Nat, t: Time) =
  { s in open_slots(size) | abs(s.start - t) <= 2 h }
```

`type` declares the value types that choices produce; `Id<Slot>` is the identifier of a record whose value is a `Slot`, and `|` separates alternatives. In set braces, `|` reads "such that", and `x.id` is the identifier of the record that holds `x`. `fn` defines a function, and every function implicitly reads the current records. `values(c)` is the set of values counted for choice `c`, `records(c)` is the set of counted records for choice `c`, each carrying the choice's arguments and the supplied value, and `admitted(T)` is the set of records of type `T` that a sequencer has admitted. All six functions are first-order queries, so they are at level 1, and the compiler can determine that `live_holds` and `open_slots` conclude something from absence (`not released`, `== {}`).

### Choices and an unresolved function

```text
choice publish_slot -> Slot

choice pick_slot(party: Party, offered: Set<Id<Slot>>) -> Id<Slot>? {
  view     offered
  options  offered
  timeout  15 min, default none
  deadline 100 ms
}

choice pay_deposit(hold: Id<Hold>) -> Payment acts {
  view    deposit_for(hold)
  timeout 10 min, default unknown
}

choice reconcile_deposit(hold: Id<Hold>) -> Payment {
  view    deposit_for(hold)
  timeout 1 h, default unknown
}

choice settle_deposit(hold: Id<Hold>) -> Payment {
  view    deposit_for(hold)
  options { approved, declined }
  timeout 2 d, default approved
}

fn suggest_alternatives(party: Party, wanted: Time) -> Set<Id<Slot>>
  ensures size(result) <= 3 and result ⊆ ids(open_slots(party.size))
```

`choice` starts a declaration, with its parameters and value type; `?` makes the value optional, so `none` is a valid default. A declaration that no flow opens, such as `publish_slot`, opens a new choice each time a bound resolver supplies a value. `acts` marks a choice whose presentation changes the world. `reconcile_deposit` is a choice of its own, bound to the network, whose value is the outcome of the `pay_deposit` choice for the same hold, under that choice's identifier. `view` is the function whose output is shown to the resolver, `options` restricts the admissible values (all values of the type when omitted), and `timeout ... default ...` gives the time limit and the value recorded if it passes. `deadline` gives the response deadline: the selected slot must appear held within 100 milliseconds, less than a round trip to a distant sequencer, so the compiler marks the hold's display as provisional (prediction principle). `suggest_alternatives` has a signature and an `ensures` clause but no body, so each call to `suggest_alternatives` is a choice: the dispatcher accepts only a set of at most three slots that are open, and refuses anything else.

### The booking flow

```text
flow book(party: Party, wanted: Time) {
  repeat {
    offered = ids(near(party.size, wanted)) or suggest_alternatives(party, wanted)
    slot    = choose pick_slot(party, offered)
    if slot == none { stop }
    hold    = admit Hold { slot: slot, party: party }
  } until hold != refused
  payment = choose pay_deposit(hold)
  if payment == unknown { payment = choose reconcile_deposit(hold) }
  if payment == unknown { payment = choose settle_deposit(hold) }
  if payment == declined { admit Release { hold: hold } }
}
```

`a or b` evaluates to `a` unless `a` is empty. `choose` opens a choice and evaluates to the recorded value. `admit` is `choose` applied to the admission choice of a scope: `admit` sends a record to the scope's sequencer and evaluates to the admitted record or to `refused`. `stop` ends the flow. If another party takes the slot first, the hold is refused and the loop offers slots again. If the card network's reply to the deposit is lost, the hold stays in place and the flow opens a choice for the network to supply the outcome, because releasing the slot while the card may have been charged would keep a deposit for nothing. If the network supplies no outcome, a staff member decides; after two days without an answer the hold counts as paid, so the venue bears the risk. The control has finitely many locations and one loop back, so the control is at level 1 and its control graph can be model-checked.

### Laws, commitments, bindings, scopes, goals, access, and presentation

```text
law one_live_hold:    forall s. size(live_holds(s)) <= 1
law hold_resolves:    always (admitted Hold h -> eventually (paid h or released h))
law agents_never_pay: resolver(pay_deposit) is not model

rely   card_network: repeated key for pay_deposit returns the first reply for 24 h
commit hold_resolves to party

bind publish_slot         to person in role staff
bind pick_slot            to person
bind pay_deposit          to external card_network
bind reconcile_deposit    to external card_network
bind settle_deposit       to person in role staff
bind suggest_alternatives to random { 0.5: model "assistant-2026-09", 0.5: fn nearest_open }

scope slot { place region, durable quorum }

goal fill_rate = seats_booked / seats_published, maximize
  guardrail abandon_rate <= 0.2

access Hold.party visible to { staff, the party }

present pick_slot      as select_one(offered, label: start)
present settle_deposit as confirm(amount: deposit_for(hold))

release v2 {
  migrate Slot { start, seats } -> { start, seats, accessible: false }
}
```

`law` states a property: `paid` and `released` are the functions defined above, `forall` ranges over slots, and `always` and `eventually` are the operators of temporal logic over the order in which records are admitted. `rely` names the card network's commitment that the module depends on, and `commit` publishes `hold_resolves` to the party as the venue's commitment. `bind` sets each choice's resolver. `random { ... }` picks a resolver at random with the given probabilities and records which one was picked, so the binding for `suggest_alternatives` is an experiment comparing an AI model with a deterministic function, `nearest_open`, defined elsewhere in the module. `scope slot` refers to the scope the compiler derives for each slot, places its sequencer in the venue's region, and makes an admission final only once a quorum stores it. `goal` declares the function to maximize and its guardrail. `access` removes the holder's identity from every view except those of staff and the party. `present` maps each choice to an intent. `release` declares version 2, in which slots gain a field, and the migration that reads version-1 slots under version 2.

### What the compiler derives from the module

| Output | How the compiler derives it |
| --- | --- |
| Record schema and analytics tracking plan | the declared choices (`publish_slot`, `pick_slot`, `pay_deposit`, `reconcile_deposit`, `settle_deposit`, `suggest_alternatives`) and the admissions of `Hold` and `Release`; for the plan's metrics, the goal `fill_rate` |
| One ordered scope per slot, with a sequencer | `one_live_hold` is not invariant-confluent: two holds on one slot each satisfy the law alone and violate the law together. The law reads holds and releases for one slot, so those records form the scope. The compiler also checks that every `Hold` enters through `admit`, and accepts the `scope` declaration because it only adds placement and durability. |
| Polarities and finality labels | `live_holds` is positive in holds and negative in releases, and `open_slots` negates it, so `open_slots` is negative in holds and positive in releases. A release can be applied to a view as soon as it arrives, because it can only add open slots. A slot shown as open stays provisional until the slot's scope is sealed past every hold that could take it, and `near`, which selects from `open_slots`, inherits the labels |
| A model-checking result for `hold_resolves` | the flow's control graph and the timeouts, which guarantee records. Every path from an admitted hold reaches a payment or a release, because neither the options nor the default of `settle_deposit` is `unknown` |
| A check that effects follow final values | `pay_deposit` is marked `acts`. The flow opens it only after `admit` returns `hold`, and its view reads `hold`, so both are final |
| A check that the deposit can be retried safely | `pay_deposit` is marked `acts` and bound to `card_network`, whose relied-on commitment keeps keys for 24 hours. The 10-minute timeout plus the 1-hour reconciliation fit inside that window |
| An SMT check of `agents_never_pay` | the binding table at deployment |
| An experiment design, with a warning | the randomized binding and `fill_rate`. Suggestions shown to one party change which slots are open for others, so randomizing per party lets read coupling cross between variants; the compiler reports the spillover and outputs a switchback design that randomizes by day |
| An agent API | the choices and their types, without presentation |
| A migration check | replaying stored records through the `migrate` operator and through recomputation under version 2; the flow is unchanged, so every location of an open choice maps to itself |

None of these outputs is written by hand, and each stays correct when the module changes.

## The same constructs in other products

A language for the theory should express other products without new constructs. Five products differ from reservations in the class of their choices and the resolvers they bind:

| Product | Choices and resolvers | Functions and power level | Ordered scopes | Characteristic law |
| --- | --- | --- | --- | --- |
| Shared document | edits by people and by an AI co-editor, short response deadline | the document is a level-2 query over the edits for both the text, as in a sequence CRDT, and the outline | structural moves, one scope per document | concurrent edits merge to the same document in any order |
| Multiplayer game | inputs per tick by players and bots | the next state is a level-3 total step function of the previous state and the inputs | one per match, sequenced on a server at a fixed tick rate | the step function is deterministic, so every replica computes the same state |
| Tax interview | answers by a person, some prefilled by a model from uploaded documents | the next question is level-1 control over earlier answers | the submission, sealed on the person's device | every required answer is present before submission, checked by enumerating paths |
| Coding agent | the next step by an AI agent; tool results from external systems; pushes and deployments by a person | level-4 control in the agent; repository state as a function of edits | pushes to each branch | deployments are never bound to a model |
| Feed ranking | the order of items per impression, by a learned resolver with recorded probabilities | engagement and features as level-1 and level-2 queries | none | the guardrails on the engagement goal hold for each variant |

Each row uses only choices, resolvers, records, functions at some power level, bindings, laws, and goals.

## The language in one page

The language has three kinds of definition and seven kinds of declaration.

**Definitions.**

1. **Types** describe the values that choices produce. They are constraints at level 0, and combining types is unification.
2. **Functions** are deterministic maps from a set of records to a value. Each function has a power level from 0 to 4: constraints, queries, recursive queries, total functions, or general recursion. The compiler infers the lowest level whose syntax the code fits and checks it against the level the file declares.
3. **Choices** are declared with a name, a view, options, a timeout, a default, and optionally a response deadline, and each `choose` opens a choice identified by the name and its address in the run. `choose` is the only effect apart from nontermination at level 4. A choice marked `acts` changes the world when presented, so the runtime presents it under its identifier and opens it only from final outputs. Interactive code (`flow`) is notation for a function from the records to the set of open choices, and its control has a power level like any other function. Options that refer to things have identifier types. A signature without a body is a choice whose default resolver is an AI model. `admit` is `choose` applied to a scope's admission choice.

**Declarations.**

1. **Bindings** map choices to resolvers: a function, a randomizer, a person, an AI model, another program, or a sequencer. A randomized binding records its probabilities and is an experiment.
2. **Scopes** set what the compiler cannot derive about an ordered scope: placement, durability, trust, seal schedule, retention, and whether devices receive records or outputs. A scope declaration may add coordination but not remove it.
3. **Laws** state invariants, temporal properties, and properties of bindings, merges, and migrations. Each law is checked by the method its content allows: derived sequencing, model checking, SMT solving, construction, replay, proof, or runtime monitoring.
4. **Commitments** declare laws over other programs' records that the program depends on (`rely`) and laws over its own records that it publishes (`commit`).
5. **Goals** declare a function, a direction, and guardrails, read by analytics, experiments, and learning resolvers.
6. **Presentation** maps views to intents and intents to components per channel. Layout is a choice over a component catalog.
7. **Releases** declare program versions and migrations. Choice identifiers are stable across releases that do not change what a choice's value means, and open choices move to the new version by a map the compiler checks.

**Organization.** Files belong to notions, one per concept. Each file has an orientation (inward, process, outward), a determination (universal, particular, individual), a power level, and an effect. Imports point only toward inward and universal files.

**Compiler outputs.** From the source, the compiler derives the record schema, the ordered scopes and their sequencers, the polarity of each edge and the strata it divides the program into, the views that can show provisional values, the scopes whose seals each choice that acts must wait for, the commitments each choice that acts depends on, model-checking and solver results for laws, experiment designs with coupling warnings, an API for AI agents, migration checks with a map of open choices for each release, and a check that every scope declaration only adds coordination. The runtime's configuration is read from the same source.

## Open problems

1. **Inferring the lowest level.** A tool could infer the lowest power level each function needs and list refactorings that lower the level, such as rewriting a level-4 procedure that only reads the records as a level-1 query. The same tool could list refactorings that make an unknown polarity known, such as replacing a test for an exact count with a threshold.
2. **Migrating functions.** Replay tests the migration square only on runs that occurred. A compiler could check whether the old state determines the new one, so that a migration of stored state exists at all. For queries this is the [determinacy problem](https://arxiv.org/abs/1501.01817) for database views, which is undecidable even for conjunctive queries.
3. **Measuring response deadlines.** A declared deadline lets the compiler determine where provisional values are needed, but the right deadline depends on the resolver and the channel: a person tapping a screen, a person speaking, and an AI agent tolerate different delays. Which deadlines can be declared in advance, and how a declared deadline is checked against delays measured in use, is open.
4. **Validating laws.** If proofs become cheap, a wrong law becomes the main risk. Methods to test laws against recorded behavior, and against what the people affected intended, are still informal.
5. **Specifications for unresolved names.** An `ensures` clause constrains what a model may return, but not whether the result is good. How much of a choice's quality can be stated as a law, and how much must be measured as a goal, is unsettled.

[The theory](/universal-theory-of-interactive-software) gives the primitives and principles, [the runtime](/universal-runtime-for-interactive-software) executes them, and the language above makes each principle visible in source, where a compiler can check that the program follows the principle. [Old Foundations, New Agents](/durable-universals-agentic-ai-engineering) covers the older ideas that agent systems still depend on: state machines, logs, consensus, and the separation of authority from capability.
