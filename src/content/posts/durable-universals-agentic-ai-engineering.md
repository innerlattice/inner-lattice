---
title: "Old Foundations, New Agents: The Durable Universals of Agentic AI Engineering"
date: 2026-07-20T01:33:32-04:00
tags: ["agents", "software-engineering", "systems-thinking", "architecture", "security"]
---

Every fast-moving engineering field invents a vocabulary faster than it preserves its lineage. The new terms are often useful: they name a fresh combination of constraints, tools, and failure modes. Trouble starts when the vocabulary persuades us that the underlying problems are new too.

Agentic AI is in that stage. Agent loops resemble feedback controllers. Agent graphs resemble state machines and workflow systems. Memory reaches for the responsibilities of databases, caches, event logs, and knowledge bases. Guardrails revisit access control and runtime monitoring. Evals continue the work of testing, simulation, and operational acceptance.

None of this makes agentic systems ordinary software. Probabilistic interpretation, natural-language interfaces, cheap synthesis, variable competence, and broad tool access create a genuinely unusual engineering surface. But the best way to handle that novelty is to recover the older disciplines that already know something about state, authority, coordination, failure, and proof.

This article is a field guide to those durable ideas. It explains why computing repeatedly rediscovers them, maps agentic terminology to its technical lineages, separates stable architecture from volatile machinery, and offers a practical sequence for adopting the right discipline at the right level of risk.

These ideas are rarely forgotten in the literal sense. They become selectively invisible until a new constraint makes them valuable again. A platform shift can make an old technique cheap enough to use, supply a new metaphor, expose a failure mode that forces rediscovery, or bring in practitioners who did not inherit the earlier field's institutional memory. Sometimes it combines familiar ideas in a materially new way. Graph engineering is a good example: the graphs are old, but their coupling with probabilistic model outputs, tool calls, durable state, evaluation traces, and inexpensive orchestration is not.

The durable advantage is not predicting the next label before everyone else. It is recognizing the stable invariant beneath the label, recovering the lessons that already surround it, and adopting the idea at the smallest useful scale.

*Here, “agentic AI” means systems in which a model can select or influence actions, call tools, retain or retrieve state, iterate, coordinate with people or other agents, and produce externally consequential outputs. Historical dates below identify important lineages or widely cited formal landmarks, not definitive moments of first discovery.*

---

## Why computer science repeatedly “rediscovers” itself

### 1. A change in economics makes an old idea practical

Dynamic programming existed long before modern cloud systems. Event logs existed long before “agent traces.” Capability security existed long before tool permissions. The idea may be old, but the marginal cost of applying it changes.

Examples:

- Falling inference costs make probabilistic generation available at application-loop frequency.
- Hosted queues and APIs make distributed workflows accessible to small teams.
- Fast iteration and code generation make formal interfaces, tests, and policy boundaries *more* valuable because implementation is now cheap and abundant.
- Long-context models make it feasible to treat text as a working memory substrate—though that does not make text a reliable database.

The technique was not wrong before. Its **cost/benefit ratio** changed.

### 2. New participants inherit tools, not lineage

Most practitioners learn from the stack immediately around them:

- Web developers inherit browser APIs and frameworks, not PL research.
- ML engineers inherit notebooks, models, and benchmarks, not necessarily distributed-systems operations.
- Agent builders inherit prompts, tools, and traces, not necessarily transaction processing, access control, workflow engines, or control theory.

This is normal specialization. But it creates recurring local rediscoveries.

### 3. The same invariant appears under a different surface form

The field repeatedly renames familiar structures:

| Agentic phrase | Older lineage |
|---|---|
| Agent loop | Feedback-control loop, reactive system, OODA-like cycle |
| Agent graph | State machine, workflow graph, Petri net, dataflow graph |
| Memory | Database, cache, event log, knowledge base, retrieval index |
| Tool calling | RPC, capability invocation, command pattern, service integration |
| Multi-agent collaboration | Actor model, message passing, distributed workflow, blackboard system |
| Guardrails | Reference monitor, policy enforcement point, runtime monitor |
| Evals | Testing, simulation, operational acceptance testing, statistical experiment |
| Prompt chaining | Pipelines, staged computation, compiler passes, workflow orchestration |
| Context engineering | Data modeling, information retrieval, serialization, interface design |
| Harness engineering | Runtime systems, operating systems, middleware, developer tooling |

