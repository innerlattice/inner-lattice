# Series ontology: universal interactive software

This document is the reference for the series. It states what the series covers, how the subject divides into posts, where each concept is defined, and the tests that a post, a principle, or a refactor must pass. A post that disagrees with this document is wrong, or this document is.

## 1. Subject

Interactive software is software that acts on values it does not control. Those values arrive at choices, from resolvers, on the world's schedule. The series describes this subject with one set of primitives (choices, resolvers, records, functions) and organizes everything else by three coordinates:

1. the **module** a concept belongs to;
2. its **orientation** within that module;
3. its **determination**: whether it states a law, a contract, or a realization.

## 2. Modules

A module owns one meaning and one axis of change. Two concerns belong to separate modules when one can change while the other stays fixed. The test is substitution: hold one side constant, vary the other, and check whether anything on the first side must change.

| Module | What it owns | Its edge |
| --- | --- | --- |
| **Program** | records, functions, choices, bindings, scopes, goals, versions | its outward contract: each choice's view, options, and identifier |
| **Interface** | the translation between the program's contract and a resolver's perception and action | the perceptible surface (what is shown or sounded) and the input surface (what can be acted on) |
| **Resolver** | perception, judgment, memory, learning, outside information | none that the software controls |

The program and the interface are both controlled by whoever builds the software. The resolver is not. The edge of control is the interface's surfaces, whatever the resolver:

- for a person, a user interface: surfaces that a body perceives and acts on;
- for another program or an AI agent, a programming interface: the contract encoded as typed messages.

A user interface and a programming interface are two particulars of one module. A programming interface has the fewest transformations between contract and surface, but it still has an encoding, a transport, a latency, a cost of interpretation for its resolver, and versions of its own. The same laws hold for both, and neither counts as the absence of an interface.

"Interface" names this module only. The program's outward side is its *contract*, and the side of any module toward observers and other modules is its *outward side*.

The interface is a module in its own right, composed at the next scale. On the interface's inward side is the contract from the program. The interface's process is selection, encoding, layout, interpretation, and sequencing over time. The interface's outward side is the surfaces. It is a bridge between two ontologies: the program's types and choices, and the model of the program that a resolver forms. The part the two ontologies share is the conceptual model, which is the program's types and choice declarations.

The resolver is modeled only as a source of constraints. The series does not design resolvers. It states the constraints on resolvers that every design must satisfy: limits on perception, action, and attention, the formation of learned models, and access to information that appears in no record.

**Making** is not a fourth module. It is the program module applied at the scale where the software itself is the subject: artifacts are records, roles are bindings, changes are releases, and the order of work is a function of the artifacts' dependencies.

## 3. Orientation and determination

Every concept in a module has two coordinates.

**Orientation** is the side of the module the concept belongs to:

- **Inward:** what counts as real within the module: values, types, invariants.
- **Process:** mediation within the module: transformation, policy, coordination, effects.
- **Outward:** how the module becomes available to an observer or another module.

**Determination** is how specific the concept is:

- **Universal:** what holds through every variation: laws, contracts.
- **Particular:** one kind, strategy, or realization of a universal.
- **Individual:** one concrete composition: an instance, a binding, a session.

Dependencies point toward inward and universal positions. Outward depends on process, process on inward, individual on particular, particular on universal. Across modules, the interface depends on the program's contract, and the program never depends on the interface. A choice names neither its resolver nor its presentation.

### The program

| | Universal | Particular | Individual |
| --- | --- | --- | --- |
| **Inward** | value types, choice declarations, invariants, laws | domain kinds and their functions | records |
| **Process** | function, the effect `choose`, the resolver role, polarity | specific functions, resolvers, sequencers, merges | flows in a run, binding tables, scope settings |
| **Outward** | view, options, identifier, response deadline, the mark that a choice acts | channel adapters | a presented choice |

### The interface

