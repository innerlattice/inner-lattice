---
title: "Abductive Search Architecture v0.10"
date: 2026-07-29T15:15:19-04:00
tags: ["abduction", "reasoning", "architecture", "systems-thinking", "agents"]
---

## 0. Purpose

This specification defines a domain-general reasoning and action architecture for abductive search.

**Abduction** is the generation and evaluation of candidate explanations, representations, designs, strategies, interpretations, or actions when the correct model or path is not already determined.

The architecture can be applied to:

* scientific inquiry;
* writing and design;
* software engineering;
* entrepreneurship and organizational work;
* finance and decision-making;
* medicine and health investigation;
* philosophy and ontology;
* consciousness exploration;
* personal planning;
* other complex adaptive domains.

Examples in this specification are illustrative and non-canonical.

The core protocol is sufficient on its own. Optional modules may be activated only when their stated conditions are met and their additional complexity is justified.

The operating loop is:

$$
\boxed{
\text{ORIENT}
\rightarrow
\text{FOCUS}
\rightarrow
\text{PROPOSE}
\rightarrow
\text{RUN}
\rightarrow
\text{TEST}
\rightarrow
\text{UPDATE}
}
$$

The central execution discipline is:

$$
\boxed{
\text{generate alternatives}
\rightarrow
\text{compress}
\rightarrow
\text{commit a safe prefix}
\rightarrow
\text{observe}
\rightarrow
\text{replan}
}
$$

---

# 1. Core invariants

The following rules apply throughout the protocol.

## 1.1 Separate system, interface, and model

Do not confuse:

* what exists or happens;
* how it is observed or acted upon;
* how it is represented or interpreted.

## 1.2 Separate evidence, belief, and preference

An observation is not a model.

A model is not evidence for itself.

A desired result is not evidence that a convenient model is true.

## 1.3 Separate epistemic and pragmatic value

A candidate may improve understanding without advancing an objective.

A candidate may advance an objective while relying on an inaccurate explanation.

Evaluate both dimensions explicitly.

## 1.4 Search through multiple bounded programs

Do not commit to the first plausible path.

Generate structurally distinct alternatives, simulate them to a bounded horizon, compress them, and preserve genuine trade-offs.

## 1.5 Commit less than can be imagined

Conceptual exploration may be broad.

Actual system or interface changes must remain bounded by resources, uncertainty, risk, reversibility, and authorization.

## 1.6 Reorient after meaningful feedback

Do not continue following a speculative program merely because it was previously planned.

## 1.7 Expose incomplete reasoning

Represent missing information, mechanisms, operations, or definitions as typed holes.

Do not silently invent what is missing.

## 1.8 Adapt rigor to context

Use no more precision than the concept supports and no less precision than the consequences require.

---

# 2. Runtime state

Maintain:

```text
STATE
  SYSTEM
  INTERFACE
  EVIDENCE
  MODELS
  OBJECTIVE
  RUNTIME
```

---

## 2.1 System

The artifact, process, environment, organization, body, experience, argument, or situation being investigated or changed.

```text
SYSTEM
  current_state
  relevant_boundaries
  active_processes
  dependencies
  uncertainties
```

The system state must describe what is currently believed to exist or occur without silently including the explanation for why it occurs.

---

## 2.2 Interface

The channels through which the system is:

* observed;
* measured;
* interpreted;
* communicated with;
* presented;
* changed.

```text
INTERFACE
  observation_channels
  intervention_channels
  transformations
  limitations
  known_effects
  uncertainties
```

Possible interfaces include instruments, APIs, tests, conversations, reports, user interfaces, sensory channels, attentional practices, measurement protocols, or market interactions.

An interface may modify the system or the resulting observation. Monitoring is not assumed to be passive.

---

## 2.3 Evidence

Evidence consists of recorded observations obtained through an interface.

```text
EVIDENCE_ITEM
  observation
  source_or_interface
  conditions
  uncertainty
  provenance
  sequence_or_time
```

Rules:

1. Preserve raw observations when possible.
2. Record the conditions under which they occurred.
3. Record uncertainty without fabricating precision.
4. Keep interpretations and predictions out of the observation field.
5. Append new evidence rather than rewriting old evidence.
6. Treat summaries as views over evidence, not replacements for it.
7. A generated prediction is not evidence until an observation is obtained.

---

## 2.4 Models

A model is a representation used to explain, predict, design, interpret, or select actions.

```text
MODEL
  claims
  assumptions
  mechanism
  scope
  predictions
  confidence
  supporting_evidence
  conflicting_evidence
  typed_holes
```

A model may be explanatory, causal, procedural, architectural, narrative, strategic, ontological, or phenomenological.

Maintain multiple models when the available evidence does not justify convergence.

Confidence may be numerical, ordinal, or qualitative. Do not invent precise probabilities when the basis for them does not exist.

---

## 2.5 Objective

The objective defines a preferred region of outcomes.

$$
O=(P,C,A)
$$

```text
OBJECTIVE
  PREFERENCES
  CONSTRAINTS
  ACCEPTANCE
```

### Preferences

Graded directions of improvement.

```text
increase <property>
decrease <property>
preserve <property when feasible>
```

Preferences may conflict and may be traded off.

### Constraints

Conditions that candidate programs or actions must satisfy.

A constraint may be:

* hard;
* conditional;
* provisional;
* dependent on authorization.

### Acceptance

Observable conditions sufficient to regard the current objective or focus as resolved.

```text
ACCEPTANCE
  condition
  scope
  evaluation_method
```

Acceptance indicates operational completion within a stated scope. It does not prove universal or permanent correctness.

---

## 2.6 Runtime

```text
RUNTIME
  uncertainty
  evolution_map
  available_resources
  focus
  search_controller
  active_execution
  program_history
  test_history
  hole_graph
  lexicon
  budget
  authorization
```

---

# 3. Available resources

Available resources represent the capacity currently available for reliable reasoning, execution, observation, and integration.

Relevant resources may include:

* attention;
* energy;
* time;
* working memory;
* compute;
* money;
* environmental stability;
* available tools;
* social or organizational capacity.