The new name is sometimes warranted because it highlights a real domain-specific constraint. The failure happens when the new name encourages people to throw away the older field’s hard-won lessons.

### 4. Negative knowledge decays fastest

Fields preserve success stories better than failure modes. People remember:

> “This workflow graph was powerful.”

They forget:

> “This workflow graph became unmaintainable because it mixed business state, retry logic, model prompts, authorization, and UI edges in the same graph.”

The original discipline often arose after expensive failures:

- transactions after inconsistent updates;
- type systems after representation bugs;
- access-control models after ambient-authority vulnerabilities;
- monitoring after production incidents;
- structured programming after control-flow complexity;
- formal verification after testing proved insufficient for some classes of critical failure.

When a new domain starts, it temporarily gets to repeat those failures.

### 5. Frameworks hide the hard parts—until scale reveals them

A good framework removes friction. It can also conceal the abstraction it embodies.

For example:

- A single-agent demo does not visibly need durable identity, idempotency, permissions, scheduling, cancellation, audit logs, or rollback.
- A production agent handling money, customer data, or irreversible actions needs all of them.
- At that point, its “novel” problems look very much like distributed systems, security engineering, workflow systems, and operations.

### 6. Novel combinations really do matter

The cynical version—“nothing is new”—is also wrong.

Agentic systems combine several characteristics unusually strongly:

1. **Probabilistic interpretation** of open-ended inputs.
2. **Natural-language interfaces** to tools, state, and users.
3. **Cheap synthesis** of code, plans, and content.
4. **Variable competence** across apparently similar tasks.
5. **Non-deterministic execution paths** and hidden internal reasoning.
6. **Potentially real external agency**: emails, commits, purchases, data changes, deployments.
7. **Rapidly changing substrate**: models, tool APIs, context windows, prompt behavior, and provider pricing.

The components are old; the **coupling, scale, accessibility, and failure surface** are comparatively new.

---

## A useful decomposition of an agentic system

Before selecting an “agent framework,” separate the system into its constituent parts.

| Constituent part | Core question | Stable or volatile? | Typical failure if blurred |
|---|---|---|---|
| Intent and success criteria | What outcome counts as success? | Usually stable | The agent optimizes activity, not outcome. |
| Authority and policy | What may it do, under what approval? | Stable | A persuasive model becomes an unauthorized actor. |
| Domain state | What is true about the world? | Stable, versioned | Context text is mistaken for canonical truth. |
| Model adapter | Which model produces a proposal? | Highly volatile | Model/provider churn infects the whole system. |
| Prompt/context assembly | What evidence is supplied for this decision? | Highly volatile | Hidden, unreproducible behavior. |
| Planning and routing | Which next action should be attempted? | Medium volatility | The plan is confused with durable business state. |
| Tool contracts | What operations exist and what do they mean? | Medium stability | Tool calls become untyped, ambiguous side effects. |
| Execution and recovery | How are actions retried, cancelled, or compensated? | Stable engineering concern | Duplicate charges, repeated emails, corrupted state. |
| Memory/retrieval | What is retained, indexed, or summarized? | Mixed | Retrieval artifacts become ungoverned “truth.” |
| Observation/evaluation | How do we know it works and fails safely? | Stable need; volatile implementation | Optimizing anecdotes and demos rather than outcomes. |
| Human oversight | Who can inspect, approve, correct, or stop it? | Stable | Automation silently exceeds its competence envelope. |

The central architectural move is:

> **Keep intent, state, authority, contracts, provenance, and verification stable. Put models, prompts, providers, retrieval strategies, and workflow wiring behind replaceable seams.**

That is the practical application of “decompose by volatility before function.”

