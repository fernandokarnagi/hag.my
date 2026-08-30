# CRM Module — Technical Specifications

## 1. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | ReactJS 18+ (Vite) |
| UI Library | shadcn/ui + Tailwind CSS |
| State Management | React Query (TanStack Query) |
| Backend/DB | Cloud Firestore |
| Authentication | Firebase Auth |
| Hosting | Firebase Hosting |
| Functions | Firebase Cloud Functions (Node.js 20) |
| Language | TypeScript |

---

## 2. Project Structure

```
crm/
├── public/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── layout/          # Sidebar, Header, etc.
│   │   └── shared/          # Shared components
│   ├── pages/               # Route-level components
│   │   ├── Dashboard.tsx
│   │   ├── Leads/
│   │   │   ├── LeadList.tsx
│   │   │   ├── LeadDetail.tsx
│   │   │   ├── LeadForm.tsx
│   │   │   └── DailyUpdate.tsx
│   │   ├── Reports/
│   │   └── Settings/
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Firebase service layer
│   │   ├── firebase.ts      # Firebase config init
│   │   ├── leadService.ts
│   │   ├── authService.ts
│   │   └── userService.ts
│   ├── types/               # TypeScript interfaces
│   ├── lib/                 # Utilities, constants
│   ├── App.tsx
│   └── main.tsx
├── functions/               # Firebase Cloud Functions
│   └── src/
│       ├── triggers/
│       └── api/
├── firestore.rules
├── firebase.json
├── .firebaserc
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. Firestore Data Model

### 3.1 Collection: `leads`

```typescript
interface Lead {
  id: string;                    // Auto-generated doc ID
  customerCode: string;          // SRS-YYMMXXXX
  clientName: string;
  status: LeadStatus;
  contactDetails: string;
  siteVisitDate: Timestamp | null;
  siteVisitDoneBy: string;
  salesExecutive: string;
  proposalPreparedBy: string;
  phase: 'Single Phase' | '3 Phase' | null;
  avgMonthlyBill: string;
  preferredSystem: 'Solar only' | 'Solar + battery' | 'Request both' | 'Does not mention' | null;
  propertyType: PropertyType | null;
  proposedCapacity: string;
  projectValue: string;
  location: string;
  gpsPin: string;
  customerFolder: string;
  remarks: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;             // User UID
}
```

### 3.2 Collection: `statusUpdates`

```typescript
interface StatusUpdate {
  id: string;
  leadId: string;                // Reference to leads doc ID
  customerCode: string;
  stage: LeadStatus;
  status: 'DONE' | 'PENDING' | 'AFTER ECOS';
  updatedBy: string;             // User UID
  updatedAt: Timestamp;
  notes: string;
}
```

### 3.3 Collection: `users`

```typescript
interface User {
  uid: string;                   // Firebase Auth UID
  displayName: string;
  email: string;
  role: 'admin' | 'sales' | 'cs' | 'engineer';
  active: boolean;
  createdAt: Timestamp;
}
```

### 3.4 Enums

```typescript
type LeadStatus =
  | 'GOOGLE_FORM-INCOMING'
  | 'NO_RESPONSE'
  | 'SITE_VISIT'
  | 'PROPOSAL_QUOTATION'
  | 'BOOKING_FEE_RECEIVED'
  | 'SESB_SUBMITTED'
  | 'SESB_APPROVED'
  | 'PROFORMA_SENT'
  | '50_COLLECTED'
  | 'ECOS_DOCS_COLLECTED'
  | 'PASSED_TO_ISYRAQ'
  | 'ECOS_SUBMITTED'
  | 'ECOS_APPROVED'
  | 'INVOICE_SENT_40'
  | '40_COLLECTED'
  | 'INSTALLATION_DONE'
  | 'INVOICE_SENT_10'
  | '10_COLLECTED'
  | 'TC'
  | 'SRATO'
  | 'TURN_ON';

type PropertyType =
  | 'Terrace'
  | 'Bungalow'
  | 'Semi D'
  | 'Detached House'
  | 'Landed House';
