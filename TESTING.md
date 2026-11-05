# QueryX Test Execution & QA Report

**Environment**: Local (Node.js v18.20.8, Express 5.3.0, WebSocket, http://localhost:3000), Browser: Google Chrome  
**Tester**: MD. Mahmudul Hasan  
**Test Cycle**: Acceptance & Regression Test Cycle v2.5  
**Execution Date**: 2026-11-06  

---

## 1. Test Cases Execution Matrix

| ID | Module | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-01 | Login | 1. Navigate to application URL.<br>2. Click Administrator role preset (or enter `admin@queryx.io` / `admin`).<br>3. Click "Sign In to Dashboard". | Admin dashboard opens with full access to all menus (Tickets, Omnichannel Inbox, Main Board, SLA & Analytics, Business Analyzes, Process Flowchart, Team & Agents, Billing, Integrations). | Admin workspace loaded with executive privileges; all admin management routes visible. | PASS |
| TC-02 | Login | 1. Select Support Agent role preset (or enter `agent@queryx.io` / `agent`).<br>2. Click "Sign In to Dashboard". | Agent workspace opens with operational menus only (Tickets, Omnichannel, Main Board, Analytics, Business Analyzes). | Agent workspace loaded; Billing, Team, and App Integrations sections are completely hidden. | PASS |
| TC-03 | Login | 1. Enter `admin@queryx.io` with wrong password `invalidpass`.<br>2. Click "Sign In to Dashboard". | Error message displayed; access denied; user remains on login modal. | Error message "Invalid credentials" displayed; dashboard access blocked. | PASS |
| TC-04 | Login | 1. Clear email and password fields.<br>2. Click "Sign In to Dashboard". | Browser HTML5 input validation prevents submission with prompt. | Validation warning displayed indicating required inputs; form submission prevented. | PASS |
| TC-05 | Access Control | 1. Login as Agent (`agent@queryx.io`).<br>2. Check sidebar for App Integrations, Team, and Billing.<br>3. Attempt direct UI invocation or API access. | Access denied or menu completely hidden from Agent view; backend rejects unauthorized API calls with 403 Forbidden. | Menus are omitted from Agent DOM; server returns 403 Forbidden with "Access Denied" payload upon direct request. | PASS |
| TC-06 | Access Control | 1. Login as Agent.<br>2. Navigate to SLA & Analytics.<br>3. Attempt to trigger CSV export. | CSV export button is hidden for Agent; backend restricts `/api/sla/export` to Administrator only. | Export button hidden in Agent interface; API endpoint strictly verifies role and returns 403 for non-admins. | PASS |
| TC-07 | Billing | 1. Login as Admin.<br>2. Open Billing & Ledger section.<br>3. Click "Export Billing Ledger (CSV)". | CSV file downloads containing invoice records (INV IDs, billing dates, amounts, payment methods, status). | `QueryX_Billing_Ledger_<timestamp>.csv` downloaded successfully with complete financial dataset. | PASS |
| TC-08 | Tickets | 1. Trigger inbound omnichannel simulation (Telegram/Messenger/Email).<br>2. Observe Tickets & Queue table. | Ticket is ingested automatically with status "Open" or "In Progress" without manual form submission. | Ticket `QX-XXXX` generated with customer profile, platform tag, and assigned queue. | PASS |
| TC-09 | Tickets | 1. Open ticket detail view.<br>2. Change lifecycle status: Open -> In Progress -> Waiting for Customer -> Resolved -> Closed. | Ticket lifecycle state transitions properly and updates across both Table view and Main Board columns. | Status badge and Main Board column update instantaneously; data persisted to storage. | PASS |
| TC-10 | Tickets | 1. Open QueryX in two browser sessions simultaneously.<br>2. Reply or update status in Session 1.<br>3. Observe Session 2 without reloading. | Session 2 updates in real time via live WebSocket broadcast. | WebSocket broadcast delivers `NEW_OMNICHANNEL_MESSAGE` / `TICKET_UPDATED` event instantly to second window. | PASS |
| TC-11 | Analytics | 1. Resolve an active ticket.<br>2. Navigate to Business Analyzes module.<br>3. Inspect Problem Fixed Rate KPI and leaderboard. | Problem Fixed Rate percentage automatically recalculates and increases based on solved count. | Fixed Rate KPI automatically updated; agent leaderboard and hourly chart reflect newly resolved ticket. | PASS |
| TC-12 | Team | 1. Login as Admin, open Team & Agents.<br>2. Click "Add New Agent", input name, email, department, password.<br>3. Log out and log in with the new agent credentials. | New agent is persisted to database roster and can authenticate successfully with Agent role permissions. | New agent created, visible in personnel table, and successfully logged in with assigned permissions. | PASS |

---

## 2. Bug Reports & Issue Log

### Bug Report 01
- **Title**: [Bug] Direct WebSocket handshake failure on static GitHub Pages host
- **Steps to reproduce**:
  1. Deploy static build to GitHub Pages.
  2. Access `https://<username>.github.io/<repo>/`.
  3. Attempt authentication while client initializes `new WebSocket("wss://...")`.
- **Expected result**: Client should detect static environment and gracefully bypass WebSocket connection without throwing unhandled exceptions.
- **Actual result**: Browser threw `Connection Refused` on WebSocket handshake, interrupting synchronous login execution.
- **Severity**: High
- **Resolution**: Implemented client-side hostname detection (`window.location.hostname.includes('github.io')`) to bypass local WebSocket protocols on static hosts and fall back to standalone reactive data stores. Status: **Resolved / Closed**.

---

### Bug Report 02
- **Title**: [Bug] Duplicate layout elements appearing side by side on widescreen viewport
- **Steps to reproduce**:
  1. Open dashboard view in wide aspect desktop browser.
  2. Inspect sidebar and workspace wrappers.
- **Expected result**: Single unified sidebar with responsive layout container.
- **Actual result**: Duplicate `<aside>` elements and parallel workspace wrappers were rendered side by side.
- **Severity**: Medium
- **Resolution**: Eliminated duplicate DOM trees and restructured flex containers to enforce single responsive aside layout. Status: **Resolved / Closed**.

---

### Bug Report 03
- **Title**: [Bug] Unauthorized access to App Integrations and Billing via URL parameter
- **Steps to reproduce**:
  1. Authenticate as Support Agent.
  2. Trigger navigation switch to `integrations` or `billing` view.
- **Expected result**: Action blocked with access denied notification; view unchanged.
- **Actual result**: Navigation switch permitted tab change if client-side verification was omitted.
- **Severity**: High
- **Resolution**: Enforced strict Role-Based Access Control (RBAC) guards both in frontend navigation switcher (`switchView`) and server API middleware (`x-user-role` header validation). Status: **Resolved / Closed**.

---

## 3. QA Summary & Sign-off

- **Total Test Cases Executed**: 12
- **Passed**: 12
- **Failed**: 0
- **Defect Resolution Rate**: 100%
- **QA Verdict**: **APPROVED FOR PRODUCTION RELEASE**