---

## Portfolio of durable universals for agentic AI

### Foundations: representation, state, uncertainty, and decision

| Universal | What it is | Earliest important lineage / landmark | Previous rediscovery cycles | Application to agentic AI |
|---|---|---|---|---|
| **Graphs and relations** | Represent entities and their relationships as nodes and edges; use traversal, reachability, paths, cuts, and dependencies. | Euler’s 1736 Königsberg analysis is the classic graph-theory landmark. | Semantic networks, object graphs, UML, knowledge graphs, social graphs, dependency graphs, DAG schedulers. | Use graphs when relationships are the subject: dependencies, authorization delegation, task prerequisites, evidence provenance, and workflow transitions. Do **not** turn every list or simple sequential procedure into a graph. |
| **Finite-state machines and automata** | Make allowed states, transitions, terminal states, and invalid transitions explicit. | McCulloch–Pitts neural automata (1943); formal automata theory matured in the 1950s. | Protocol design, UI state machines, parser generators, game AI, workflow engines. | Model an agent run as a state machine: `draft → validate → approve → execute → verify → complete/compensate`. This makes retries, human approval, cancellation, and recovery explicit. |
| **Feedback control** | Observe a system, compare it with a target, act, and use the resulting measurement to correct future action. | Mechanical governors predate computing; Maxwell’s 1868 governor analysis and Wiener’s 1948 cybernetics are major landmarks. | Autonomic computing, DevOps/SRE loops, recommender optimization, MLOps. | Treat the agent as a controller, not an oracle: define sensor signals, target criteria, action limits, error thresholds, and stop conditions. An agent without measurement is open-loop automation. |
| **Probability and Bayesian updating** | Maintain uncertainty, combine evidence, and update beliefs rather than treating every output as a fact. | Bayes’s posthumous 1763 essay; Markov chains, 1906. | Expert systems, probabilistic graphical models, Bayesian networks, modern ML. | Preserve confidence and evidence provenance separately from action authority. Route high-uncertainty or high-impact cases to additional evidence, a verifier, or a human—rather than merely asking the same model to “be more careful.” |
| **Decision theory and expected utility** | Choose actions based on expected benefit, risk, cost, and uncertainty—not just apparent likelihood of success. | Foundations in probability and economics; Bellman’s 1950s dynamic-programming work is a major computational landmark. | Operations research, MDPs, reinforcement learning, bandits, automated planning. | Set action budgets: expected value of another search/tool call must exceed its latency, token, monetary, security, and opportunity cost. “Keep looping until done” is usually a missing utility function. |
| **Search and planning** | Explore alternatives under constraints, use heuristics, and distinguish a candidate plan from execution. | Dijkstra’s shortest-path work (1959); STRIPS planning (1971). | AI planning, expert systems, build systems, query optimization, logistics. | Use explicit plans for long-horizon, constrained, or high-cost work. Replan after material state changes. Keep the plan separate from the action ledger: an intended action is not proof that an action occurred. |
| **Knowledge representation and ontology** | Define entities, categories, relations, meanings, and constraints so information has stable semantics. | Aristotle’s categories are an early lineage; modern semantic networks emerged in the mid-20th century. | Expert systems, RDF/OWL, enterprise data models, knowledge graphs. | Give tools, records, objectives, permissions, and outputs stable names and schemas. Retrieval alone is not knowledge modeling; it cannot resolve ambiguous identity, authority, or lifecycle rules. |
| **Relational data and integrity constraints** | Separate data from access paths and enforce keys, relationships, and invariants close to canonical state. | E. F. Codd’s relational model (1970). | SQL databases, ORM migrations, data warehouses, “single source of truth” programs. | Store durable facts—users, tasks, approvals, artifacts, commitments, and side effects—in authoritative records with IDs and constraints. Keep summaries and embeddings as derived views, not ground truth. |
| **Append-only logs and event history** | Preserve an ordered account of what occurred, derive views from it, and distinguish fact from current projection. | Accounting ledgers are ancient; database logging/recovery matured through 1970s–1990s transaction research. | Event sourcing, CQRS, Kafka-style logs, audit trails. | Record agent proposals, tool-call requests, approval decisions, executions, receipts, errors, and compensations. This supports debugging, replay, audits, and evaluation without pretending an LLM transcript is an authoritative log. |

