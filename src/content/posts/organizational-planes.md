---
title: "Organizational Planes: The Structure of the Autonomous Organization"
date: 2026-06-17T06:21:07-04:00
tags: ["organizations", "systems-thinking", "ontology", "knowledge-base"]
---

> **Thesis**: The autonomous organization is a living system composed of four interacting planes.
> 1. **Infrastructure**: The physical/virtual space and channels (Where things happen).
> 2. **Transformers**: The active machines and agents (Who/What does the work).
> 3. **Artifacts**: The passive objects. (What is worked upon or produced).
> 4. **Meta-Artifacts**: The transformation instructions (How the work is done).

---

## 1. Plane Breakdown

### Plane A: Infrastructure (The Matrix)
*The spatial and channel-based substrate.*

#### A.1 Digital Substrate (The Cloud & Network)
*Derived from: Engineering (Platform), Security (Infra)*
- **Compute Containers**: Kubernetes Clusters, AWS EC2, Serverless Functions (The runtime environment).
- **Network Fabric**: VPCs, DNS Zones (Route53), Load Balancers, API Gateways.
- **Identity Layer**: Okta/SSO Directory (The "Keycard" system), IAM Roles.

#### A.2 Memory & Storage (The Hippocampus)
*Derived from: Data (Platform), Finance (Ledger), Engineering (DevExp)*
- **Structured Data Stores**: SQL Databases (Postgres), Data Warehouses (Snowflake).
- **Unstructured Stores**: S3 Buckets (Blob storage), Vector Databases (Pinecone).
- **Knowledgebases**: Obsidian Vaults, Notion Workspaces, Google Drive.
- **Code Repositories**: GitHub/GitLab (The storage of the meta-artifact).
- **Financial Ledgers**: ERP System (NetSuite), Bank Accounts (The container for capital-energy).

#### A.3 Communication Channels (The Nervous System)
*Derived from: Operations (Comms), Sales (CRM)*
- **Synchronous**: Zoom Rooms, Slack Channels, Phone Lines.
- **Asynchronous**: Email Relays, JIRA Boards (State channels).
- **External Interfaces**: Web Platforms, Social Media, Partner Portals.

#### A.4 Physical Hardware (The Body)
*Derived from: Operations (Workplace)*
- **Real Estate**: Office Buildings, Physical Security Gates.
- **Devices**: Employee Laptops, Mobile Devices, Hardware Security Keys (YubiKeys).

### Plane B: Transformers (The Actuators)
*Components that expend energy to transform artifacts & meta-artifacts.*

#### B.1 Machines (Complicated/Static)
*Deterministic automation. Input A -> Output B.*
- **Engineering Drivers**: CI/CD Pipelines (The assembly line robots), Linters/Formatters, Test Runners, Build Systems (Webpack/Vite).
- **Data Processors**: ETL Scripts (The refinement pumps), Cron Jobs, Auto-scalers.
- **Security Bots**: Static Analysis Tools (SAST), Vulnerability Scanners.
- **Financial Engines**: Automated Billing Systems (Stripe Subscriptions), Payroll Calculators.

#### B.2 Agents (Complex/Adaptive)
*Probabilistic goal-seeking entities. Can handle ambiguity.*
- **The Deciders (Executive/Mgmt)**: CEO, VP of Product, Engineering Manager, Strategy.
- **The Builders (Engineering/Product)**: Senior Software Engineer, UX/UI Designer, 3D Modeler, Architect, Product Manager.
- **The Sellers & Growers (Growth)**: Account Executive, SDR, Content Marketer.
- **The Protectors (Security/Legal)**: General Counsel, Security Analyst.

### Plane C: Artifacts (The Payload)
*Objects that are manipulated, transformed, or referenced.*

#### C.1 Artifacts (The Value Units)
*The result of the work or the fuel for it.*
- **Commercial**: Signed Contracts, Invoices, Cash (Capital), Purchase Orders.
- **Code Binaries/Builds**: Interactive Applications, Websites.
- **Data:** Product Data, Business Records, CRM Records, User Research, Logs/Telemetry, Bug Reports, Communication Records, Project Management.
- **Assets:** Images, UI Components, 3D Models, Copytext.
- **Physical:** Built Objects, Hardware Products, Models.

### Plane D: Meta-Artifacts (The RNA & DNA)
*The blueprints and recipes of the organization. The passive, non-executing logic that programs, constrains, and directs the active transformers (Plane B).*

#### D.1 Runtime Code (Execution Instructions)
*The active recipes. Explicit logic designed to be ingested and executed by specific actor types in Plane B.*
- **Machine Code**: Python scripts, CI/CD YAML configurations, Cron schedules, SQL queries, Terraform files. (Governs B.1 Deterministic Machines)
- **Natural Language Procedures:** Standard Operating Procedures (SOPs), Agent Skills, Runbooks, Escalation trees, Onboarding checklists. (Governs B.2 Complex Agents)

#### D.2 Blueprints (Architecture & Guardrails)
*The master blueprint. High-level logic defining the shape, purpose, boundaries, and safety limits of the system.*
- **Core Directives (Value Alignment):** Mission Statements, Values, Corporate Charters, OKRs, North Star Metrics.
- **System Architecture (Topography):** Database schemas, API definitions, UX Design Systems, System diagrams, Brand Guidelines, Job Role Descriptions.
- **Boundary Protocols (Membrane / Legal Layer):** Master Service Agreements (MSAs), NDAs, Corporate Bylaws, Employee Handbooks / System Prompts, GDPR/SOC2 Compliance matrices. (Governs relationships between systems)

---

## 2. The Unified System View
By viewing the organization through these planes, we see exactly what needs to be built to create an autonomous entity:

1.  **Build the Infrastructure (Plane A)** so Agents have a place to exist.
2.  **Define the Meta-Artifacts (Plane D)** to give the Agents purpose and constraints.
3.  **Deploy the Transformers (Plane B)** to execute the Meta-Artifacts and produce Artifacts (Plane C). Learning happens through modification of Meta-Artifacts.