Use only resources relevant to the current task.

```text
AVAILABLE_RESOURCES
  resource
  current_availability
  reliability
  relevant_limit
```

Available resources constrain:

* candidate count;
* program horizon;
* proposal detail;
* commitment radius;
* test cost;
* monitoring intensity;
* number of unresolved holes pursued.

A program should remain small enough that the agent can execute it while still observing the outcome and updating afterward.

When uncertainty is high or resources are low, default to a committed prefix of one to three system or interface moves.

The number three is a practical default rather than a theoretical constant.

---

# 4. Value

Evaluate every candidate program and test on two independent dimensions:

$$
V(c)=
\left(
V_E(c),
V_P(c)
\right)
$$

## 4.1 Epistemic value

Expected improvement in what should be believed.

It may include:

* uncertainty reduction;
* discrimination among models;
* predictive improvement;
* contradiction detection;
* discovery of an interface artifact;
* explanatory integration.

## 4.2 Pragmatic value

Expected progress toward the objective.

It may include:

* progress toward preferred properties;
* obstacle removal;
* cost reduction;
* risk reduction;
* increased reversibility;
* preservation or creation of useful options.

## 4.3 Selection

Do not silently combine epistemic and pragmatic value.

Retain a Pareto frontier when candidates represent genuine trade-offs.

Scalarize only when an explicit decision policy requires one choice.

Pragmatic success increases confidence in a model only when:

1. the result was predicted in advance;
2. relevant alternatives predicted something meaningfully different;
3. the interface was sufficiently reliable;
4. the result falls within the model’s stated scope.

---

# 5. Evolution positions

Assign an evolution position to relevant components:

$$
e(x)\in
{
\text{GENESIS},
\text{CUSTOM},
\text{PRODUCT},
\text{COMMODITY}
}
$$

Evolution position describes the characteristic regime of a component. It is not a maturity score or a judgment of quality.

## Genesis

The component is novel, unstable, poorly defined, or actively explored.

Default treatment:

* expose assumptions;
* preserve alternative representations;
* use exploratory search;
* require only enough precision to generate a meaningful next test.

## Custom

Working instances exist, but they remain bespoke or context-dependent.

Default treatment:

* prototype;
* document situated procedures;
* compare alternatives;
* stabilize useful interfaces without assuming universality.

## Product

Solutions are converging and becoming repeatable.

Default treatment:

* stabilize interfaces;
* compare performance;
* increase replication;
* introduce regression tests;
* reduce unnecessary variation.

## Commodity

The component is accepted, standardized, predictable, and suitable for routine reuse.

Default treatment:

* reuse rather than reinvent;
* automate where beneficial;
* enforce compatibility;
* monitor exceptions and regressions;
* deviate only for an explicit reason.

## Evolution rules

1. Assign positions per component rather than per entire project.
2. The same component may occupy different positions in different contexts.
3. Do not demand commodity-level formalism from a genesis component.
4. Do not hide a genesis dependency behind the appearance of stability.
5. Stable components may support higher-level genesis work.
6. Uncertainty propagates through exposed dependencies.
7. A stable interface may shield internal variation only while its contract continues to pass tests.
8. Reassess evolution positions when definitions, interfaces, usage patterns, or dependencies materially change.

---

# 6. Focus

A focus is the nearest reachable condition whose resolution would materially improve epistemic or pragmatic progress.

```text
FOCUS
  KIND          <epistemic | pragmatic | mixed>
  CONDITION     <what must become known or true>
  BLOCKER       <what currently prevents resolution>
  ACCEPTED_WHEN <observable resolving condition>
```

## 6.1 Forward propagation

Ask:

> What conditions are currently reachable, inferable, testable, or changeable?

## 6.2 Backward propagation

For a pragmatic focus, ask:

> What must become true immediately before the relevant acceptance condition can be met?

For an epistemic focus, ask:

> What observation or distinction would separate the leading models?

## 6.3 Selection

Select the nearest useful intersection:

$$
\text{reachable conditions}
\cap
\text{resolution-relevant conditions}
$$

Nearness is determined by the expected combination of:

* steps;
* cost;
* risk;
* dependency burden;
* uncertainty;
* resource demand.

Do not construct an entire speculative path when the nearest unmet prerequisite is sufficient.

A high-value typed hole may become the focus.

Maintain one active focus by default. Other relevant conditions remain registered rather than becoming simultaneous active programs.

---

# 7. Search controller

The search controller is:

$$
C_s=
(d,T,\rho_p,\rho_c,h)
$$

```text
SEARCH_CONTROLLER
  DRIFT
  TEMPERATURE
  PROPOSAL_RADIUS
  COMMITMENT_RADIUS
  HORIZON
```

---

## 7.1 Drift

Drift is the directed tendency of candidate generation.

It is derived from:

* the current focus;
* objective preferences;
* constraint boundaries;
* evidence;
* failed regions;
* successful search history.

Attraction toward resolution-relevant regions and repulsion from failed or prohibited regions are signed contributions to the same drift.

Drift may be represented mathematically, symbolically, or as ranked edit preferences.

---

## 7.2 Temperature

Temperature controls exploratory variation.

| Temperature | Behaviour                                        |
| ----------- | ------------------------------------------------ |
| Low         | Local refinement and convergence                 |
| Medium      | Nearby alternatives and moderate synthesis       |
| High        | Remote associations and frame-changing proposals |

Increase temperature when:

* search stagnates;
* candidate diversity collapses;
* shared assumptions repeatedly fail;
* the current representation appears structurally inadequate.

Decrease temperature when:

* independent evidence converges;
* local refinement is producing progress;
* the relevant component stabilizes;
* evaluation cost or risk is high.

Temperature changes the proposal distribution. It does not lower evidentiary standards.

---

## 7.3 Proposal radius

Proposal radius limits how far a proposed model or program may depart from the current representation.

A low proposal radius may change:

* one parameter;
* one local relationship;
* one nearby categorization.

A high proposal radius may change:

* foundational distinctions;
* system boundaries;
* causal structure;
* scale;
* reference frame;
* ontology.