### Software construction: modularity, semantics, and contracts

| Universal | What it is | Earliest important lineage / landmark | Previous rediscovery cycles | Application to agentic AI |
|---|---|---|---|---|
| **Modularity and information hiding** | Partition systems by secrets and reasons to change; expose contracts rather than implementation details. | David Parnas’s 1972 formulation is the canonical software-engineering reference. | Object-oriented design, microservices, hexagonal architecture, plugin systems, “clean architecture.” | Isolate model providers, prompt construction, retrieval, tool implementations, policy, domain logic, and UI. Do not make a model prompt the de facto integration layer for your whole product. |
| **Abstraction and type discipline** | Represent only what matters at an interface; use types/schemas to rule out invalid states and ambiguous data. | Type-theoretic roots include Church’s 1930s work; Hoare’s 1969 logic and Liskov’s 1970s abstraction work are important programming landmarks. | Static typing revivals, JSON Schema, API contracts, “typed AI outputs.” | Require structured tool inputs/outputs and validate them at boundaries. A model may generate a plausible string; a contract determines whether the system may interpret it as an account ID, approval, SQL query, or deployment target. |
| **Functional core, imperative shell** | Keep deterministic transformations pure; push I/O and effects to narrow, observable boundaries. | Lambda calculus in the 1930s; Lisp (1958/1960), ML (1970s), and later functional-language practice. | Map/reduce, immutable state stores, React/Redux, serverless/dataflow systems. | Put evaluation, planning transforms, state reduction, policy interpretation, and prompt assembly in testable functions. Keep tool execution, network calls, database writes, and notifications at the shell. |
| **Declarative specification** | State desired properties or outcomes rather than manually sequencing every mechanism. | Predicate logic in the 19th century; SQL’s relational lineage; Prolog (1972) and Datalog (1970s). | Infrastructure as code, policy-as-code, CSS, build systems, Kubernetes. | Express goals, permissions, constraints, tool schemas, approval requirements, and success predicates declaratively. Let an executor choose mechanisms only within those constraints. |
| **Separation of policy from mechanism** | Keep “what is allowed/required” distinct from “how it is implemented today.” | A classic systems-design principle, prominent in operating-system and security design. | Rules engines, feature flags, policy-as-code, configurable platforms. | Policies such as “a payment over X needs approval” should not be buried in prompts or model-specific branches. Policies need versioning, review, tests, and clear precedence. |
| **Dependency inversion and adapters** | Depend on stable abstractions; place volatile integrations behind adapters. | Formalized in late 20th-century software design; rooted in modular systems and abstract interfaces. | Ports-and-adapters, plugin architectures, cloud abstraction layers. | Make model, vector store, browser, email, code-host, and SaaS provider integrations replaceable. Provider-specific response quirks should not redefine domain concepts. |
| **Compiler pipelines and intermediate representations** | Transform an input through explicit stages with representations suited to each stage. | Early compilers in the 1950s; formal compiler construction matured through the following decades. | ETL pipelines, transpilers, query planners, build pipelines. | Treat natural language as one front-end, not the whole system. Convert it into typed intent, evidence references, plans, tool parameters, execution receipts, and user-facing explanations. |
| **Program transformation and metaprogramming** | Programs can generate, analyze, or transform other programs. | Turing’s universal-machine concept (1936); Lisp/macros and program-synthesis research followed. | Templates, code generators, CI generators, low-code tools, infrastructure generation. | AI coding agents are a high-throughput form of program synthesis. The implication is not “trust generated code”; it is “apply the established discipline for generated artifacts”: reviewable diffs, reproducible builds, tests, provenance, and constrained permissions. |

### Execution: distributed systems, recovery, and operations