| | Universal | Particular | Individual |
| --- | --- | --- | --- |
| **Inward** | the received view and options; identifiers | view models, content models | a session's view state: scroll, focus, selection |
| **Process** | the laws of encoding and interpretation | layout solvers, encoders, recognizers of gestures, transition engines | a recorded layout choice, a navigation history |
| **Outward** | design rules: invariants of the design language | components, tokens, themes | a rendered frame, a spoken prompt |

## 4. Levels of description

Each module is described at three levels. The levels correspond to relations between determinations, not to professions.

| Level | Relation | What a post at this level states |
| --- | --- | --- |
| **Theory** | grounding | the universals: constraints, definitions, principles, impossibilities, and why they hold |
| **Language** | subsumption | the contract: what is declared, what a compiler checks an individual against, and what the compiler derives |
| **Runtime** | realization | the mechanisms by which the universals are realized, and what each costs |

An individual, such as a worked example, appears in a post only to show a universal. A particular, such as a named system, appears only where it supplies a result, demonstrates feasibility, or shows that a universal is already realized in part.

## 5. The view contract

The view is the hinge between the program and the interface. The series defines it as follows.

A **view** is computed from a choice's snapshot under the program version. It consists of:

- **units:** the pieces of information the resolver must be able to perceive;
- **an intent for each unit:** what the resolver must be able to do with it, such as read, compare, select, enter, confirm, or follow;
- **relations among the units.**

| Relation | What it states |
| --- | --- |
| priority | which units matter more to the choice |
| prerequisite | which units must be understood before others |
| comparison | which units are read against each other |
| part-of | which units form a group |
| order of use | the order in which a task uses the units |
| frequency | how often each unit is used |
| dimension | which data dimensions the units vary along |

The view does not depend on the channel. The same view reaches a screen, a voice interface, an assistive technology, and an AI agent.

A **presentation space** is the space an interface places units in: a sequence, a plane, layers in depth, a volume, or a nesting of spaces such as modes and levels of zoom. Time is a dimension of every presentation space, not a separate space. A **presentation** is an embedding of a view's units into space and time. A **layout** is the presentation at one instant, and **motion** is the presentation's change across instants. A ranked sequence is the case of one relation in one dimension, held constant in time.

Every embedding induces relations of its own: units on a line are ordered, units in a plane are adjacent or apart, units shown in sequence are earlier or later. An embedding is faithful when two conditions hold. The view's relations are preserved. Every induced relation that is not in the view is either one that the resolver does not read as information or one held uniform across the units, so that no unit is distinguished by it.

A layout is a choice. Its options are the arrangements that a **catalog** of components allows, and each component is a realization of some set of intents. A layout that a resolver may learn must stay fixed after being shown, so the layout is recorded, not recomputed. A new layout choice opens only at defined points, such as a release, a change of task, or a request by the resolver.

When a choice's option set is empty, the choice opens a further choice, bound to the resolver that owns the option function. For a layout, an intent with no realization among the components of the catalog is a **gap**, reported to the owners of the catalog.

## 6. Principles

The theory post holds the single registry of principles. Other posts elaborate a principle and link to its entry.

A candidate becomes a principle only if:

1. it addresses a constraint that holds for every interactive system;
2. it can be broken while every other principle holds;
3. at least one feature or ruled-out design follows from it.

A candidate that fails the second test is a consequence. It is stated under the principle it follows from.

### Registered principles

| Principle | Module | Orientation |
| --- | --- | --- |
| Derivation | program | inward |
| Versions | program | inward |
| Binding | program | process |
| Sealing | program | process |
| Coupling | program | process |
| Goals | program | process |
| Prediction | program | outward |
| Effects | program | outward |
| Grounding | program | outward |

### Candidates