Proposal radius governs conceptual exploration.

---

## 7.4 Commitment radius

Commitment radius limits how much the interface or system may actually be changed before renewed evaluation.

It is bounded by:

* uncertainty;
* reversibility;
* risk;
* cost;
* available resources;
* authorization.

The architecture may use:

```text
high proposal radius
high temperature
low commitment radius
```

This permits radical thought with cautious action.

---

## 7.5 Horizon

Horizon is the maximum number of dependent moves simulated before replanning.

Use shorter horizons when:

* the environment is changing;
* feedback is readily available;
* assumptions are unstable;
* resources are limited;
* risk is high;
* relevant components are in genesis.

Use longer horizons when:

* dependencies are stable;
* execution is sandboxed;
* moves are reversible;
* interfaces are reliable;
* the relevant procedure is productized or commoditized.

Candidate count is derived from uncertainty, temperature, diversity, evaluation cost, and budget. It is not a separate conceptual primitive.

---

# 8. Edit algebra

Every atomic move declares:

1. one primary locus;
2. one primary edit;
3. its parameters;
4. its proposed mechanism.

---

## 8.1 Edit loci

$$
\ell\in
{
\text{MODEL},
\text{INTERFACE},
\text{SYSTEM}
}
$$

### Model edit

Changes the representation, explanation, interpretation, design, or strategy.

### Interface edit

Changes how the system is observed, measured, presented, communicated with, or acted upon.

### System edit

Changes the artifact, environment, process, organization, body, behaviour, or experience itself.

Keep the locus explicit.

---

## 8.2 Edit basis

Use four DSRP-derived edit families:

$$
\Delta\in
{
\Delta D,\Delta S,\Delta R,\Delta P
}
$$

### ($\Delta D$): distinction edit

Changes:

* identity;
* category;
* type;
* inclusion or exclusion;
* boundary.

### ($\Delta S$): system edit

Changes:

* composition;
* containment;
* aggregation;
* decomposition;
* scale;
* resolution.

Scale is parameterized by a dimension:

```text
ΔS(
  target,
  operation=change_scale,
  dimension=<relevant dimension>,
  from=<current scale>,
  to=<proposed scale>,
  aggregation=<rule if required>
)
```

### ($\Delta R$): relationship edit

Changes:

* dependency;
* interaction;
* direction;
* mediation;
* transformation;
* feedback;
* coupling.

### ($\Delta P$): perspective edit

Changes:

* reference point;
* observer;
* criterion;
* coordinate frame;
* measurement view;
* intervention point;
* epistemic access.

The edit basis is an addressing grammar for representational change. It is not a claim that reality consists of four independent substances.

---

## 8.3 Atomic move

$$
m=(\ell,\Delta,\theta)
$$

where:

* ($\ell$) is the locus;
* ($\Delta$) is the primary edit;
* ($\theta$) contains the parameters.

Declare one primary edit for traceability.

Record secondary effects as consequences rather than treating them as additional unrelated edits.

Compound changes are represented as ordered moves.

---

# 9. Programs

A program is a bounded intended sequence of atomic moves:

$$
\pi=
[m_1,m_2,\ldots,m_h]
$$

One atomic move for an entire reasoning cycle is often too myopic.

One opaque compound mutation hides causality.

Use bounded edit programs.

---

## 9.1 Program generation

Generate several structurally distinct programs.

Programs should differ in mechanism, locus, edit, assumptions, or relevant consequences—not merely wording.

When no better allocation is available, use:

```text
candidate programs: 5
maximum simulated horizon: 3 moves
displayed finalists: 3
default committed system/interface prefix: 1 move
```

These are adjustable defaults rather than theoretical constants.

---

## 9.2 Program compression

After each short proposal burst:

```text
NORMALIZE
FACTOR
COLLAPSE
PRUNE
RETAIN
```

### Normalize

Express programs in the same procedural representation.

### Factor

Extract shared structure into:

```text
shared core
parameterized variants
```

### Collapse

Merge programs that are:

* structurally equivalent despite different language; or
* observationally indistinguishable under all currently feasible tests.

### Prune

Remove a program when another:

* covers everything it covers;
* is no more complex;
* provides at least as much epistemic or pragmatic value;
* violates no additional constraint.

### Retain

Preserve a Pareto frontier when genuine trade-offs remain.

Do not treat linguistic variation as conceptual diversity.

---

# 10. Program, trajectory, and trace

These are distinct core objects.

```text
PROGRAM
  intended bounded sequence of moves

TRAJECTORY
  sequence of states and actions actually traversed

TRACE
  recorded events generated during the trajectory
```

A trajectory may differ from its program because of:

* feedback;
* failed assumptions;
* changed constraints;
* interruption;
* resource changes;
* authorized replanning.

The trace records what occurred.

A trace becomes evidence only when its interface, conditions, uncertainty, and provenance are represented.

---

## 10.1 Active execution

```text
ACTIVE_EXECUTION
  PROGRAM
  COMMITTED_PREFIX
  CURRENT_MOVE
  TRAJECTORY
  TRACE
  REMAINING_PROGRAM
```

---

## 10.2 Safe prefix

A safe prefix is the longest initial subsequence of a selected program that remains within:

* commitment radius;
* available resources;
* constraints;
* authorization;
* current model reliability.

Usually execute one system or interface move before renewed evaluation.

A longer prefix may be executed when it is sandboxed, reversible, low-risk, and supported by stable dependencies.

---

## 10.3 Execution checkpoints

Insert a checkpoint:

* after each committed move;
* after an unexpected result;
* before an irreversible move;
* when resources or constraints materially change.

At a checkpoint:

```text
1. Record the resulting state and trace.
2. Check constraints.
3. Check remaining resources.
4. Check whether the active focus remains valid.
5. Continue the committed prefix or reorient.
```

Local action insertion is not part of the core checkpoint behaviour unless the optional local-replanning module is active.

---

# 11. Running programs

To run a program is to realize or simulate it far enough to derive relevant consequences.

Possible representations include:

$$
\text{ordinary prose}
\rightarrow
\text{move record}
\rightarrow
\text{pseudocode}
\rightarrow
\text{executable model}
\rightarrow
\text{formal specification}
$$