```

---

## 4. CRM Workflow

This section defines the end-to-end business process — how a lead enters the system, who handles it at each stage, what actions are required, and what rules govern transitions.

### 4.1 Workflow Overview

```
Google Form → CS Qualification → Sales Engagement → SESB Compliance → Installation → Payment & Activation
```

Every lead follows this linear pipeline. A lead cannot skip stages. Each stage has a **gate** — a set of conditions that must be met before the lead advances.

---

### 4.2 Lead Intake (GOOGLE FORM-INCOMING)

**Trigger**: Customer submits Google Form (solar inquiry).

**Actors**: System (automated), CS (review).

**Actions**:
1. Google Form submission triggers Cloud Function webhook.
2. System creates new `leads` document with status `GOOGLE_FORM-INCOMING`.
3. System auto-generates `customerCode` (SRS-YYMMXXXX).
4. CS receives notification of new lead.
5. CS reviews form data, verifies contact details.

**Gate to advance**: CS confirms contact details are valid and initiates first contact.

**Data captured at this stage**:
- clientName, contactDetails, location, propertyType, phase, avgMonthlyBill, preferredSystem

**Business rules**:
- If Google Form webhook fails, CS can manually create lead from form data.
- Duplicate detection: check by clientName + contactDetails before creation.

---

### 4.3 Lead Qualification (NO RESPONSE → SITE VISIT)

**Trigger**: CS attempts to contact customer.

**Actors**: CS, Sales Executive.

**Stage A — NO RESPONSE**:
1. CS calls customer within 24h of lead creation.
2. If no answer after 3 attempts (across 3 days), status set to `NO_RESPONSE`.
3. CS adds remark with attempt details.
4. Lead remains in NO_RESPONSE for 7 days before archival.

**Stage B — SITE VISIT**:
1. Customer responds and agrees to site visit.
2. CS assigns `salesExecutive` (PIC) to the lead.
3. CS sets `siteVisitDate` and `siteVisitDoneBy`.
4. Sales Executive conducts site visit.
5. Sales Executive captures: GPS pin, property details, roof condition, meter type.
6. Sales Executive updates `siteVisitDoneBy` and marks visit complete.

**Gate to advance**: Site visit completed, all required fields populated (propertyType, phase, location, gpsPin).

**Data captured at this stage**:
- siteVisitDate, siteVisitDoneBy, salesExecutive, gpsPin, propertyType, phase

**Business rules**:
- Site visit must be completed within 14 days of customer response.
- If customer cancels, status moves to `NO_RESPONSE` with remark "Customer cancelled."
- Sales Executive can reassign to another Sales Executive (admin approval required).

---

### 4.4 Sales Engagement (PROPOSAL & QUOTATION → BOOKING FEE RECEIVED)

**Trigger**: Site visit completed.

**Actors**: Sales Executive, CS.

**Stage A — PROPOSAL & QUOTATION**:
1. Sales Executive prepares proposal based on site visit data.
2. Sales Executive sets `proposalPreparedBy`, `proposedCapacity`, `projectValue`.
3. Proposal includes: system design, kWp capacity, equipment list, RM quotation.
4. Sales Executive sends proposal to customer.

**Stage B — BOOKING FEE RECEIVED**:
1. Customer agrees to proposal.
2. Customer pays booking fee.
3. CS records booking fee receipt.
4. Lead advances to `BOOKING_FEE_RECEIVED`.

**Gate to advance**: Booking fee confirmed received.

**Data captured at this stage**:
- proposedCapacity, projectValue, proposalPreparedBy

**Business rules**:
- Proposal must include at least: capacity (kWp), total project value (RM), payment terms.
- If customer requests changes, Sales Executive revises proposal and re-sends.
- Booking fee amount is not tracked in CRM (handled externally).

---

### 4.5 SESB Compliance (SESB SUBMITTED → SESB APPROVED)

**Trigger**: Booking fee received.

**Actors**: CS, SESB (external).

**Stage A — SESB SUBMITTED**:
1. CS compiles SESB application documents.
2. CS submits application to SESB (Sabah Electricity Sdn Bhd).
3. CS marks `SESB_SUBMITTED` with submission date.

**Stage B — SESB APPROVED**:
1. SESB reviews application (typical turnaround: 2-4 weeks).
2. CS monitors status and follows up.
3. Upon approval, CS marks `SESB_APPROVED`.

**Gate to advance**: SESB approval letter received.

**Business rules**:
- If SESB rejects, CS adds rejection reason to remarks and status reverts to `PROPOSAL_QUOTATION`.
- CS must follow up with SESB at least weekly during review period.

---

### 4.6 Proforma & First Payment (PROFORMA SENT → 50% COLLECTED)

**Trigger**: SESB approved.

**Actors**: CS, Finance.

**Stage A — PROFORMA SENT**:
1. CS generates proforma invoice (external system).
2. CS sends proforma to customer.
3. CS marks `PROFORMA_SENT`.

**Stage B — 50% COLLECTED**:
1. Customer pays 50% deposit.
2. Finance confirms payment receipt.
3. CS marks `50_COLLECTED`.

**Gate to advance**: 50% payment confirmed.

**Business rules**:
- Proforma must be sent within 3 days of SESB approval.
- If 50% not received within 14 days, CS follows up with customer.

---

### 4.7 ECOS Compliance (ECOS DOCS COLLECTED → ECOS APPROVED)

**Trigger**: 50% payment received.

**Actors**: CS, Isyraq (external), ECOS (external).

**Stage A — ECOS DOCS COLLECTED**:
1. CS collects required ECOS documents from customer.
2. CS marks `ECOS_DOCS_COLLECTED`.

**Stage B — PASSED TO ISYRAQ**:
1. CS hands documents to Isyraq for processing.
2. CS marks `PASSED_TO_ISYRAQ`.

**Stage C — ECOS SUBMITTED**:
1. Isyraq submits ECOS application.
2. CS marks `ECOS_SUBMITTED`.

**Stage D — ECOS APPROVED**:
1. ECOS reviews and approves.
2. CS marks `ECOS_APPROVED`.

**Gate to advance**: ECOS approval received.

**Business rules**:
- ECOS documents checklist: NRIC copy, electricity bill, property title, installation photos.
- Isyraq must acknowledge receipt of documents.

---

### 4.8 Installation (INVOICE SENT 40% → INSTALLATION DONE)

**Trigger**: ECOS approved.

**Actors**: CS, Engineer, Finance.

**Stage A — INVOICE SENT (40%)**:
1. CS sends 40% invoice to customer.
2. CS marks `INVOICE_SENT_40`.

**Stage B — 40% COLLECTED**:
1. Customer pays 40%.
2. Finance confirms payment.
3. CS marks `40_COLLECTED`.

**Stage C — INSTALLATION DONE**:
1. Engineer installs solar system.
2. Engineer captures installation completion date, photos.
3. Engineer marks `INSTALLATION_DONE`.

**Gate to advance**: Installation completed, all equipment operational.

**Data captured at this stage**:
- Installation date, installer name, system specs confirmed.

**Business rules**:
- Installation cannot begin until 40% payment confirmed.
- Engineer must upload at least 3 photos of completed installation.
- If installation has issues, Engineer adds remarks and status stays at `INSTALLATION_DONE` with "Issues noted" flag.

---

### 4.9 Payment & Closure (INVOICE SENT 10% → TURN ON)

**Trigger**: Installation completed.

**Actors**: CS, Finance, SESB (external).

**Stage A — INVOICE SENT (10%)**:
1. CS sends final 10% invoice.
2. CS marks `INVOICE_SENT_10`.

**Stage B — 10% COLLECTED**:
1. Customer pays final 10%.
2. Finance confirms payment.
3. CS marks `10_COLLECTED`.

**Stage C — T&C**:
1. Customer signs Terms & Conditions.
2. CS marks `TC`.

**Stage D — SRATO**:
1. CS submits SRATO (System Registration and Activation To Operator).
2. CS marks `SRATO`.

**Stage E — TURN ON**:
1. SESB activates the system.
2. CS marks `TURN_ON`.
3. Lead status: `TURN_ON` (terminal state).

**Gate to advance**: System activated by SESB.

**Business rules**:
- All payments must be confirmed before SRATO submission.
- SRATO must be submitted within 7 days of installation completion.
- System activation is the terminal state — lead is now a customer.

---

### 4.10 Status Transition Rules

| From Status | To Status | Required Actor | Required Data |
|-------------|-----------|----------------|---------------|
| GOOGLE_FORM-INCOMING | NO_RESPONSE | CS | Contact attempt log |
| GOOGLE_FORM-INCOMING | SITE_VISIT | CS | salesExecutive, siteVisitDate |
| NO_RESPONSE | SITE_VISIT | CS | salesExecutive, siteVisitDate |
| NO_RESPONSE | GOOGLE_FORM-INCOMING | CS | Remark: "Customer re-engaged" |
| SITE_VISIT | PROPOSAL_QUOTATION | Sales Executive | proposedCapacity, projectValue |
| PROPOSAL_QUOTATION | BOOKING_FEE_RECEIVED | CS | Booking fee confirmation |
| BOOKING_FEE_RECEIVED | SESB_SUBMITTED | CS | SESB submission date |
| SESB_SUBMITTED | SESB_APPROVED | CS | SESB approval letter |
| SESB_APPROVED | PROFORMA_SENT | CS | Proforma invoice # |
| PROFORMA_SENT | 50_COLLECTED | Finance | Payment confirmation |
| 50_COLLECTED | ECOS_DOCS_COLLECTED | CS | Document checklist |
| ECOS_DOCS_COLLECTED | PASSED_TO_ISYRAQ | CS | Isyraq acknowledgment |
| PASSED_TO_ISYRAQ | ECOS_SUBMITTED | CS | Submission confirmation |
| ECOS_SUBMITTED | ECOS_APPROVED | CS | ECOS approval |
| ECOS_APPROVED | INVOICE_SENT_40 | CS | Invoice # |
| INVOICE_SENT_40 | 40_COLLECTED | Finance | Payment confirmation |
| 40_COLLECTED | INSTALLATION_DONE | Engineer | Installation photos, date |
| INSTALLATION_DONE | INVOICE_SENT_10 | CS | Invoice # |
| INVOICE_SENT_10 | 10_COLLECTED | Finance | Payment confirmation |
| 10_COLLECTED | TC | CS | Signed T&C document |
| TC | SRATO | CS | SRATO submission |
| SRATO | TURN_ON | CS | SESB activation confirmation |

---

### 4.11 Role Responsibilities Summary

| Role | Stages Handled | Primary Actions |
|------|----------------|-----------------|
| **CS** | GOOGLE_FORM → NO_RESPONSE → SITE_VISIT → SESB → PROFORMA → ECOS → INVOICES → T&C → SRATO → TURN_ON | Contact customer, manage compliance docs, track payments, update status |
| **Sales Executive** | SITE_VISIT → PROPOSAL_QUOTATION | Conduct site visit, prepare proposal, set capacity/value |
| **Engineer** | INSTALLATION_DONE | Install system, upload photos, confirm completion |
| **Finance** | BOOKING_FEE, 50%, 40%, 10% | Confirm payment receipts |
| **Admin** | All stages (oversight) | Manage users, view all data, system settings |

---

### 4.12 Workflow State Diagram

```
                          ┌─────────────────────┐
                          │  GOOGLE FORM-INCOMING │
                          └──────────┬──────────┘
                                     │ CS contacts customer
                    ┌────────────────┴────────────────┐
                    ▼                                  ▼
           ┌────────────────┐                 ┌────────────────┐
           │  NO_RESPONSE   │────responded────│   SITE_VISIT   │
           └────────────────┘                 └───────┬────────┘
                    ▲                                  │ Site visit done
                    │ cancelled                        ▼
                    │                         ┌────────────────┐
                    │                         │PROPOSAL_QUOTATION│
                    │                         └───────┬────────┘
                    │                                  │ Booking fee
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │BOOKING_FEE_RECV│
                    │                         └───────┬────────┘
                    │                                  │ SESB submit
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │ SESB_SUBMITTED │
                    │                         └───────┬────────┘
                    │                                  │ SESB approve
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │ SESB_APPROVED  │
                    │                         └───────┬────────┘
                    │                                  │ Proforma
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │ PROFORMA_SENT  │
                    │                         └───────┬────────┘
                    │                                  │ 50% payment
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │  50_COLLECTED  │
                    │                         └───────┬────────┘
                    │                                  │ ECOS docs
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │ECOS_DOCS_COLLECT│
                    │                         └───────┬────────┘
                    │                                  │ Hand to Isyraq
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │PASSED_TO_ISYRAQ│
                    │                         └───────┬────────┘
                    │                                  │ ECOS submit
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │ECOS_SUBMITTED  │
                    │                         └───────┬────────┘
                    │                                  │ ECOS approve
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │ ECOS_APPROVED  │
                    │                         └───────┬────────┘
                    │                                  │ Invoice 40%
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │INVOICE_SENT_40 │
                    │                         └───────┬────────┘
                    │                                  │ 40% payment
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │  40_COLLECTED  │
                    │                         └───────┬────────┘
                    │                                  │ Install
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │INSTALLATION_DONE│
                    │                         └───────┬────────┘
                    │                                  │ Invoice 10%
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │INVOICE_SENT_10 │
                    │                         └───────┬────────┘
                    │                                  │ 10% payment
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │  10_COLLECTED  │
                    │                         └───────┬────────┘
                    │                                  │ Sign T&C
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │       TC       │
                    │                         └───────┬────────┘
                    │                                  │ SRATO submit
                    │                                  ▼
                    │                         ┌────────────────┐
                    │                         │     SRATO      │
                    │                         └───────┬────────┘
                    │                                  │ SESB activate
                    │                                  ▼
                    │                         ┌────────────────┐
                    └────────────────────────▶│    TURN_ON     │
                                              └────────────────┘