| Candidate | Constraint it addresses | What it would require |
| --- | --- | --- |
| Contract | The same view reaches resolvers through different channels and spaces. | Specify each view as units, intents, and relations, independent of channel. Select components by intent, and report unrealized intents as gaps. |
| Fidelity | Every channel can lose distinctions, and every channel induces relations of its own. | Embed each view so that its relations are preserved and no induced relation is read as information. Among faithful embeddings, give the most accurately perceived channels to the highest priorities. |
| Continuity | Resolvers carry identity and learned positions from one instant of a presentation to the next. | Preserve the identity of each thing through motion, and treat a change to a learned arrangement as a release of the resolver's model. |
| Attention | A resolver attends to a limited number of open choices at a time. | Schedule the presentation of open choices by their deadlines and their value to the goals. |

### Consequences to confirm

- Salience is an order-preserving map from priority.
- Under limited space or time, the lowest priorities are omitted first.
- The order of presentation extends the prerequisite order.
- Finality is presented as a distinction: pending, refused, and final are different values to the resolver.
- Uniform salience over a ranked view breaks fidelity.
- The size of an input encodes its option set.
- Expression is a choice within the set of faithful embeddings.
- Once positions are learned, adaptation uses channels other than position.
- The cost of a layout to a resolver is a function of that resolver's records, including what the resolver has learned.
- Continuity holds at three timescales: the frame, the session, and the release.

## 7. Posts

| # | Post | Module and level | Question it answers |
| --- | --- | --- | --- |
| 1 | Theory | program, theory | What must hold for any program that acts on values it does not control? |
| 2 | Languages | program, language | What is declared, what is checked, and what is derived? |
| 3 | Runtime | program, runtime | By what mechanisms is the theory realized, and at what cost? |
| 4 | Interface theory | interface, theory | How does a view become a faithful presentation in space and time, and how does an action become a value? |
| 5 | Design language | interface, language | How are views, catalogs, design rules, motion, and content declared, checked, and generated? |
| 6 | Interface runtime | interface, runtime | What mechanisms render, lay out, animate, and interpret within a resolver's deadlines? |
| 7 | Making | program at the scale of its own production | How does the theory apply to producing and changing software? |

Post 6 becomes a section of post 3 if its outline is shorter than the size rule below.

Reading order follows dependency: 1; then 2 and 3; then 4; then 5 and 6; then 7.

### Space and time are one cell

Space and time fail the substitution test, so they share one post:

- Motion is defined by the two layouts it connects, and its constraints, such as the identity of each unit, reach back into those layouts.
- A layout that a resolver has learned constrains every later layout, so the cost of a layout depends on the history of presentations.
- Time is one more dimension in which a view's relations are encoded: order of use and prerequisite order can be shown in sequence as well as in position.

Animation is therefore not a topic of its own. It is the presentation's change across instants, and it has a coordinate at each level:

| Level | What animation is there |
| --- | --- |
| theory (post 4) | a path between layouts, judged by fidelity and continuity |
| language (post 5) | a declaration of motion: what moves, along which path, under which law of timing |
| runtime (post 6) | a function of time, sampled at each frame within the frame's deadline |

If post 4 exceeds the size rule, post 4 splits between the presentation of one choice and the dialogue among choices. That seam passes the substitution test: the order in which choices open, interrupt, and close can change while the presentation of each choice stays fixed, and the reverse. Each half covers both space and time.

### Scope of each new post

**4. Interface theory**

*Presentation of a choice*
- Presentation spaces, with time as a dimension of each.
- Layout and motion as one embedding.
- Fidelity: preservation of relations, effectiveness by priority, relations induced by the embedding.
- Expression within faithful embeddings.
- Verbal encoding: terminology, message structure, tone, localization.
- Context as choices bound to the device: space, locale, abilities, preferences.
- Channels as one parameter of the same embedding.
- Input as the inverse map: targets, the cost of selection in time and information, gestures, structured entry.
- Editing the output of a function, and translating the edit back into a choice.
- How changes in finality are presented.

*Dialogue among choices*
- Which open choices are presented together, in what order, and what is disclosed when.
- Navigation and view state.
- Narrative: the order of information across views.
- Attention: scheduling, interruption, notification.

*Across both*
- Continuity at the frame, session, and release.
- Learning: how a resolver's model of an interface forms, and the cost of changing it.
- Recorded layouts, and when a new layout choice opens.