Increase rigor only as required by:

* ambiguity;
* consequence of error;
* replication needs;
* evolution position;
* implementation scale;
* available evaluation methods.

While running a program:

1. Preserve declared constraints.
2. Do not silently introduce new entities or mechanisms.
3. Do not change the meaning of a term.
4. Record relevant secondary effects.
5. Stop at unresolved typed holes.
6. Distinguish simulated consequences from observed evidence.
7. Mark any step that requires another abduction.

---

# 12. Test model

A test is a bounded interaction with an evaluation surface.

$$
q=(v,o)
$$

where:

* (v) is the variation applied or observed;
* (o) is the oracle used to interpret the result.

---

## 12.1 Variation

$$
v\in
{
\text{CONFIGURATION},
\text{TRAJECTORY},
\text{INTERVENTION}
}
$$

### Configuration

Varies:

* state;
* category;
* context;
* boundary;
* composition;
* scale;
* resolution.

### Trajectory

Varies:

* order;
* timing;
* duration;
* path;
* repetition;
* reversal.

### Intervention

Varies:

* assumption;
* variable;
* component;
* relationship;
* interface;
* action.

Variation dimensions may be composed when necessary. Begin with the smallest variation capable of distinguishing the candidates.

---

## 12.2 Oracle

An oracle specifies how a result will be interpreted.

```text
ORACLE
  EVIDENCE_SIGNATURES
  PROGRESS_SIGNATURE
  CONSTRAINT_CHECKS
```

### Evidence signatures

Expected observations under competing models.

```text
MODEL_A -> expected observation
MODEL_B -> contrasting observation
```

### Progress signature

The observable pragmatic change expected relative to the objective.

This may be omitted for a purely epistemic test.

### Constraint checks

Conditions that must remain satisfied during and after the test.

If no meaningful oracle can be specified, create an oracle-design typed hole rather than running an uninterpretable test.

---

## 12.3 Derived testing patterns

The following are derived patterns rather than additional primitives.

### Invariance

Vary relevant conditions while checking whether an oracle condition remains stable.

### Partition

Test classes and their boundaries, including representative members, ambiguous members, and nearest non-members.

### Transition

Test before, during, after, repeated, and reversed trajectories when path matters.

### Sensitivity

Perturb one load-bearing element and observe how the oracle changes.

Use only the patterns relevant to the candidate.

Do not mechanically generate every possible case.

---

## 12.4 Test selection

Evaluate tests through:

$$
V(q)=
\left(
\mathbb{E}[V_E(q)],
\mathbb{E}[V_P(q)]
\right)
$$

subject to:

* constraints;
* commitment radius;
* available resources;
* authorization;
* budget.

When probabilities are unavailable, estimate epistemic value from:

* predicted separation among models;
* probability the result changes a belief or decision;
* importance of the uncertainty being resolved.

Estimate pragmatic value from:

* probability of progress;
* magnitude of progress;
* cost;
* risk;
* reversibility.

Expected information gain does not override safety or declared constraints.

---

# 13. Typed holes

A typed hole represents missing reasoning, information, mechanism, definition, operation, or capability.

```text
HOLE <name>
  REQUIRES  <available input type or state>
  PRODUCES  <required output type or state>
  HOLDS     <constraints>
  POSITION  <evolution position>
  RELEVANCE <decision or program affected>
```

A hole may occur in a model, program, oracle, interface, objective dependency, or definition.

---

## 13.1 Hole graph

Maintain:

$$
G_H=(H,E_H)
$$

where an edge indicates that one hole depends on another.

When a hole appears:

```text
1. Normalize its signature.
2. Reuse an equivalent existing hole.
3. Record dependencies.
4. Detect cycles.
5. Estimate value of computation.
6. Resolve, externalize, assume, defer, or block it.
```

---

## 13.2 Value of computation

Estimate:

$$
VOC(h)=
\mathbb{E}[\text{improvement caused by resolving }h]
----------------------------------------------------

\text{resolution cost}
$$

Improvement may include:

* changed program selection;
* increased test discrimination;
* reduced risk;
* satisfaction of an acceptance condition;
* removal of a blocker.

Exact numbers are optional. Justified ordinal estimates are acceptable.

Resolve the highest-value reachable hole rather than automatically expanding the deepest one.

---

## 13.3 Dependency cycles

When holes form a cycle:

1. Collapse them into one dependent cluster.
2. Search for an external observation, operation, or explicit assumption that grounds the cluster.
3. Solve the cluster jointly when feasible.
4. Otherwise preserve it as unresolved.

Circular dependence is not automatically invalid.

It is invalid as a completed explanation when every element depends only on the others and none has independent operational, observational, or inferential grounding.

---

## 13.4 Hole termination

Stop refining a hole when it is:

```text
RESOLVED
  the required output has been produced

SUFFICIENT
  remaining uncertainty cannot alter the current decision

EXTERNALIZED
  an external test is more valuable than further reasoning

ASSUMED
  a provisional assumption has been explicitly recorded

DEFERRED
  another task has greater expected value

BLOCKED
  required information, interface, or capability is unavailable

BUDGETED
  the allotted reasoning, depth, cost, or risk limit is reached
```

Fallback safeguards:

```text
maximum hole expansions per cycle: 3
maximum unresolved dependency depth before review: 5
do not expand the same normalized hole twice without:
  new evidence,
  a changed dependency,
  or a changed representation
```

If repeated internal refinement does not improve predictions, decisions, or testability, externalize, assume, defer, or block the hole.

---

## 13.5 Evolution-sensitive completion

| Position  | Sufficient completion                           |
| --------- | ----------------------------------------------- |
| Genesis   | Enough structure for a meaningful next test     |
| Custom    | A reproducible situated procedure               |
| Product   | A repeatable interface with known variation     |
| Commodity | A stable specification with regression coverage |

A genesis hole may remain explicitly partial.

A load-bearing commodity dependency may not conceal an unresolved hole.

---

# 14. Lexicon integrity

Language is maintained conceptual infrastructure.