| Universal | What it is | Earliest important lineage / landmark | Previous rediscovery cycles | Application to agentic AI |
|---|---|---|---|---|
| **Transactions and isolation** | Group related state changes; preserve invariants despite failures and concurrent work. | Transaction-processing concepts matured in the 1960s–1970s; Jim Gray’s work was foundational. | Banking systems, ORM transactions, sagas, distributed databases. | A multi-step agent action is not automatically atomic. Use transactions where possible; otherwise use explicit sagas, idempotency keys, receipts, and compensation for partial failure. |
| **Idempotency, retries, and compensation** | Make repeated requests safe; recover from partial completion; undo or offset irreversible effects. | Long-standing distributed-systems and transaction-processing practice. | Webhook processing, payment APIs, cloud job runners, workflow engines. | Every tool contract should answer: What happens if this is called twice? How is success detected? Is it reversible? What compensates for a partial success? |
| **Concurrency, queues, and backpressure** | Control work arrival, service rate, contention, and overload rather than assuming infinite parallelism. | Erlang’s queueing work (1909); Little’s Law (1961) is a major operational result. | Message queues, reactive systems, stream processing, serverless job systems. | Agent swarms amplify load and side effects. Put quotas, rate limits, bounded queues, priorities, cancellation, and per-tenant budgets around agent work. More agents is often just more uncontrolled concurrency. |
| **Message passing and the actor model** | Independent computational actors communicate through messages rather than shared mutable state. | Carl Hewitt’s actor model (1973); Hoare’s CSP (1978). | Erlang, Akka, microservices, event-driven architectures. | Define agent-to-agent communication as durable, typed messages with identity, deadlines, authority, and expected response semantics. Avoid invisible shared prompt state as the coordination mechanism. |
| **Consensus and partial failure** | In distributed systems, nodes can disagree, messages can be delayed, and “the system” may not have one instantaneous truth. | Lamport’s 1978 “Time, Clocks, and the Ordering of Events”; FLP (1985); Paxos (1989). | Distributed databases, blockchain, configuration management, leader election. | Multi-agent systems need ownership rules: who may commit a decision, what counts as an approval, how conflicts resolve, and what happens when a reviewer/worker disappears mid-task. |
| **Fault containment and graceful degradation** | Limit the blast radius of a failure; make safe partial service preferable to cascading failure. | Reliability engineering and fault-tolerant-system research; Byzantine-generals formulation (1982) is a landmark. | Bulkheads, circuit breakers, chaos engineering, SRE error budgets. | Separate read-only research from privileged execution. If retrieval, a model provider, or a tool fails, degrade to a safe state—such as “draft awaiting review”—rather than improvising an irreversible action. |
| **Observability** | Instrument behavior so operators can reconstruct what happened, why, and with what cost/latency/error profile. | Systems monitoring is longstanding; modern observability practice grew from distributed operations. | APM, logging stacks, tracing, SRE dashboards. | Capture run IDs, model/version, prompt/context hashes, tool inputs, tool outputs, state transitions, costs, approvals, retries, and final outcome. Traces are necessary, but must be joined to canonical business state and evaluation results. |
| **Reproducibility and configuration control** | Identify the exact inputs, versions, configurations, and environment required to understand or repeat a result. | Source-code control systems emerged in the 1970s; scientific reproducibility is older. | Containers, infrastructure-as-code, reproducible builds, experiment tracking. | Version prompts, policy, tool schemas, model choice, retrieval corpus/index version, evaluator, and workflow definition. “The agent worked yesterday” is not an actionable diagnosis without artifact identity. |

### Safety, verification, and human authority

