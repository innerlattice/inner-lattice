---
title: "Toward a universal set of languages for interactive software"
description: "Five restricted languages for values, policies, rules, flows and procedures, plus laws checked at module boundaries, can describe every region of a product, with goals, content design and Agent steps built in."
date: 2026-10-03T12:20:00-04:00
tags: ["software-engineering", "architecture", "systems-thinking", "ontology", "agents"]
---

[Toward a universal runtime for interactive software](/universal-runtime-for-interactive-software) described a substrate of entities, tables, reducers and subscriptions over an append-only log. The substrate says what runs, not what authors write. [GuidedTrack](https://www.guidedtrack.com) shows what an authoring language can offer: its source order matches the order a participant experiences, and one file holds the interface, the experimental design and the data schema. A product with hundreds of flows also needs modules, imports, types, code review and tests, which a single GuidedTrack file does not provide.

Different parts of a product also need different guarantees. Permissions should be analyzable before deployment. Configuration and design tokens should merge from several sources without depending on load order. Metrics should update incrementally as events arrive. A general-purpose language can express all of these, but it guarantees none of them, because a program that may loop or call arbitrary code cannot be analyzed in general.

## The rule of least power

Tim Berners-Lee and Noah Mendelsohn's W3C TAG finding [The Rule of Least Power](https://www.w3.org/2001/tag/doc/leastPower.html) (2006) advises choosing the least powerful language suitable for a given purpose, because data written in a weaker language can be analyzed and reused in more ways. Applied to interactive software, the rule produces a stack of languages in which each restriction buys a specific guarantee.

![Five languages stacked from values to procedures, each with its restriction and guarantee, and laws spanning all of them](../../assets/diagrams/language-ladder.svg "Each language gives up expressive power in exchange for a guarantee that tools can check.")

| Language | Restriction | Guarantee | Precedent | Used for |
| --- | --- | --- | --- | --- |
| Values | no ordering and no functions; values unify | merges in any order; conflicts fail the build | [CUE](https://cuelang.org), [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/) | schemas, content, tokens, configuration |
| Policies | no loops, recursion or side effects | a solver can answer questions about every possible request | [Cedar](https://www.cedarpolicy.com), Biscuit | reads, writes and subscriptions |
| Rules | recursion over finite facts; negation in layers; time explicit | terminates; updates incrementally; marks where coordination is needed | Datalog, Dedalus, Bloom, [Flix](https://flix.dev) | queries, eligibility, goals, metrics |
| Flows | finite steps between commit points; branches chosen by policies | every path can be listed, assigned in balance and replayed | GuidedTrack, priority guides | scripted and adaptive flows, page structure |
| Procedures | effects declared; unresolved names go to Agents | every effect is logged and replayable | Ia, reducers, Hazel | reducers, integrations, Agent steps |

Laws cut across all five. A law states a property of a module, such as "this merge is commutative," and a proof checker verifies it for every input.

The examples that follow split the theory post's sleep study into modules.

## Values

[CUE](https://cuelang.org) places types, constraints and concrete data in one lattice. `int & >=0` is a value, `7` is a more specific value, and unifying the two with `&` yields `7`. Unification is commutative and associative, so files can be combined in any order. Two incompatible values unify to bottom, an error the build reports with both sources.

Schemas, copy, configuration and design tokens are all values in this sense:

```text
// sleep-study/inward/participant.values
participant: {
  id:      string
  age:     int & >=0
  country: string
}

insomnia_symptoms: "Difficulty falling asleep" | "Waking up during the night" |
  "Waking up too early" | "Not feeling well-rested" | "None"

sleepiness_items: ["You could fall asleep instantly", "You are very relaxed"]
sleepiness_scale: {agree: 1, neither: 0.5, disagree: 0}
```

The W3C Design Tokens Community Group published the [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/), a community-group report rather than a W3C Standard, for exchanging tokens between design and engineering tools. A theme expressed as values is the unification of base tokens with a brand's overrides. If a brand sets the same token to two different colors, unification fails during the build instead of letting the later file win at runtime.

## Policies

Amazon Web Services' [Cedar](https://www.cedarpolicy.com) (Cutler et al., OOPSLA 2024) writes authorization rules without loops or recursion. The restriction lets an SMT solver answer questions about all possible requests, such as whether any researcher can read the answers of a participant who withdrew. The Cedar team models the language in Lean and checks the production implementation against that model by differential testing. Biscuit, an authorization token format, carries Datalog checks in the token itself, and any holder can attenuate the token offline by appending more restrictive checks.

```text
// sleep-study/process/access.policy   (Cedar-like)
permit (
  principal in Role::"researcher",
  action == Action::"read",
  resource is Answer
) when { resource.study == principal.study };

forbid (principal, action == Action::"read", resource is Answer)
when { resource.participant.withdrew };
```

In the runtime, a policy also filters subscriptions. A subscription is a standing read, so the same policy that denies a request has to retract rows already sent when a participant withdraws.

## Rules

Datalog sits in the middle of the stack because most of what an interactive product computes from its log is a set of rules over facts. Eligibility, feeds, permissions that depend on relationships, goals and metrics are all queries over answers, assignments and other recorded events. Datalog over finite facts always terminates. [DBSP](https://arxiv.org/abs/2203.16684) can maintain Datalog-style queries incrementally, so a rule updates as new log entries arrive. A rule can also keep its provenance, the facts it was derived from, which answers questions such as why a participant saw a particular branch.

The CALM theorem from the runtime post applies directly to rules. A monotonic rule only adds conclusions as facts arrive, so it can run without coordination. A rule that tests absence with `not`, or that compares an aggregate with a threshold, can be contradicted by a later fact. Peter Alvaro and colleagues' Dedalus made time explicit in Datalog for this reason, and the Bloom language that followed it reports the rules that need coordination.

```text
// sleep-study/process/eligibility.rules
screened_out(p) :- answer(p, "age", a), a < 18.
screened_out(p) :- answer(p, "symptoms", "None").

eligible(p) :- sealed(p, "screening"), not screened_out(p).
```

`not screened_out(p)` asks whether a fact is absent. The rule is safe only after the screening answers can no longer change, so the analyzer requires the `sealed(p, "screening")` condition. The flow below records that seal as a commit point.

### Goals

A goal is a rule with a direction:

```text
// sleep-study/process/goals.rules
change(p, post - pre) :-
  answer(p, "pre_score", pre), answer(p, "post_score", post).

effect(branch, mean(d)) :-
  assignment(p, "intervention", branch), change(p, d).

goal fall_asleep: maximize effect
```

Several features that usually need separate systems read this one declaration. A bandit policy reads `effect` to allocate the next participant. The experiment report is `effect` with confidence intervals. A dashboard plots `effect` over time, and an alert is another rule over `effect`. The analysis plan is fixed in the source before any data arrives, which gives the study a pre-registered outcome without a separate document.

## Flows

A flow is the GuidedTrack layer with imports. It reads like the participant's experience, refers to values and rules by name, and gives each question a stable identifier that survives rewording and reordering.

```text
// sleep-study/process/intake.flow
import { participant, insomnia_symptoms, sleepiness_items, sleepiness_scale }
  from "../inward/participant.values"
import { eligible } from "./eligibility.rules"
import { fall_asleep } from "./goals.rules"

flow intake for participant:
  ask age: participant.age
    "What's your age?"
  ask symptoms: insomnia_symptoms
    "Which symptoms of insomnia do you experience?"
  seal screening
  if not eligible: end screened_out

  ask pre_score: rate(sleepiness_items, on: sleepiness_scale)
  choose intervention {counting_sheep, relaxing_scene}
    by balanced toward fall_asleep
  wait 10 s
  ask post_score: rate(sleepiness_items, on: sleepiness_scale)
  show result
```

Because a flow has finitely many steps between commit points and its conditions are rules over finite facts, questions about a flow can be decided before launch. A checker can list every path, confirm that every path ends, and show that no participant under 18 reaches `pre_score`. The `by balanced` clause names the policy without fixing it, so an operator can later replace balanced assignment with a bandit toward `fall_asleep` without editing the flow.

## Priority guides and design systems

Around 2015, some agencies adopted *priority guides*, a content-first practice in which content designers list, in order of importance, what each page must contain before any layout exists. Each entry was later bound to a design-system component. A priority guide orders content by importance on one screen, and a flow orders steps in time.

```text
// sleep-study/outward/result.guide
guide result for intake:
  1 key_result      "Your sleepiness score changed by {change}"
  2 comparison      pre_score, post_score
  3 explanation     why_scores_move
  4 primary_action  "Join the two-week program"
```

Each line names an intent, such as `key_result`, not a component. The design system's catalog maps intents to components for each channel, and design tokens style the components. The same guide can therefore render as a web page, an email or a voice response. Google's [A2UI](https://a2ui.org) (2025) uses the same separation for agents. An agent sends a declarative description of an interface that refers only to components in a catalog the client trusts, and the client renders those components natively.

`ask` follows the same principle. `ask age: participant.age` declares the value's schema, and the renderer chooses a number field on the web, a keypad prompt by phone or a spoken question in a voice assistant. Content designers can edit the order and the copy of flows and guides as text, review them as diffs, and test alternative copy with a `choose` inside a guide.

## Modules and coordinates

The [notion-architecture](https://github.com/ayahohner/notion-architecture) proposal gives these files a place. It locates each module by orientation to the module boundary (Outward, Process or Inward) and by degree of determination (Universal, Particular or Individual). Imports may point toward Inward and toward Universal, never the reverse. The five languages fall onto that grid:

| | Universal | Particular | Individual |
| --- | --- | --- | --- |
| Inward | schemas and invariants (values) | domain kinds (values) | records in tables |
| Process | policies, laws, rule libraries | procedures and engine rules | flows |
| Outward | design tokens and expression rules | catalog components | priority guides and pages |

The sleep study as a module tree:

```text
sleep-study/
  inward/
    participant.values
  process/
    access.policy
    eligibility.rules
    goals.rules
    intake.flow
    scoring.proc
    laws.bend
  outward/
    tokens.values
    result.guide
```

The grid lets a linter reject an import that runs the wrong way. A guide may read a flow's outputs; a flow may not import a guide, because a Process module must not depend on how it is displayed. The notion-architecture proposal also describes a concrete universal: a contract plus its invariants, lifecycle, declared effects, compatibility rules and conformance tests. Laws are the part of that contract a proof checker can verify.

## Laws

[Bend 2](https://github.com/bendlang/bend), released in September 2026, combines dependent types and linearity with a compiler that targets CPUs and GPUs. A `law` declaration states a property, and a `def` with the same name supplies the proof. The project's own example states that cancelling an order twice equals cancelling it once:

```text
law cancel_idempotent:
  for order: Order
  {cancel(cancel(order)) == cancel(order) : Order}
```

The project's README describes a division of labor. Laws go in `LAWS.bend`, formalized by an AI model from a person's stated rules or edited by the person directly. Proofs go in `PROOF.bend`, written by the model, and the model runs the proof checker after every edit. A change whose proof does not check cannot be committed, whoever wrote it.

Verification for interactive software falls into three tiers:

| Tier | Example | Checked by | Written by |
| --- | --- | --- | --- |
| Decidable from the language | every path ends; no participant under 18 reaches the consent step | exhaustive search or an SMT solver | nobody; tools check it automatically |
| Laws at module boundaries | a merge is commutative, associative and idempotent; a migration commutes with merge; a score stays between 0 and 2 | proof checker | people state or approve the law; models write the proofs |
| Bounds on policies | balanced assignment differs by at most one participant per branch; a bandit sends at least 10% of traffic to control | proofs about the policy's reducer | platform engineers |

Some laws decide whether a design can work at all. [Ia](https://github.com/innerlattice/ia-lang) distinguishes `transmit`, which copies a value, from `move`, which relocates the only instance of something. A Store that only receives copies can merge without coordination. A Store whose contents are moved, such as a seat or an item, fails invariant confluence by definition, so a checker can flag every `move` that lacks a sequencer before the product ships.

## Procedures and Agent-interpreted holes

Procedures are the most expressive layer: reducers, integrations with outside services, and steps performed by Agents. Ia's specification treats an unresolved identifier in Function position as a permitted atomic Function interpreted by its Agent, and an unresolved argument as a domain value whose meaning belongs to that Agent. An unresolved name is not an error:

```text
Researcher.summarize_feedback(free_text_answers) -> feedback_summary
```

No definition of `summarize_feedback` exists. The runtime routes the call to whichever Agent fills the `Researcher` role, whether a person or a language model, and logs the input and output. Cyrus Omar and colleagues' Hazel (POPL 2019) showed that a program with typed holes can still run, with evaluation proceeding around each hole. An Agent-interpreted name is a hole that a person or a model fills at runtime instead of a programmer filling it at edit time.

A hole can still carry a type from the values layer and laws checked against its output at runtime. A summary might be required to cite only answers it received. When an output fails its laws, the flow can retry or hand the step to a person. Replacing a hole with defined steps narrows what the Agent decides, and each remaining hole marks a point where counterfactual replay stops being exact. Tooling can show those points on the flow so authors know which commit points sit behind a value wall.

A procedure written against Universal contracts, rather than against a particular Agent, can run unchanged whether a person, a model or another service fills each role. The theory post's `ask` handlers rely on the same property.

## Precedents

Several languages already combine two or three of these layers. The [Verse calculus](https://dl.acm.org/doi/10.1145/3607845) (Augustsson et al., ICFP 2023), designed for Epic Games' Verse language, joins functional programming with logic variables, unification and choice. [Flix](https://flix.dev) adds first-class Datalog constraints and lattice semantics to a functional language. [Hydro](https://github.com/hydro-project/hydro) compiles dataflow programs written in Rust and locates their coordination points. [Unison](https://www.unison-lang.org) identifies each definition by the hash of its content, which makes renaming free and gives migrations stable identifiers to work with. None of them covers values, policies, rules, flows and procedures with a shared module system.

## Open problems

**One schema across five languages.** Values define the types that rules, policies and flows import. Cedar has its own schema format, so either Cedar schemas are generated from values or the policy language adopts the values layer directly.

**The limits of rules.** Aggregation and negation have to be stratified, and recursion through an aggregate needs lattice semantics such as those in Flix or Bloom<sup>L</sup>. Incremental maintenance over years of log entries is an engineering problem that DBSP addresses for queries but not yet for every goal a product might declare.

**Contracts on holes.** Which laws can be checked against an Agent's output at runtime, and what a flow should do when an output fails, need conventions before teams can rely on them.

**Reviewing across languages.** A change to a policy can hide rows that a priority guide displays, and a change to a rule can make a flow path unreachable. Code review tools show textual diffs, and reviewing this stack needs a view of each change's effects across languages.

**Proofs over effects.** Bend 2 proves properties of pure functions. Reducers write to tables and Agents act in the world, so laws about effectful procedures need a model of those effects that a proof checker accepts.

These languages compile to the runtime described in [Toward a universal runtime for interactive software](/universal-runtime-for-interactive-software), and the regions they serve come from [Toward a universal theory of interactive software](/universal-theory-of-interactive-software). The older ideas the stack depends on, including finite state machines, logs, consensus, information hiding and Datalog, are collected in [Old Foundations, New Agents](/durable-universals-agentic-ai-engineering).
