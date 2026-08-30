# CRM Module — Requirements Specification

## 1. Overview

CRM module for a solar energy company in Sabah, Malaysia. Tracks customer leads from Google Form intake through site visit, proposal, installation, and system activation. Built with ReactJS + Firebase, deployed on Google Cloud Firebase.

---

## 2. Users / Roles

| Role | Access |
|------|--------|
| Admin | Full access — manage users, view all data, system settings |
| Sales Executive | Create/edit leads assigned to them, view own pipeline |
| Customer Service (CS) | Daily updates, status changes, remarks |
| Engineer | Site visit info, installation status |

---

## 3. Lead Pipeline Stages

Leads progress through these statuses (in order):

1. **GOOGLE FORM-INCOMING** — New lead from Google Form
2. **NO RESPONSE** — CS attempted contact, no reply
3. **SITE VISIT** — Site visit scheduled or completed
4. **PROPOSAL & QUOTATION** — Proposal/quotation prepared
5. **BOOKING FEE RECEIVED** — Booking fee collected
6. **SESB SUBMITTED** — Application submitted to SESB
7. **SESB APPROVED** — SESB approval received
8. **PROFORMA SENT** — Proforma invoice sent
9. **50% COLLECTED** — 50% payment received
10. **ECOS DOCS COLLECTED** — ECOS documents collected
11. **PASSED TO ISYRAQ** — Handed to Isyraq for processing
12. **ECOS SUBMITTED** — ECOS submitted
13. **ECOS APPROVED** — ECOS approved
14. **INVOICE SENT (40%)** — 40% invoice sent
15. **40% COLLECTED** — 40% payment received
16. **INSTALLATION DONE** — Installation completed
17. **INVOICE SENT (10%)** — Final 10% invoice sent
18. **10% COLLECTED** — Final payment received
19. **T&C** — Terms & conditions signed
20. **SRATO** — SRATO submitted
21. **TURN ON** — System activated

---

## 4. Data Fields

### 4.1 Customer / Lead

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| customerCode | string | auto | Format: `SRS-YYMMXXXX` (e.g., SRS-26070001) |
| clientName | string | yes | |
| status | enum | yes | Pipeline stage (see section 3) |
| contactDetails | string | yes | Phone number |
| siteVisitDate | date | no | |
| siteVisitDoneBy | string | no | Person who did the visit |
| salesExecutive | string | no | PIC |
| proposalPreparedBy | string | no | |
| phase | enum | no | `Single Phase` / `3 Phase` |
| avgMonthlyBill | string | no | Electricity bill range (e.g., "301-500", "Above RM800") |
| preferredSystem | enum | no | `Solar only` / `Solar + battery` / `Request both` / `Does not mention` |
| propertyType | enum | no | `Terrace` / `Bungalow` / `Semi D` / `Detached House` / `Landed House` |
| proposedCapacity | string | no | kWp value |
| projectValue | string | no | RM value |
| location | string | no | Area/district |
| gpsPin | string | no | Lat,Long coordinates |
| customerFolder | string | no | Google Drive folder reference |
| remarks | string | no | Free text |
| createdAt | timestamp | auto | |
| updatedAt | timestamp | auto | |
| createdBy | string | auto | User ID |

### 4.2 Pipeline Status Update

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | auto | |
| customerCode | string | yes | Reference to lead |
| stage | enum | yes | Pipeline stage |
| status | enum | yes | `DONE` / `PENDING` / `AFTER ECOS` |
| updatedBy | string | yes | User ID |
| updatedAt | timestamp | auto | |
| notes | string | no | Stage-specific notes |

### 4.3 Users

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| uid | string | auto | Firebase Auth UID |
| displayName | string | yes | |
| email | string | yes | |
| role | enum | yes | `admin` / `sales` / `cs` / `engineer` |
| active | boolean | yes | |

---

## 5. Functional Requirements

### 5.1 Lead Management
- **FR-01**: Create new lead manually or via Google Form webhook
- **FR-02**: Auto-generate customer code on creation
- **FR-03**: Edit lead details
- **FR-04**: Delete lead (admin only, soft delete)
- **FR-05**: Search leads by name, code, phone, location
- **FR-06**: Filter leads by status, sales exec, location, property type, phase
- **FR-07**: Sort leads by any column

### 5.2 Pipeline Tracking
- **FR-08**: View lead pipeline as Kanban board or table
- **FR-09**: Update lead status (move to next stage)
- **FR-10**: Track who updated each stage and when
- **FR-11**: View status history per lead

### 5.3 Dashboard
- **FR-12**: Total leads count (by status)
- **FR-13**: Leads by sales executive
- **FR-14**: Conversion rate (leads → installation done)
- **FR-15**: Monthly new leads trend
- **FR-16**: Revenue pipeline (project values by stage)
- **FR-17**: Upcoming site visits

### 5.4 Daily Update by CS
- **FR-18**: CS can bulk-update multiple lead statuses in one view
- **FR-19**: Quick status change with dropdown per stage column
- **FR-20**: Remarks field for each status update

### 5.5 Reporting
- **FR-21**: Export leads to CSV/Excel
- **FR-22**: Filter by date range
- **FR-23**: Summary report by status, sales exec, location

### 5.6 Authentication & Authorization
- **FR-24**: Firebase Authentication (email/password or Google)
- **FR-25**: Role-based access control
- **FR-26**: Admin can manage user roles

---

## 6. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Responsive design — works on desktop and mobile |
| NFR-02 | Page load < 2s on 3G connection |
| NFR-03 | Data backup via Firebase automatic backups |
| NFR-04 | HTTPS enforced |
| NFR-05 | Firebase Security Rules restrict data access by role |
| NFR-06 | Audit trail for all status changes |
| NFR-07 | Support Malay and English (MVP: English only) |

---

## 7. Integration Points

| System | Purpose |
|--------|---------|
| Google Forms | Lead intake (webhook or scheduled import) |
| Google Drive | Customer folder management |
| Firebase Hosting | Web app deployment |
| Firebase Auth | User authentication |
| Cloud Firestore | Primary database |
| Firebase Functions | Backend logic (auto-code generation, webhooks) |

---

## 8. Out of Scope (Phase 1)

- SMS/WhatsApp notifications
- Quotation/PDF generation
- Financial accounting integration
- Mobile native app (PWA acceptable)
- Multi-branch/multi-company support