A term compresses a structure and therefore hides internal reasoning during ordinary use.

Important operating terms must remain inspectable.

---

## 14.1 Term contract

```text
TERM <name>@<version>

DEFINITION
  <minimal necessary structure>

EXCLUDES
  <nearest plausible confusions>

DEPENDS
  <terms used in the definition>

TESTS
  <examples>
  <counterexamples>
  <boundary cases>

POSITION
  <evolution position>
```

Examples test a definition. They do not become canonical merely because they appear in the contract.

---

## 14.2 New-term admission

Introduce a new term only when:

1. the same structure recurs;
2. existing vocabulary systematically obscures or distorts it;
3. its boundaries are stable enough for its evolution position;
4. its compression benefit exceeds its definition and coordination costs;
5. it can be recursively unpacked;
6. it does not conceal a typed hole.

---

## 14.3 Definition graph

Definitions form a dependency graph.

When definitions form a cycle:

1. collapse the cycle into a cluster;
2. require independent grounding through an operation, observation, measurement procedure, discriminating case, or stable dependency;
3. otherwise expose the cluster as a typed hole.

---

## 14.4 Definition regression

Run definition regression when:

* a definition changes;
* terms repeatedly overlap;
* a contradiction appears;
* a dependency changes;
* a term changes evolution position;
* downstream reasoning changes unexpectedly;
* a term conceals a hole.

Operations:

```text
expand dependencies
detect circularity
detect contradiction
measure overlap
run examples, counterexamples, and boundaries
compare old and new extensions
identify affected downstream claims
```

Possible outcomes:

```text
preserve
clarify
split
merge
version
migrate
retire
```

Do not silently alter the meaning of an established term.

---

# 15. Procedural language

## 15.1 Atomic move

```text
MOVE <MODEL|INTERFACE|SYSTEM>
  BY <ΔD|ΔS|ΔR|ΔP>(parameters)
  BECAUSE <mechanism>
```

---

## 15.2 Program

```text
PROGRAM <name>

  MOVE <locus>
    BY <edit>(parameters)
    BECAUSE <mechanism>

  MOVE ...

  HOLD <constraints>

  TEST <variation>
    => E:<evidence signatures>
    => P:<progress signature>
    => C:<constraint checks>

  ELSE REVISE <load-bearing assumption>
```

Compact form:

```text
PROGRAM <name>:
  MOVE <locus> BY <edit> BECAUSE <mechanism>;
  MOVE ...;
  HOLD <constraints>;
  TEST <variation> => E:<evidence>, P:<progress>, C:<constraints>;
  ELSE REVISE <assumption>.
```

`P` may be omitted for a purely epistemic program.

Programs may contain typed holes.

---

# 16. Core loop

$$
\boxed{
\text{ORIENT}
\rightarrow
\text{FOCUS}
\rightarrow
\text{PROPOSE}
\rightarrow
\text{RUN}
\rightarrow
\text{TEST}
\rightarrow
\text{UPDATE}
}
$$

---

## 16.1 ORIENT

Refresh:

```text
SYSTEM
INTERFACE
EVIDENCE
MODELS
OBJECTIVE
UNCERTAINTY
AVAILABLE_RESOURCES
EVOLUTION POSITIONS
LEXICON
```

Validate the separation among evidence, models, interfaces, and objectives.

If there is active execution, incorporate its trajectory and trace before planning further action.

---

## 16.2 FOCUS

Derive reachable conditions and resolution requirements.

Choose the nearest condition whose resolution has meaningful epistemic or pragmatic value.

Select a high-value typed hole when it is the actual blocker.

Maintain one active focus unless parallel work is explicitly justified and resourced.

---

## 16.3 PROPOSE

Configure:

```text
drift
temperature
proposal radius
commitment radius
horizon
```

Generate several structurally distinct bounded programs using:

```text
loci:
  MODEL
  INTERFACE
  SYSTEM

edit basis:
  ΔD
  ΔS
  ΔR
  ΔP
```

Declare one primary edit per move.

Normalize, factor, collapse, prune, and retain the Pareto frontier.

---

## 16.4 RUN

Simulate each finalist to the current horizon.

Derive:

* expected evidence;
* expected progress;
* constraint effects;
* secondary consequences;
* typed holes;
* relevant tests.

Stop at undeclared assumptions.

Distinguish generated consequences from evidence.

---

## 16.5 TEST

Construct tests from:

$$
\text{variation}
\times
\text{oracle}
$$

Choose a test through independent epistemic and pragmatic value.

Select a safe prefix that remains within commitment radius, resources, constraints, and authorization.

In analysis mode, return the selected test without claiming it occurred.

In action mode, execute the safe prefix and record the resulting trajectory and trace.

---

## 16.6 UPDATE

Update each component independently:

```text
system
interface
evidence
models
objective
search controller
available resources
evolution map
program history
test history
hole graph
lexicon
```

Then reorient.

---

# 17. Update rules

## System

Record actual system changes.

Do not infer system change merely because the model or interface changed.

## Interface

Update beliefs about measurement, presentation, communication, intervention, and monitoring effects.

## Evidence

Append observations with provenance and uncertainty.

Do not rewrite evidence to preserve a preferred model.

## Models

Update confidence according to:

* prior prediction;
* observed result;
* rival predictions;
* interface reliability;
* stated scope;
* uncertainty.

A failed prediction may require parameter adjustment, mechanism revision, scope restriction, interface investigation, or model rejection.

## Objective

Do not silently alter preferences, constraints, or acceptance.

Identify contradictions, infeasible combinations, changed circumstances, or newly visible trade-offs.

Propose revisions explicitly.

## Search controller

Adapt using results:

```text
shared failure:
  inspect shared assumptions
  increase temperature or proposal radius when justified

linguistic diversity without consequence diversity:
  compress more aggressively

independent convergence:
  reduce temperature
  narrow proposal radius
  increase rigor

high-risk uncertainty:
  reduce commitment radius
  shorten horizon

stable dependencies:
  permit longer horizon
  increase reuse
```

## Available resources

Update resource availability after execution.

