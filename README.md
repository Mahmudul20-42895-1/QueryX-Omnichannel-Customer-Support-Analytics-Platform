# QueryX: Omnichannel Customer Support & Analytics Platform

QueryX is an enterprise-grade customer support, ticketing, and business analytics platform designed for support organizations and operations directors. It provides centralized omnichannel messaging, automated ticket ingestion, performance analytics, and billing management without manual reporting.

## Architectural Overview

The application is structured around two operational tiers:
- Administrator: Governs omnichannel app integrations, enterprise billing ledgers, staff roster provisioning, and executive SLA reporting.
- Support Agent: Focuses on ticket resolution, omnichannel responses across connected channels, and pipeline progression on the Main Board.

## Core Capabilities

### 1. Centralized Omnichannel Gateway
Inbound queries from external customer platforms are captured, parsed, and converted into actionable tickets:
- Telegram Bot: Long-polling and webhook listener for inbound chats and direct replies.
- Facebook Messenger: Meta Graph API integration for corporate page message management.
- Instagram Direct: Direct messaging synchronization for commercial accounts.
- Email Gateway: SMTP and inbound webhook parsing for email query handling.

### 2. Autonomous Ticket Routing
Tickets are automatically ingested and routed to support agents based on department and category:
- Lifecycle tracking: Open, In Progress, Waiting for Customer, Resolved, Closed.
- Real-time synchronization powered by WebSockets.
- Direct-to-platform replies: Agents respond inside QueryX, and the response is automatically dispatched to the customer's origin platform.

### 3. Business Analytics & Automation
Real-time analytics computed directly from live database transactions without manual data manipulation:
- Problem Fixed Rate: Automatically calculates completion percentages against incoming volume.
- Customer Major Issues: Categorizes weekly root-cause distribution (Technical, Billing, Account).
- 7-Day Ticket Trends: Interactive line charts tracking daily volume trajectories.
- Response Business Growth by Hour: Area chart illustrating hourly customer traffic and resolution velocity.
- Channel Analytics: Hourly breakdown of resolved complaints mapped to individual agents.

### 4. Process Flowchart Architecture
A dedicated systems flowchart tab illustrating the dynamic interaction between external customer platforms, QueryX gateway routers, agent execution queues, automated billing ledgers, and contract SLA compliance.

### 5. Enterprise Billing & Ledger
- Active subscription plan breakdown and seat allocation tracking.
- Past invoice ledger with status, due dates, and payment methods.
- Executive CSV export restricted exclusively to Administrators.

### 6. Team & Employee Provisioning
Administrators can onboard new agents and employees, assign departments, and configure credentials directly from the console.
### 7. Integration Status


| Channel | Status |
|---|---|
| Telegram Bot | Working / Demo / Planned |
| Facebook Messenger | Working / Demo / Planned |
| Instagram Direct | Working / Demo / Planned |
| Email Gateway | Working / Demo / Planned |

Testing section: See [TESTING.md](TESTING.md) for test cases and bug reports.


## Project Structure

```
query_x/
|-- public/
|   |-- index.html               # Frontend application, dashboards, and charts
|   `-- screenshots/             # Interface reference documentation
|-- server.js                    # Express server, WebSocket engine, and omnichannel handlers
|-- tickets_data.json            # Persistent ticket database
|-- users_data.json              # Personnel credentials and authorization tiers
|-- billing_data.json            # Financial ledgers and subscription records
|-- integrations_data.json       # App integration tokens and connection states
|-- package.json                 # Project dependencies and startup scripts
`-- README.md                    # System documentation
```

## Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Git

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd query_x
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the application:
   ```bash
   npm start
   ```
   Or run directly with Node:
   ```bash
   node server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Default Credentials

### Administrator
- Email: `admin@queryx.io`
- Password: `admin`
- Access: Full system access including App Integrations, Team Management, SLA Export, and Billing.

### Support Agent
- Email: `agent@queryx.io`
- Password: `agent`
- Access: Tickets & Queue, Omnichannel Inbox, Main Board, and Business Analyzes.

## Deployment & Hosting

### Option A: GitHub Pages (Static Interface)
The `public/` directory contains `index.html` which can be served directly via GitHub Pages for demonstration purposes.

### Option B: Cloud Application Hosting (Render, Railway, Fly.io, Vercel)
For full WebSocket connectivity and active omnichannel long-polling:
1. Connect this repository to Render or Railway.
2. Build command: `npm install`
3. Start command: `node server.js`
4. Environment port: `3000` (or dynamic `process.env.PORT`)

## License
Proprietary enterprise software developed for QueryX UK Operations.