**5. Design language**
- Declarations of views: units, intents, relations.
- Component contracts: intents realized, content constraints, gestures accepted.
- Catalogs, and the report of gaps.
- Tokens and themes as constraints that combine by unification.
- The design language as a grammar whose derivations are compositions.
- An encoding grammar and a language of constraints on layout and motion.
- Message formats.
- What a compiler derives: layouts per space, motion between them, a spoken form, checks of content against its constraints, checks of design rules, the accessibility tree, the API for agents.

**6. Interface runtime**
- Rendering as incremental evaluation within a frame deadline.
- Layout as constraint solving and optimization.
- Animation as functions of time, sampled per frame.
- The input pipeline: hit testing, recognition, focus.
- Delivery of assets, and adaptation to capabilities.

**7. Making**
- Artifacts as records, roles as bindings, changes as releases.
- Gaps as choices opened by empty option sets.
- The order of work as a function of the dependency graph of artifacts.
- Boundaries between teams from volatility, not profession.
- Coupling in an organization and coupling in its software.
- Evaluation as goals; prototypes as bindings.

## 8. One home per concept

Every concept is defined in exactly one post. Other posts link to the definition and may restate it in at most one sentence. A post's recap of terms lists only the terms that post uses.

| Home | Concepts |
| --- | --- |
| 1. Theory | choice, resolver, record, function, snapshot, view and its structure, options, empty option sets, determinacy, binding, scope, sequencer, seal, polarity, strata, finality and its tiers, provisional value, response deadline, read and order coupling, invariant, goal, release, commitment, composition of programs, content as records, the registry of principles and their independence |
| 2. Languages | power levels, the effect `choose`, flows as notation for functions, unresolved names, declarations of bindings, scopes, laws, commitments, goals, and releases, the rules that give each operator a polarity, derived and chosen configuration, the rule that a setting may add coordination but not remove it, compiler outputs, organization of modules |
| 3. Runtime | record fields, snapshots as positions, admission and seal records, the mechanism of erasure, incremental evaluation, memory layouts and modes of evaluation, labels of finality, the dispatcher, placement and durability of sequencers, replicas on devices, receiving records or outputs, configuration for each class of choice, the mechanics of releases, testing a migration by replay, identity and authentication of resolvers, limits |
| 4. Interface theory | presentation space, presentation as embedding in space and time, layout, motion, fidelity, effectiveness, induced relations, expression, verbal encoding, context, channels, input as the inverse map, cost of selection, editing derived outputs, continuity, learning, recorded layouts, dialogue, navigation, view state, narrative, attention |
| 5. Design language | intents as declarations, component contracts, catalogs, gaps as reports, tokens, themes, design grammar, encoding grammar, constraints on layout and motion, message formats |
| 6. Interface runtime | rendering, layout solving, sampling of animation, the input pipeline, delivery of assets, adaptation to capabilities |
| 7. Making | artifacts, roles, the order of work, team boundaries, organizational coupling |

### Moves this requires in the existing posts

- **Theory.** Refine the view into units, intents, and relations. Define what happens when an option set is empty. State that content is records. Move the presentation material in the binding section, the paragraph on per-person layouts in the grounding section, and the open problems on legibility and on a common unit of cost to post 4. Rephrase the polynomial interfaces in the composition section in terms of positions and replies, so that "interface" keeps one meaning. Move the six classes of choices and the mechanism of erasure to the runtime post. Merge the open problems on response deadlines and on specifications for agent resolvers with the corresponding open problems in the languages post.
- **Languages.** Reduce the presentation declaration to a link to post 5. Take in derived and chosen configuration from the runtime post. Become the only home for the polarity of each operator.
- **Runtime.** Take in the six classes and erasure. Remove the restatements of the effects principle, of operator polarities, and of the migration formula. Replace channel selection with a link to post 4. Add identity and authentication. Move the open problem on presenting provisional values to post 4.
- **All.** Trim each recap of terms to the terms the post uses.