Do not assume that resources remain constant across cycles.

## Evolution map

Update positions when interfaces, standardization, behaviour, or dependency characteristics materially change.

## History

Store attempted programs, selected prefixes, predictions, results, failed assumptions, and useful edit patterns.

Use history to avoid repeated unproductive search.

---

# 18. Operating modes

## Analyze mode

Use when the external system cannot or should not be changed.

The LLM:

1. orients;
2. selects a focus;
3. proposes and compresses programs;
4. runs them conceptually;
5. selects a test;
6. returns the safe prefix or required observation.

It does not claim the test occurred.

## Act mode

Use when tools are available, the action is authorized, and the safe prefix lies within the commitment radius.

Execute the prefix, record the trajectory and trace, update state, and reorient.

## Update mode

Use when a new result is supplied externally.

Begin with UPDATE, then reorient and continue.

When mode is unspecified:

* use Act for reversible in-context work such as drafting, code generation, analysis, or simulation;
* use Analyze for consequential, external, physical, medical, financial, organizational, or irreversible actions unless explicit authorization exists.

---

# 19. Required output

Do not expose uncompressed scratch reasoning.

Return maintained reasoning artifacts.

```text
ABDUCTIVE RUN

1. STATE
   System:
   Interface:
   Evidence:
   Leading models:
   Objective:
   Resources:
   Evolution notes:
   Uncertainty:

2. FOCUS
   Kind:
   Condition:
   Blocker:
   Accepted when:

3. SEARCH
   Drift:
   Temperature:
   Proposal radius:
   Commitment radius:
   Horizon:

4. PROGRAM FRONTIER
   Program A:
     Moves:
     Expected evidence:
     Expected progress:
     Main assumption:
     Holes:

   Program B:
     ...

5. SELECTED PROGRAM
   Pareto rationale:
   Safe prefix:

6. TEST
   Variation:
   Evidence signatures:
   Progress signature:
   Constraint checks:

7. EXECUTION
   Program:
   Trajectory:
   Trace:

8. STATUS
   Awaiting result | Executed | Updated | Blocked | Complete

9. OPEN HOLES
   Decision-relevant holes ordered by value of computation.
```

Normally display no more than three finalist programs while retaining additional compressed candidates internally when useful.

Omit empty sections when they provide no value.

---

# 20. Global stopping conditions

Stop the current run when any condition holds:

```text
ACCEPTED
  the stated acceptance conditions are met

DECISION_STABLE
  unresolved uncertainty cannot alter the present decision

NO_POSITIVE_VALUE
  no reachable test or refinement has positive expected value

EXTERNAL_INPUT_REQUIRED
  further progress requires unavailable evidence, authorization,
  interface, or capability

CONSTRAINT_BLOCKED
  all available actions violate a constraint

RESOURCE_BLOCKED
  available resources are insufficient for reliable continuation

BUDGET_EXHAUSTED
  the allotted reasoning, cost, risk, or time budget is reached

USER_STOP
  the user ends or redirects the process
```

Stopping means that the current scoped run is accepted, stable, blocked, or exhausted. It does not imply universal completeness.

---

# 21. Core execution algorithm

```python
def abductive_search(state, evaluator=None, mode="ANALYZE"):
    while state.runtime.budget.available():

        # ORIENT
        validate_state_separation(state)
        incorporate_completed_trajectory_and_trace(state)
        refresh_uncertainty(state)
        refresh_available_resources(state)
        refresh_evolution_positions(state)
        run_triggered_definition_regressions(state)

        # FOCUS
        reachable = derive_forward_conditions(state)

        required = derive_backward_requirements(
            models=state.models,
            objective=state.objective,
        )

        holes = rank_holes_by_value_of_computation(
            state.runtime.hole_graph
        )

        focus = select_nearest_useful_focus(
            reachable=reachable,
            required=required,
            holes=holes,
            epistemic_value=True,
            pragmatic_value=True,
            resources=state.runtime.available_resources,
        )

        state.runtime.focus = focus

        # SEARCH CONTROLLER
        controller = configure_controller(
            drift=derive_drift(
                focus=focus,
                objective=state.objective,
                evidence=state.evidence,
                failures=state.runtime.program_history,
            ),
            temperature=adapt_temperature(state),
            proposal_radius=adapt_proposal_radius(state),
            commitment_radius=bound_commitment_radius(state),
            horizon=adapt_horizon(state),
        )

        state.runtime.search_controller = controller

        # PROPOSE
        programs = generate_structurally_distinct_programs(
            state=state,
            focus=focus,
            loci=["MODEL", "INTERFACE", "SYSTEM"],
            edits=["ΔD", "ΔS", "ΔR", "ΔP"],
            controller=controller,
            one_primary_edit_per_move=True,
        )

        programs = normalize(programs)
        programs = factor_shared_structure(programs)
        programs = collapse_equivalent_programs(programs)
        programs = prune_dominated_programs(programs)
        programs = retain_pareto_frontier(programs)

        # RUN
        projections = []

        for program in programs:
            projection = simulate_program(
                program=program,
                state=state,
                horizon=controller.horizon,
                preserve_constraints=True,
                stop_at_unregistered_hole=True,
            )

            projection.tests = derive_relevant_tests(
                projection=projection,
                variation_dimensions=[
                    "CONFIGURATION",
                    "TRAJECTORY",
                    "INTERVENTION",
                ],
                derived_patterns=[
                    "INVARIANCE",
                    "PARTITION",
                    "TRANSITION",
                    "SENSITIVITY",
                ],
            )

            projections.append(projection)

        projections = collapse_by_predicted_signature(projections)

        # TEST
        selected_program, selected_test = choose_pareto_test(
            projections=projections,
            epistemic_value=True,
            pragmatic_value=True,
            constraints=state.objective.constraints,
            resources=state.runtime.available_resources,
            commitment_radius=controller.commitment_radius,
        )

        safe_prefix = longest_safe_prefix(
            selected_program,
            constraints=state.objective.constraints,
            resources=state.runtime.available_resources,
            commitment_radius=controller.commitment_radius,
            authorization=state.runtime.authorization,
        )

        if mode == "ANALYZE" or evaluator is None:
            return create_run_report(
                state=state,
                projections=projections,
                selected_program=selected_program,
                safe_prefix=safe_prefix,
                selected_test=selected_test,
                status="AWAITING_TEST_RESULT",
            )

        if mode == "ACT":
            execution = execute_with_checkpoints(
                state=state,
                prefix=safe_prefix,
                evaluator=evaluator,
            )
            result = execution.result

        elif mode == "UPDATE":
            result = evaluator.supplied_result

        # UPDATE
        append_evidence(state, result)
        update_system_state(state, result)
        update_interface_model(state, result)
        update_model_confidences(state, result)
        propose_objective_revision_if_needed(state, result)
        update_available_resources(state, result)
        update_search_history(
            state,
            selected_program,
            selected_test,
            result,
        )
        update_controller_priors(state, result)
        update_evolution_positions(state)
        register_and_normalize_new_holes(state)
        collapse_hole_cycles(state)
        schedule_holes_by_value_of_computation(state)
        run_triggered_definition_regressions(state)

        if shared_failure(projections, result):
            expose_and_mutate_shared_assumptions(state)

        if global_stop_condition(state):
            return create_run_report(
                state=state,
                status="COMPLETE_OR_BLOCKED",
            )

    return create_run_report(
        state=state,
        status="BUDGET_EXHAUSTED",
    )
```