| Universal | What it is | Earliest important lineage / landmark | Previous rediscovery cycles | Application to agentic AI |
|---|---|---|---|---|
| **Least privilege and capability security** | Grant only the minimum authority needed for a task; make authority explicit, delegable, and revocable. | Dennis and Van Horn’s capability work (1966); Saltzer and Schroeder’s 1975 security principles. | Unix permissions, OAuth scopes, zero trust, sandboxing, cloud IAM. | An agent should receive a narrow, task-scoped capability—not ambient access to every connected tool. Separate read, draft, propose, approve, execute, and administer permissions. |
| **Reference monitoring and complete mediation** | Enforce policy at the action boundary, every time it matters, through a trusted enforcement point. | Security-reference-monitor concepts were formalized in early 1970s work, including Anderson’s 1972 report. | API gateways, authorization middleware, policy engines, admission controllers. | Never rely on a prompt instruction alone for “do not send,” “do not delete,” or “ask before spending.” Enforce those conditions in the tool-execution layer. |
| **Specification and formal verification** | State invariants precisely and prove or mechanically check that executions satisfy them. | Floyd (1967), Hoare logic (1969), temporal logic for programs by Pnueli (1977), model checking in the early 1980s. | Safety-critical systems, protocol verification, type systems, model checking, smart-contract verification. | Do not attempt to formally verify model creativity. Formally or mechanically verify the surrounding protocol: an unapproved payment cannot execute; a task cannot be marked complete without a receipt; a deleted record has a recoverable tombstone. |
| **Testing, properties, and differential evaluation** | Use examples, invariants, simulations, and comparison methods to expose defects. | Software testing is nearly as old as programming; Dijkstra’s 1972 observation that testing can reveal bugs but not prove their absence remains central. | Unit/integration testing, property testing, fuzzing, golden datasets, ML evaluation. | Build an evaluation suite before scaling autonomy: representative tasks, adversarial inputs, policy tests, tool mocks, regression cases, and production outcome metrics. “It looked good in a chat” is not a quality gate. |
| **Runtime monitoring and safety envelopes** | Check safety properties while the system executes; stop, escalate, or constrain when a boundary is crossed. | Control theory and runtime-verification lineages; production safety interlocks are older still. | Circuit breakers, feature flags, API quotas, content filters, safety cases. | Put budgets, deadlines, allowed transitions, tool-call limits, data-classification checks, approval gates, and anomaly detectors around an agent. A monitor should be able to halt a run even if the model insists it is correct. |
| **Human factors and calibrated automation** | Allocate work according to comparative strengths; preserve meaningful human situational awareness and authority. | Human-factors engineering developed through the 20th century; Bainbridge’s 1983 “Ironies of Automation” is a notable warning. | Aviation automation, decision support, RPA, approval workflows. | Humans should not be ceremonial “rubber stamps.” Give them compact evidence, clear decisions, reversible controls, escalation criteria, and a way to correct policy or data—not merely a stream of agent prose. |
| **Auditability and provenance** | Preserve who/what made a claim or action, using which evidence and authority, at what time. | Legal, accounting, and scientific provenance are longstanding; database lineage research later formalized related concerns. | Compliance systems, data lineage, ML experiment tracking, supply-chain attestations. | Track source documents, retrieval results, transformations, model/prompt versions, approvers, tool receipts, and resulting artifacts. This makes correction and accountability possible after a bad decision. |

---

## The most overlooked universal: **state is not context**

This is probably the highest-leverage distinction for agent systems.

A model context window may contain:

- user instructions,
- retrieved documents,
- prior tool outputs,
- summaries,
- speculative plans,
- stale cached facts,
- hostile prompt-injection text,
- generated intermediate artifacts.

That is a **working set**, not an authoritative world model.

A robust system separates at least five things:

| Artifact | What it is | Can it be wrong or stale? | Should it authorize action? |
|---|---|---:|---:|
| Context | Inputs supplied to the model for this turn | Yes | No, by itself |
| Memory summary | Lossy compression of prior material | Yes | No |
| Retrieval result | Candidate evidence found by an index | Yes | No, without validation |
| Plan | A proposal for future action | Yes | No |
| Canonical state / action receipt | Authoritative record of a committed fact or completed action | It can be corrected, but must be versioned and audited | Yes, subject to policy |

Much of agent engineering consists of rediscovering databases, transaction logs, schema design, provenance, cache invalidation, and authorization under the name “memory engineering.”

---