## 9. Method: counterfactuals without professional boundaries

The way work is divided among professions shapes how a subject is divided into concepts. The series does not take that division as given. For each boundary between disciplines:

1. State the two concepts that the disciplines keep separate.
2. Apply the substitution test: can one change while the other stays fixed?
3. If it can, the boundary is a module boundary. Keep it.
4. If it cannot, the two are one concept. Define it once, at its coordinate, and derive what each discipline had specified separately.

Boundaries that pass the test:

- the program's meaning and its presentation.

Boundaries that fail, and the single concept each one becomes:

| Concepts kept separate | Single concept |
| --- | --- |
| conceptual model, content model, domain model, schema | the program's inward universals: types and choice declarations |
| state on the device, state on the server | the same components, replicated |
| feedback states, transaction outcomes | tiers of finality: admitted on the device, provisional, refused, final |
| empty states, query results | a conclusion about absence, which is final only over a sealed scope |
| visual design, visualization of data | the encoding of a view, judged by expressiveness and effectiveness |
| design tokens, configuration, types | constraints at the lowest power level, combined by unification |
| layout, motion | one presentation over space and time |
| motion, interpolation between samples, stable identifiers | continuity of identity through motion |
| user interface, programming interface | one interface module, with particulars that differ in their surfaces |
| the accessibility tree, the API for agents | the view, presented without visual surfaces |
| user research, experiments, critique | evaluation: goals, and evaluation choices bound to people |
| versions of a design system, migrations of a schema | releases with migrations that must commute |
| layout grids, constraint solving, goals | layout as a choice optimized under constraints |
| target sizes, probabilities of selection | presentation that reads the binding's recorded probabilities |
| content written after layout, layout designed before content | an order of work derived from dependencies: the view, then the catalog and content, then the layout, then the surfaces |

## 10. Coverage

The series covers every arrow of the interaction loop at every level:

```text
records → functions → view → presentation → surfaces → perception
   ↑                                                   ↓
record ← value ← interpretation ← input surface ← action
```

| Arrow | Theory | Language | Runtime |
| --- | --- | --- | --- |
| records → functions → view | 1 | 2 | 3 |
| view → presentation → surfaces | 4 | 5 | 6 |
| surfaces → perception → action | constraints only, in 4 | — | — |
| action → input surface → interpretation | 4 | 5 | 6 |
| interpretation → value → record | 1 (grounding) | 2 | 3 |

A second check uses the qualities that interactive software is judged by:

| Quality | Where it is enforced |
| --- | --- |
| integrity of information | sealing, provenance, fidelity |
| agency of the resolver | effects, grounding, reversibility through superseding records |
| privacy | coupling (access rules) |
| security | binding; identity in the runtime |
| performance | response deadlines, prediction |
| reliability | derivation, sealing, effects |
| compatibility | versions, context |
| maintainability | module organization, volatility |
| accessibility | contract, fidelity, context |
| usability | fidelity, continuity, attention, cost of selection |
| expressive quality | expression within faithful embeddings; goals judged by people |

Every quality has an owner. The last three are owned by the interface.

### Outside the series

- the internals of resolvers;
- control loops with deadlines too short to record a value;
- dense media streams, beyond their references and summaries;
- parties without mutual trust, beyond signed records and checked commitments;
- the design of incentives among agents, beyond the open problem the theory states.

## 11. Granularity

- A post is about 7,000 to 13,000 words.
- A section covers one principle, one component, or one kind of declaration.
- A cell of the grid that exceeds the size of a post splits along the seam with the fewest dependencies across it.
- A cell shorter than about 3,000 words becomes a section of the post at the same level in the neighboring module.
- A post states one claim that its title can name.

## 12. Open questions

1. Whether post 4 splits between the presentation of a choice and the dialogue among choices. The size of its outline determines this.
2. Whether post 6 is a post or a section of post 3. The size of its outline determines this.
3. Which candidates survive the independence test, and so how many principles the registry holds.
4. Titles for posts 4 to 7.