```

---

## 5. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Leads collection
    match /leads/{leadId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if isAdmin();
    }

    // Status updates
    match /statusUpdates/{updateId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if false;  // Immutable audit trail
      allow delete: if false;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

---

## 6. Customer Code Generation

Auto-generated via Cloud Function on lead creation:

```
Format: SRS-YYMMXXXX
  YY  = last 2 digits of year
  MM  = month (01-12)
  XXXX = sequential (0001-9999 per month)

Example: SRS-26070001
  26 = 2026
  07 = July
  0001 = first lead of month
```

**Implementation**: Cloud Function `onDocumentCreated` triggers on `leads/{leadId}`, queries `leads` collection for current month prefix, increments sequence, writes back.

---

## 7. Key Pages & Components

### 7.1 Dashboard (`/`)
- Lead count cards by status (color-coded)
- Leads by sales executive (bar chart)
- Monthly trend (line chart)
- Upcoming site visits list
- Revenue pipeline summary

### 7.2 Lead List (`/leads`)
- Data table with columns: Code, Name, Status, Sales Exec, Location, Phase, Property Type, Date
- Filters: status dropdown, sales exec dropdown, date range, location, property type
- Search: name, code, phone
- Bulk select for export
- Row click → lead detail

### 7.3 Lead Detail (`/leads/:id`)
- Header: customer code, name, status badge
- Tabs:
  - **Info**: All lead fields in a form (editable)
  - **Pipeline**: Kanban or timeline view of status progression
  - **History**: Audit log of all changes
- Actions: Update status, Add remark, Delete

### 7.4 Lead Form (`/leads/new`, `/leads/:id/edit`)
- Form fields matching section 3.1
- Validation: clientName required, contactDetails required
- Auto-generate customerCode on submit

### 7.5 Daily Update (`/daily-update`)
- Table view: one row per lead, columns for each pipeline stage
- Dropdown per cell: DONE / PENDING / AFTER ECOS
- Bulk save
- Filter by date range, sales exec

### 7.6 Reports (`/reports`)
- Filter by date range, status, sales exec, location
- Summary stats
- Export to CSV

### 7.7 Settings (`/settings`)
- User management (admin only)
- Role assignment

---

## 8. Routing

```typescript
const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/leads', element: <LeadList /> },
  { path: '/leads/new', element: <LeadForm /> },
  { path: '/leads/:id', element: <LeadDetail /> },
  { path: '/leads/:id/edit', element: <LeadForm /> },
  { path: '/daily-update', element: <DailyUpdate /> },
  { path: '/reports', element: <Reports /> },
  { path: '/settings', element: <Settings /> },
  { path: '/login', element: <Login /> },
];
```

---

## 9. Cloud Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `generateCustomerCode` | `onDocumentCreated('leads/{id}')` | Auto-assign SRS-YYMMXXXX code |
| `createUserProfile` | `onDocumentCreated('users/{id}')` | Sync Firebase Auth user to Firestore |
| `onLeadStatusChange` | `onDocumentUpdated('leads/{id}')` | Log status changes to `statusUpdates` |
| `importFromGoogleForm` | HTTP (scheduled) | Pull new submissions from Google Form |

---

## 10. Deployment

### 10.1 Firebase Project Setup

```bash
# Init Firebase
firebase init