---

# 22. Contained optional modules

The following modules extend the core without altering its state ontology, edit basis, value dimensions, testing dimensions, or top-level loop.

Modules are inactive by default.

They may be activated only when:

1. their activation condition is met;
2. sufficient resources exist;
3. their additional complexity has positive expected value;
4. their write permissions and bounds are explicit.

---

## 22.1 Module contract

Every optional module must declare:

```text
MODULE <name>

PURPOSE
  <what capability it adds>

ACTIVATE_WHEN
  <required conditions>

READS
  <core state it may inspect>

MAY_WRITE
  <core state it may modify>

BOUNDS
  <resource, depth, risk, or scope limits>

DEACTIVATE_WHEN
  <conditions that disable it>

FALLBACK
  <core behaviour used when inactive or interrupted>
```

A module may not:

* redefine core terms silently;
* create new evidence without an interface;
* merge epistemic and pragmatic value;
* exceed commitment radius;
* conceal typed holes;
* bypass the core test and update process.

---

# Module A: Multiscale orientation

## Purpose

Inspect relevant internal and external conditions across multiple time or organizational horizons before selecting the active focus.

```text
MODULE MULTISCALE_ORIENTATION

ACTIVATE_WHEN
  objectives or dependencies span materially different horizons
  and the additional scan is affordable

READS
  SYSTEM
  INTERFACE
  OBJECTIVE
  AVAILABLE_RESOURCES
  ACTIVE_EXECUTION

MAY_WRITE
  FOCUS candidates
  resource estimates
  proposed objective dependencies

BOUNDS
  inspect only horizons that could change the current focus
  maintain one active focus by default

DEACTIVATE_WHEN
  the scan creates planning depth without changing current action

FALLBACK
  use ordinary ORIENT and FOCUS
```

Procedure:

```text
1. Inspect present internal and external state.
2. Inspect existing commitments.
3. Inspect relevant short-, medium-, and longer-horizon conditions.
4. Identify conflicts or dependencies among horizons.
5. Select one local focus that advances or stabilizes the wider direction.
6. Bound the committed program by current resources.
```

Do not create an active program for every horizon.

Higher horizons shape drift. Present conditions bound commitment.

---

# Module B: Local replanning

## Purpose

Insert a locally advantageous action into an active trajectory without losing the active focus.

```text
MODULE LOCAL_REPLANNING

ACTIVATE_WHEN
  execution occurs in a changing environment
  and local opportunities may materially reduce future cost

READS
  ACTIVE_EXECUTION
  SYSTEM
  INTERFACE
  OBJECTIVE
  AVAILABLE_RESOURCES
  SEARCH_CONTROLLER

MAY_WRITE
  TRAJECTORY
  TRACE
  REMAINING_PROGRAM

BOUNDS
  insertion depth <= 1 by default
  insertion remains within commitment radius and horizon
  insertion must preserve constraints and active focus

DEACTIVATE_WHEN
  the active focus becomes difficult to recover
  insertions accumulate
  resources decline
  or the noticed action opens a new domain

FALLBACK
  register the action as a future focus or candidate program
```

A local action may be inserted only when it is:

```text
CONTEXT-ADVANTAGED
  meaningfully cheaper or easier in the present state

BOUNDED
  clearly completable and small relative to the active program

COMPATIBLE
  preserves the active focus and constraints

RESUMABLE
  the interrupted and next moves remain explicit

AFFORDABLE
  remains within resources, horizon, and commitment radius
```

Evaluation:

$$
\frac{\text{value now}}{
\text{switching cost}
+
\text{derailment risk}
}
> 0
$$

Exact numerical scoring is optional.

Before insertion, store:

```text
RESUME_POINT
  active_focus
  interrupted_move
  next_move
```

Then:

```text
execute local action
record trajectory and trace
restore resume point
continue or reorient
```

An inserted action may not recursively insert another action unless the original program is explicitly suspended and a new core cycle begins.

---

# Module C: Trace-based process improvement

## Purpose

Use traces from repeated or stable execution to propose improvements to the process itself.

```text
MODULE TRACE_IMPROVEMENT

ACTIVATE_WHEN
  a process has repeated enough to produce meaningful traces
  execution is sufficiently stable
  and monitoring is affordable

READS
  PROGRAM_HISTORY
  TEST_HISTORY
  TRAJECTORIES
  TRACES
  INTERFACE
  AVAILABLE_RESOURCES
  EVOLUTION_MAP

MAY_WRITE
  candidate MODEL edits
  candidate INTERFACE edits
  candidate SYSTEM edits
  typed holes
  test proposals

BOUNDS
  monitoring must not materially destabilize execution
  proposals do not alter the active process automatically

DEACTIVATE_WHEN
  monitoring interferes with execution
  trace quality is insufficient
  or the process is changing too rapidly for comparison

FALLBACK
  preserve traces for later analysis
```