## The second most overlooked universal: **authority is not intelligence**

An agent can be highly capable at generating a plausible action and still be unqualified to execute it.

Separate these roles:

1. **Interpreter:** turns ambiguous language into a candidate intent.
2. **Planner:** proposes actions under constraints.
3. **Policy engine:** determines whether the action category is allowed.
4. **Authorizer:** grants scoped permission for this specific action.
5. **Executor:** invokes the side-effecting tool.
6. **Verifier:** checks the receipt and outcome.
7. **Auditor:** reconstructs what occurred.

A language model can assist with the first two—and sometimes the last—without being entrusted with all seven. This is the same separation of duties that appears in finance, operating systems, security, and safety-critical engineering.

---

## The third most overlooked universal: **a workflow graph is not a system architecture**

Graphs are excellent for showing:

- sequencing;
- branching;
- retries;
- dependencies;
- delegation;
- review stages;
- state transitions.

But a graph should not silently become the home for every concern.

A workflow graph is usually a poor place to own:

- canonical business state;
- authorization policy;
- secrets;
- long-lived domain semantics;
- observability standards;
- provider-specific model behavior;
- recovery semantics;
- user-facing data ownership.

A healthy division is:

```text
Stable domain model + policies + tool contracts + action ledger
                    ↓
         Workflow/state-machine orchestration
                    ↓
  Volatile model, prompt, retrieval, and provider adapters
```

So the right conclusion is not “do not use graphs.” It is:

> Use graphs to represent flow and dependencies; use data models for truth, policy systems for authority, and execution systems for side effects and recovery.

---

## What is genuinely different about agentic AI?

The novelty is best understood as a set of changed constraints rather than a replacement for prior engineering.

| Changed constraint | Consequence |
|---|---|
| Natural language can function as a programming and interface medium. | Intent is easier to express, but ambiguity and injection become first-class engineering problems. |
| A component can synthesize code, plans, and explanations cheaply. | Generation is abundant; verification, integration, and governance become bottlenecks. |
| Competence is non-uniform and model-dependent. | A system needs routing, confidence handling, fallbacks, and empirical evaluation rather than fixed assumptions about a subroutine. |
| The “planner” can interpret untrusted content. | Data/control separation, sandboxing, and provenance matter more. |
| Tool use can be cheap and broad. | Least privilege, budgets, idempotency, and side-effect receipts become indispensable. |
| Model behavior changes with versions, prompts, and context. | Reproducibility, artifact versioning, regression testing, and adapters become critical. |
| Multi-step autonomy can happen at application scale. | Workflow, state machines, transactions, observability, and human escalation move from “enterprise complexity” to baseline design concerns. |

The correct lesson is not that agents are just old software. It is that they are **old software disciplines under unusually stochastic, language-mediated, rapidly changing conditions**.

---

## A practical adoption sequence

You do not need to build a formal methods laboratory or a distributed workflow engine for every agent. Adopt the universals in risk order.

### Level 1 — Minimum viable discipline for any consequential agent

Use this even for a single-agent application that can affect user data or external systems:

1. Define a **success predicate** and explicit stop conditions.
2. Maintain **canonical state** outside the prompt/context window.
3. Give tools typed inputs/outputs and validate them.
4. Enforce **least privilege** and human approval for consequential actions.
5. Record an action ledger with run IDs and execution receipts.
6. Use idempotency keys and explicit retry behavior.
7. Create a small regression/evaluation suite before expanding autonomy.
8. Capture model, prompt, tool-schema, and policy versions.

### Level 2 — Add when workflows become multi-step or expensive

1. Model the lifecycle as an explicit state machine or workflow graph.
2. Use queues, deadlines, cancellation, budgets, and backpressure.
3. Separate planning from execution and execution from verification.
4. Add compensating actions for partial failure.
5. Add retrieval provenance and freshness rules.
6. Make human escalation an explicit state transition, not an apologetic fallback.

### Level 3 — Add when agents coordinate or operate in high-stakes domains