# Select: Hosting, Functions, Firestore, Auth
```

### 10.2 Deploy Commands

```bash
# Deploy all
firebase deploy

# Deploy specific
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

### 10.3 Environment Config

```bash
firebase functions:config:set \
  googleforms.webhook_secret="YOUR_SECRET" \
  googleforms.spreadsheet_id="YOUR_SHEET_ID"
```

---

## 11. Dependencies

### 11.1 Frontend (`package.json`)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@tanstack/react-query": "^5.56.0",
    "firebase": "^11.0.0",
    "date-fns": "^4.1.0",
    "papaparse": "^5.4.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "firebase-tools": "^13.0.0"
  }
}
```

### 11.2 Cloud Functions (`functions/package.json`)

```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^6.0.0"
  }
}
```

---

## 12. Development Phases

| Phase | Scope | Duration |
|-------|-------|----------|
| **Phase 1** | Lead CRUD, Pipeline tracking, Auth, Basic dashboard | 3 weeks |
| **Phase 2** | Daily Update view, Reports, Export, Filters | 2 weeks |
| **Phase 3** | Google Form integration, Drive folder sync | 1 week |
| **Phase 4** | Polish, Mobile responsive, Testing, Deploy | 1 week |

---

## 13. Data Migration

Existing data from Excel (`SRS_CRM Daily Update by CS (Sample).xlsx`):

1. Parse Sheet1 → `leads` collection
2. Parse Update sheet → `statusUpdates` collection
3. Map customer codes, preserve existing status
4. Import via Firebase Admin SDK script

Migration script: `scripts/import-excel.ts`
