---
title: "COBO: The Four Planes of Organization"
date: 2026-06-17T06:21:07-04:00
tags: ["organizations", "ontology", "systems-thinking", "agents", "knowledge-base"]
---

> **Thesis**: The autonomous enterprise can be modeled as a living system where Miller's 20 subsystems are distributed across four distinct planes: **Infrastructure** (Container), **Machines & Agents** (Transformer), **Artifacts** (Object), and **Meta-Artifacts** (Instruction).

---

## Plane 1: Infrastructure
**Definition**: The static or passive components that provide residence (Storage), transportation (Channel), and protection (Boundary).
**LST Subsystems**:
*   **2. Boundary**: Protects system integrity (Firewalls, Walls).
*   **3. Ingestor**: Entry points for matter/energy (API Gateway, Loading Dock).
*   **4. Distributor**: Internal transport routes (VPC Peering, Hallways).
*   **7. Matter-Energy Storage**: Reservoirs for holding resources (Bank Accounts, Warehouses).
*   **8. Extruder**: Exit points for products/waste (CI/CD Deploy Pipeline).
*   **10. Supporter**: Physical/Digital scaffolding (Office Building, Cloud Platform).
*   **13. Channel and Net**: Route for info transmission (Slack, Fiber).
*   **17. Memory** (Storage Component): The physical medium of record (Databases).

### COBO Mappings
*   **Physical**: HQ Office (*Supporter*), Warehouses (*Storage*).
*   **Hybrid**: Data Centers (*Supporter*), Network Switches (*Distributor*).
*   **Software**:
    *   *Finance Rail*: Bank Accounts (*Storage*), ERP Ledger (*Memory*).
    *   *Data Rail*: Snowflake/S3 (*Storage*), Kafka Topics (*Channel*).
    *   *Product Rail*: GitHub Repos (*Memory*), AWS VPC (*Distributor*), Deploy Pipelines (*Extruder*).
    *   *Security*: WAF/Firewalls (*Boundary*), IdP/Auth0 (*Boundary*).

---

## Plane 2: Machines & Agents
**Definition**: The active processors (Transformers) that manipulate artifacts based on meta-artifacts.
**LST Subsystems**:
*   **1. Reproducer**: Creates new systems/agents (Founder, HR).
*   **5. Converter**: Prepares inputs for use (Onboarding Bot, ETL Job).
*   **6. Producer**: Synthesizes new artifacts (Engineer, Builder).
*   **9. Motor**: Moves the system in environment (Sales/Growth Agent).
*   **11. Input Transducer**: Senses external environment (Market Researcher).
*   **12. Internal Transducer**: Senses internal state (SRE Watchdog, Pulse Survey).
*   **14. Timer**: Coordinates timing (Scheduler, Cron, PM).
*   **15. Decoder**: Translates input to system code (Parser, Spec Writer).
*   **16. Associator**: Learns and correlates (AI Model Trainer, Strategist).
*   **18. Decider**: Executive control (CEO, Algorithm).
*   **19. Encoder**: Translates system code to output (UI Renderer, Marketer).
*   **20. Output Transducer**: Projects output to environment (PR Agent, Sales Bot).

### COBO Mappings
*   **Machines (Deterministic)**:
    *   *Automata*: CI/CD Runners (*Producer*), Linters (*Decoder*), Cron Jobs (*Timer*).
    *   *Processors*: Payroll Batch (*Converter*), Static Analysis (*Internal Transducer*).
*   **Agents (Adaptive)**:
    *   *Executive*: Strategic Planner (*Associator*), Budget Allocator (*Decider*).
    *   *Engineering*: Architect (*Decider*), Coder (*Producer*), SRE (*Internal Transducer*).
    *   *Commercial*: SDR (*Motor*), Account Executive (*Output Transducer*), Content Marketer (*Encoder*).
    *   *Ops*: Recruiter (*Reproducer*), Support Agent (*Converter*).

---

## Plane 3: Artifacts & Resources
**Definition**: The passive flows of Matter, Energy, and Information that are manipulated by the system.
**LST Correlates**:
*   **Matter**: Biomass, Hardware.
*   **Energy**: Capital, Electricity.
*   **Information Markers**: Data, Signals, Tokens.

### COBO Mappings
*   **Raw Inputs**:
    *   *Capital*: Cash, Credit ($).
    *   *Data*: Raw Logs, User Clickstreams.
    *   *Talent*: Candidates (Potential matter).
*   **Intermediate**:
    *   *Drafts*: Wireframes, PRDs, Unmerged Code.
    *   *Leads*: MQLs, Opportunities.
*   **Finished Outputs**:
    *   *Product*: Binaries, Release Notes.
    *   *Financial*: GAAP Reports, Paychecks.
    *   *Legal*: Signed Contracts.

---

## Plane 4: Meta-Artifacts
**Definition**: The conceptual patterns, rule sets, and blueprints that guide the Agents.
**LST Correlates**:
*   **Genetic Information**: The "Template" or "Charter" used by the Reproducer.
*   **Decider Rules**: The values and logic governing the Decider.

### COBO Mappings
*   **Technical Blueprints**:
    *   *Code*: Source Code (The DNA of the Product).
    *   *Infra*: Terraform/Helm Charts.
    *   *Specs*: API Schemas (OpenAPI), Database Models.
*   **Procedural Knowledge**:
    *   *SOPs*: Standard Operating Procedures.
    *   *Prompts*: System Prompts for AI Agents.
    *   *Playbooks*: Incident Response Guides.
*   **Governance**:
    *   *Policy*: Corporate Policies, Ethics Guidelines.
    *   *Strategy*: Mission, Vision, OKRs.