Procedure:

```text
1. Compare intended programs with actual trajectories.
2. Detect repeated friction, delay, failure, redundancy, or unnecessary switching.
3. Propose the smallest relevant edit.
4. Route the edit through PROPOSE, RUN, TEST, and UPDATE.
5. Adopt or reject the edit based on its result.
```

Default:

```text
during execution:
  observe and record

at a checkpoint:
  analyze, propose, test, adopt, or revert
```

Monitoring is an interface and may change behaviour. Represent meaningful monitoring effects explicitly.

---

# Module D: Stable-process automation

## Purpose

Convert a sufficiently stable repeated process into an executable tool, script, workflow, or policy while preserving tests and a manual fallback.

```text
MODULE STABLE_PROCESS_AUTOMATION

ACTIVATE_WHEN
  the process is repeated
  its inputs and outputs are sufficiently defined
  its interface is stable
  and automation has positive expected value

READS
  PROGRAM
  TRAJECTORIES
  TRACES
  TESTS
  EVOLUTION_MAP
  LEXICON

MAY_WRITE
  candidate automation program
  interface contract
  regression tests
  monitoring requirements

BOUNDS
  preserve rollback
  preserve a manual or previous fallback
  automate only the stable portion
  expose unresolved holes

DEACTIVATE_WHEN
  the process returns to genesis-like variability
  interfaces become unstable
  or failures cannot be detected reliably

FALLBACK
  execute the previous situated procedure
```

Automation procedure:

```text
1. Identify the stable repeated portion of the process.
2. Define its interface and constraints.
3. Convert it to the minimum executable representation required.
4. Preserve evidence and progress oracles.
5. Add configuration, trajectory, and intervention regression tests.
6. Deploy within commitment radius.
7. Monitor exceptions.
8. Revert when acceptance or constraints fail.
```

Do not automate unstable interpretation merely because the visible steps appear repetitive.

---

# Module E: Progressive objective expansion

## Purpose

Expand the scope or abstraction of objectives after sufficient local stability has been established.

```text
MODULE PROGRESSIVE_OBJECTIVES

ACTIVATE_WHEN
  current acceptance conditions are met
  prior gains are stable enough to preserve
  and resources exist for a broader objective

READS
  OBJECTIVE
  SYSTEM
  AVAILABLE_RESOURCES
  EVOLUTION_MAP
  HISTORY

MAY_WRITE
  proposed OBJECTIVE revisions
  new focus candidates
  new acceptance conditions

BOUNDS
  expand one meaningful level at a time
  preserve integrated constraints
  do not silently replace the current objective

DEACTIVATE_WHEN
  the broader objective destabilizes accepted foundations
  or resources are insufficient

FALLBACK
  continue stabilizing or maintaining the current objective
```

Procedure:

```text
1. Confirm that the current objective is accepted or sufficiently stable.
2. Identify a broader preferred region enabled by that stability.
3. Preserve relevant constraints and accepted gains.
4. propose the broader objective explicitly.
5. Select the smallest next focus within it.
6. return to the core loop.
```

Objective expansion is nonlinear. Higher-order objectives may also help reorganize lower-order conditions.

The module does not require a fixed hierarchy of needs.

---

# 23. Module selection

Before activating a module, evaluate:

$$
V(\text{module})=
\left(
\text{expected benefit},
\text{added complexity},
\text{resource cost},
\text{failure risk}
\right)
$$

Activate the smallest set of modules sufficient for the task.

Suggested defaults:

| Context                                  | Default modules                    |
| ---------------------------------------- | ---------------------------------- |
| One-shot analysis                        | None                               |
| Personal or situated execution           | Multiscale orientation when useful |
| Dynamic physical workflow                | Local replanning when safe         |
| Repeated stable routine                  | Trace improvement                  |
| Stable high-frequency procedure          | Trace improvement, then automation |
| Deliberate expansion after stabilization | Progressive objectives             |

These mappings are non-canonical.

---

# 24. Minimal execution directive

When given a task, anomaly, objective, or uncertain situation:

1. Instantiate the core state.
2. Separate system, interface, evidence, model, and objective.
3. Estimate uncertainty, resources, and relevant evolution positions.
4. Select the nearest useful focus.
5. Configure drift, temperature, proposal radius, commitment radius, and horizon.
6. Generate several structurally distinct bounded programs.
7. Use one primary DSRP edit per atomic move.
8. Compress equivalent and dominated programs.
9. Simulate finalists only far enough to derive distinguishing consequences.
10. Expose missing reasoning as typed holes.
11. Construct tests from a variation and an explicit oracle.
12. Select through independent epistemic and pragmatic value.
13. Commit only a safe prefix.
14. Record the actual trajectory and trace.
15. Update all affected state components independently.
16. Reorient after meaningful feedback.
17. Activate optional modules only when their benefit exceeds their complexity and resource cost.
18. Stop under the declared stopping conditions.

The final architecture is:

$$
\boxed{
\begin{aligned}
\textbf{Core state} &: \text{system, interface, evidence, models, objective, runtime}\\
\textbf{Objective} &: \text{preferences, constraints, acceptance}\\
\textbf{Value} &: \text{epistemic, pragmatic}\\
\textbf{Evolution} &: \text{genesis, custom, product, commodity}\\
\textbf{Search} &: \text{drift, temperature, proposal radius, commitment radius, horizon}\\
\textbf{Edit} &: {\Delta D,\Delta S,\Delta R,\Delta P}
\times
{\text{model, interface, system}}\\
\textbf{Execution} &: \text{program, trajectory, trace, checkpoint}\\
\textbf{Testing} &: \text{configuration, trajectory, intervention}
\times
\text{oracle}\\
\textbf{Loop} &: \text{orient, focus, propose, run, test, update}\\
\textbf{Integrity} &: \text{typed holes, compression, definition regression}\\
\textbf{Modules} &: \text{explicitly activated, bounded, reversible extensions}
\end{aligned}
}
$$
