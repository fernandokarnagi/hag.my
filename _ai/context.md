# CRM Module — Knowledge Base

## Project
- **Type**: Solar energy CRM (Sabah, Malaysia)
- **Stack**: ReactJS 18+ / TypeScript / Vite, shadcn/ui + Tailwind CSS, Cloud Firestore, Firebase Hosting
- **Status**: Phase 2 complete, ready for Phase 3
- **Deploy**: Google Cloud Firebase
- **Build**: `npm run build` passes clean

## Key Files
- `requirements.md` — Functional requirements (26 FRs, 7 NFRs, 8 integrations)
- `specs.md` — Technical specs, data model, CRM workflow, architecture
- `requirement/SRS_CRM Daily Update by CS (Sample).xlsx` — Source data (183 leads, 2 sheets)

## Project Structure
```
src/
├── types/index.ts              — Lead, StatusUpdate, User, all enums + options
├── services/
│   ├── firebase.ts             — Firebase config init
│   ├── authService.ts          — Login, register, logout, getUserProfile
│   ├── leadService.ts          — CRUD, filters, search, nextCustomerCode
│   └── userService.ts          — User management
├── hooks/
│   ├── useAuth.ts              — Auth state hook
│   ├── useLeads.ts             — React Query hooks for leads
│   └── useUsers.ts             — React Query hooks for users
├── components/
│   ├── AuthProvider.tsx         — Auth context
│   ├── Toast.tsx               — Toast notification system
│   ├── ConfirmDialog.tsx       — Confirmation dialog component
│   └── layout/                 — Sidebar (mobile responsive), Layout
├── pages/
│   ├── Login.tsx               — Email/password login
│   ├── Dashboard.tsx           — KPIs, status counts, upcoming visits
│   ├── Leads/
│   │   ├── LeadList.tsx        — Table with filters/search/pagination
│   │   ├── LeadDetail.tsx      — Full lead view + pipeline progress
│   │   ├── LeadForm.tsx        — Create/edit form
│   │   └── DailyUpdate.tsx     — CS bulk status update grid
│   ├── Reports/Reports.tsx     — Revenue analytics + CSV export
│   └── Settings/Settings.tsx   — User role management (admin)
└── lib/utils.ts                — cn() helper
functions/src/index.ts          — Cloud Functions
firestore.rules                 — Security rules
```

## Data Model (3 Firestore Collections)

### leads (18 fields)
- id, customerCode (SRS-YYMMXXXX auto-gen), clientName, status (21-stage enum)
- contactDetails, siteVisitDate, siteVisitDoneBy, salesExecutive, proposalPreparedBy
- phase (Single/3 Phase), avgMonthlyBill, preferredSystem, propertyType
- proposedCapacity, projectValue, location, gpsPin, customerFolder, remarks
- createdAt, updatedAt, createdBy

### statusUpdates (audit trail)
- id, leadId, customerCode, stage, status (DONE/PENDING/AFTER ECOS)
- updatedBy, updatedAt, notes

### users
- uid (Firebase Auth), displayName, email, role (admin/sales/cs/engineer), active

## CRM Workflow (21 stages, 6 phases)

### Phase 1: Lead Intake
1. GOOGLE_FORM-INCOMING → System auto-creates lead from Google Form
2. NO_RESPONSE → CS contacts, 3 attempts over 3 days, 7-day archival

### Phase 2: Qualification
3. SITE_VISIT → CS assigns Sales Exec, visit within 14 days
4. PROPOSAL_QUOTATION → Sales Exec prepares proposal (kWp, RM, equipment)
5. BOOKING_FEE_RECEIVED → CS confirms payment

### Phase 3: SESB Compliance
6. SESB_SUBMITTED → CS submits to SESB
7. SESB_APPROVED → 2-4 week turnaround, rejection reverts to PROPOSAL_QUOTATION

### Phase 4: ECOS Compliance
8. PROFORMA_SENT → CS sends proforma within 3 days
9. 50_COLLECTED → Finance confirms, 14-day follow-up
10. ECOS_DOCS_COLLECTED → NRIC, bill, title, photos
11. PASSED_TO_ISYRAQ → Hand to Isyraq for processing
12. ECOS_SUBMITTED → Isyraq submits
13. ECOS_APPROVED → ECOS reviews

### Phase 5: Installation
14. INVOICE_SENT_40 → CS sends 40% invoice
15. 40_COLLECTED → Finance confirms, gate for installation
16. INSTALLATION_DONE → Engineer installs, 3+ photos required

### Phase 6: Closure
17. INVOICE_SENT_10 → CS sends final invoice
18. 10_COLLECTED → Finance confirms
19. TC → Customer signs T&C
20. SRATO → CS submits within 7 days of installation
21. TURN_ON → SESB activates (terminal state)

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS with custom utility classes (.input)
- React Query (TanStack Query) for server state
- Firebase Auth (email/password)
- Cloud Firestore with security rules
- Cloud Functions (generateCustomerCode, onLeadStatusChange, createUserProfile)
- Firebase Hosting
- lucide-react for icons
- papaparse for CSV export

## Implementation Status
- Phase 1 ✅: Lead CRUD, Pipeline tracking, Auth, Basic dashboard
- Phase 2 ✅: React Query hooks, Enhanced DailyUpdate, Reports with revenue analytics, Mobile responsive, Toast notifications, Confirmation dialogs, Loading skeletons
- Phase 3: Google Form integration, Drive folder sync
- Phase 4: Polish, Testing, Deploy

## Cloud Functions
- `generateCustomerCode` — Auto-assigns SRS-YYMMXXXX on lead creation
- `onLeadStatusChange` — Logs status changes to statusUpdates audit trail
- `createUserProfile` — Syncs Firebase Auth users to Firestore

## Deployment
1. Copy `.env.example` → `.env` and fill in Firebase config
2. `firebase login`
3. `firebase init` (select existing project)
4. `firebase deploy`