1. Define message protocols, ownership, and conflict resolution.
2. Use scoped delegated capabilities rather than shared credentials.
3. Establish service-level objectives and reliability/error budgets.
4. Model-check or otherwise mechanically verify critical workflow invariants.
5. Run adversarial evaluation for injection, confused deputy, data leakage, duplicate execution, and escalation bypass.
6. Preserve auditable evidence for every material decision and action.

---

## A “fad translator” for evaluating new terms

When somebody introduces a new engineering category, ask these questions:

| Question | What it protects you from |
|---|---|
| What existing abstraction is this closest to? | Treating a renamed technique as unprecedented. |
| What new constraint makes the old abstraction insufficient? | Dismissing real novelty with “we already had that.” |
| What is the stable invariant? | Binding architecture to a model vendor, prompt style, or framework. |
| What changes fastest? | Allowing volatile integrations to contaminate core logic. |
| What is canonical state, and what is merely context/cache/proposal? | Hallucinated or stale state becoming operational truth. |
| Where is authority enforced? | Prompt-only “guardrails.” |
| What happens on retry, timeout, duplicate execution, or partial success? | Distributed-systems failures disguised as agent weirdness. |
| How will we know it regressed after a model/prompt/tool change? | Demo-driven development. |
| Which claims require a receipt or human approval? | Unaccountable autonomy. |
| Can the technique be introduced locally and reversibly? | Whole-stack rewrites driven by terminology. |

If “graph engineering” passes those questions, it is probably a useful workflow design practice. If it does not, it is likely just a fashionable label attached to an unexamined orchestration layer.

---

## High-value historical source shelf

These are especially useful primary or near-primary anchors for the universals above:

- E. W. Dijkstra, “[Go To Statement Considered Harmful](https://www.cs.utexas.edu/~EWD/transcriptions/EWD02xx/EWD215.html)” (1968), for explicit control flow and complexity.
- C. A. R. Hoare, “[An Axiomatic Basis for Computer Programming](https://doi.org/10.1145/363235.363259)” (1969), for assertions, invariants, and verification.
- E. F. Codd, “[A Relational Model of Data for Large Shared Data Banks](https://doi.org/10.1145/362384.362685)” (1970), for canonical structured state and integrity.
- D. L. Parnas, “[On the Criteria To Be Used in Decomposing Systems into Modules](https://doi.org/10.1145/361598.361623)” (1972), for information hiding and change-driven boundaries.
- J. H. Saltzer and M. D. Schroeder, “[The Protection of Information in Computer Systems](https://doi.org/10.1109/PROC.1975.9939)” (1975), for least privilege, complete mediation, and security design principles.
- A. Pnueli, “[The Temporal Logic of Programs](https://doi.org/10.1109/SFCS.1977.32)” (1977), for reasoning about system behavior over time.
- L. Lamport, “[Time, Clocks, and the Ordering of Events in a Distributed System](https://doi.org/10.1145/359545.359563)” (1978), for causality and distributed coordination.
- R. E. Bellman, *Dynamic Programming* (1957), for sequential decision-making under constraints.
- R. S. Sutton and A. G. Barto, *Reinforcement Learning: An Introduction*, for the modern decision-process vocabulary—useful, but not a replacement for security, transactions, or software verification.
- N. R. Jennings, K. Sycara, and M. Wooldridge, “[A Roadmap of Agent Research and Development](https://doi.org/10.1016/S0004-3702(03)00107-4)” (2004), for a reminder that autonomous-agent coordination, communication, and delegation long predate LLM-based agents.

---

## Bottom line

The most defensible general principle is:

> **Use models for interpretation, generation, ranking, and bounded planning. Use conventional software systems for truth, authority, execution, recovery, and proof.**

The agentic shift does not eliminate graphs, state machines, databases, transactions, formal specifications, functional design, access control, or operations. It makes their careful combination especially important.

The teams that get a durable advantage will not be those that most quickly rename old foundations. They will be the teams that can identify the foundation beneath a new capability, preserve its invariants, and adapt only the volatile edge around the model.
