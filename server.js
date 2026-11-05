const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Database File Paths
const TICKETS_FILE = path.join(__dirname, 'tickets_data.json');
const INTEGRATIONS_FILE = path.join(__dirname, 'integrations_data.json');
const USERS_FILE = path.join(__dirname, 'users_data.json');
const BILLING_FILE = path.join(__dirname, 'billing_data.json');

// Only 2 Roles: Admin and Agent
const DEFAULT_USERS = [
  {
    id: "usr_admin",
    name: "Admin Director",
    email: "admin@queryx.io",
    password: "admin",
    role: "Admin",
    avatar: "AD",
    department: "Executive Operations & Billing",
    activeStatus: "Active",
    joinedDate: "2025-01-10"
  },
  {
    id: "usr_agent1",
    name: "Jason Duong",
    email: "agent@queryx.io",
    password: "agent",
    role: "Agent",
    avatar: "JD",
    department: "Technical Escalations",
    activeStatus: "Active",
    joinedDate: "2025-04-12"
  },
  {
    id: "usr_agent2",
    name: "Nhi Pham",
    email: "nhi@queryx.io",
    password: "agent",
    role: "Agent",
    avatar: "NP",
    department: "Customer Success & Resolution",
    activeStatus: "Active",
    joinedDate: "2025-06-20"
  }
];

// Billing Default Records
const DEFAULT_BILLING = {
  subscription: {
    planName: "Enterprise Tier UK",
    status: "Active",
    monthlyPrice: 1250,
    currency: "GBP (£)",
    billingCycle: "Annual (Billed Monthly)",
    renewsOn: "2027-01-15",
    seatsActive: 18,
    seatsTotal: 25,
    connectedChannels: 4,
    slaTargetCompliance: "99.4%"
  },
  invoices: [
    {
      invoiceId: "INV-2026-0091",
      date: "2026-11-01",
      dueDate: "2026-11-15",
      amount: "£1,250.00",
      status: "Paid",
      paymentMethod: "Corporate Wire Transfer •••• 9821",
      pdfUrl: "#"
    },
    {
      invoiceId: "INV-2026-0082",
      date: "2026-10-01",
      dueDate: "2026-10-15",
      amount: "£1,250.00",
      status: "Paid",
      paymentMethod: "Corporate Wire Transfer •••• 9821",
      pdfUrl: "#"
    },
    {
      invoiceId: "INV-2026-0071",
      date: "2026-09-01",
      dueDate: "2026-09-15",
      amount: "£1,480.00",
      status: "Paid",
      paymentMethod: "Mastercard •••• 4129",
      pdfUrl: "#"
    },
    {
      invoiceId: "INV-2026-0063",
      date: "2026-08-01",
      dueDate: "2026-08-15",
      amount: "£1,250.00",
      status: "Paid",
      paymentMethod: "Mastercard •••• 4129",
      pdfUrl: "#"
    }
  ],
  paymentMethods: [
    {
      id: "pm_1",
      type: "Bank Transfer",
      name: "Barclays Corporate UK Account",
      accountEnding: "9821",
      isPrimary: true
    },
    {
      id: "pm_2",
      type: "Corporate Card",
      name: "Mastercard Business",
      accountEnding: "4129",
      isPrimary: false
    }
  ]
};

// Default Integrations
const DEFAULT_INTEGRATIONS = {
  telegram: {
    platform: 'Telegram',
    enabled: true,
    botToken: '',
    botUsername: 'QueryX_Support_Bot',
    status: 'Connected',
    lastSync: new Date().toISOString()
  },
  messenger: {
    platform: 'Facebook Messenger',
    enabled: true,
    pageId: '108291827461',
    pageAccessToken: '',
    verifyToken: 'queryx_verify_token_2026',
    status: 'Connected',
    lastSync: new Date().toISOString()
  },
  instagram: {
    platform: 'Instagram Direct',
    enabled: true,
    igAccountId: '17841400291',
    accessToken: '',
    status: 'Connected',
    lastSync: new Date().toISOString()
  },
  email: {
    platform: 'Email (SMTP/IMAP)',
    enabled: true,
    smtpHost: 'smtp.queryx.io',
    smtpPort: 587,
    smtpUser: 'support@queryx.io',
    fromEmail: 'support@queryx.io',
    status: 'Connected',
    lastSync: new Date().toISOString()
  }
};

// Initial Tickets
const INITIAL_TICKETS = [
  {
    id: "QX-1001",
    subject: "SSO SAML configuration failing on IdP callback",
    description: "Our enterprise Okta integration returns HTTP 500 when users redirect back from login portal.",
    category: "Technical",
    priority: "High",
    status: "Resolved",
    channel: "Email",
    platform: "Email",
    externalChatId: "sarah.j@acme.corp",
    customer: { name: "Sarah Jenkins", email: "sarah.j@acme.corp" },
    assignee: { name: "Jason Duong", email: "agent@queryx.io", avatar: "JD" },
    health: "On Track",
    resolutionTimeHours: 1.8,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    conversations: [
      {
        id: "m_1",
        author: "Sarah Jenkins",
        senderRole: "Customer",
        time: "5 hours ago",
        text: "Hi support team, Okta SAML callback throws 500 internal server error. Please check.",
        isInternal: false,
        platform: "Email"
      },
      {
        id: "m_2",
        author: "Jason Duong",
        senderRole: "Agent",
        time: "3 hours ago",
        text: "Checked Auth0 certificate fingerprint. Re-synced SAML assertion audience URL. Fixed.",
        isInternal: false,
        platform: "Email"
      }
    ]
  },
  {
    id: "QX-1002",
    subject: "Payment deducted twice for annual enterprise plan",
    description: "Credit card charged £480 twice on checkout, dashboard still shows Free tier.",
    category: "Billing",
    priority: "Urgent",
    status: "In Progress",
    channel: "Telegram",
    platform: "Telegram",
    externalChatId: "tg_77192",
    customer: { name: "David Kim", email: "david@fastops.kr" },
    assignee: { name: "Jason Duong", email: "agent@queryx.io", avatar: "JD" },
    health: "Breached",
    resolutionTimeHours: null,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    conversations: [
      {
        id: "m_3",
        author: "David Kim",
        senderRole: "Customer",
        time: "8 hours ago",
        text: "Hey! Telegram bot replied, but payment charged twice. Transaction ref TXN-49191.",
        isInternal: false,
        platform: "Telegram"
      },
      {
        id: "m_3b",
        author: "Jason Duong",
        senderRole: "Agent",
        time: "4 hours ago",
        text: "Connecting with Stripe billing settlement team to void second charge and unlock seats.",
        isInternal: false,
        platform: "Telegram"
      }
    ]
  },
  {
    id: "QX-1003",
    subject: "Facebook Ad lead asking about API Rate Limits",
    description: "Inquiry received via Facebook page direct message asking for enterprise API limits.",
    category: "Technical",
    priority: "Medium",
    status: "Waiting for Customer",
    channel: "Messenger",
    platform: "Messenger",
    externalChatId: "fb_992120",
    customer: { name: "Elena Rostova", email: "elena@client.eu" },
    assignee: { name: "Nhi Pham", email: "nhi@queryx.io", avatar: "NP" },
    health: "On Track",
    resolutionTimeHours: null,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    conversations: [
      {
        id: "m_4",
        author: "Elena Rostova",
        senderRole: "Customer",
        time: "Yesterday",
        text: "Hello! We run 10M requests daily. Can your endpoints handle our webhook throughput?",
        isInternal: false,
        platform: "Messenger"
      },
      {
        id: "m_5",
        author: "Nhi Pham",
        senderRole: "Agent",
        time: "6 hours ago",
        text: "Hi Elena! Yes, our Tier-3 Dedicated plan offers 25k req/min with automatic bursting.",
        isInternal: false,
        platform: "Messenger"
      }
    ]
  },
  {
    id: "QX-1004",
    subject: "Instagram DM: Product influencer partnership inquiry",
    description: "Customer sent DM asking about enterprise sponsorship and API discount codes.",
    category: "Other",
    priority: "Low",
    status: "Resolved",
    channel: "Instagram",
    platform: "Instagram",
    externalChatId: "ig_44210",
    customer: { name: "Alex Rivera", email: "alex@creatorhub.co" },
    assignee: { name: "Nhi Pham", email: "nhi@queryx.io", avatar: "NP" },
    health: "On Track",
    resolutionTimeHours: 2.1,
    createdAt: new Date(Date.now() - 3600000 * 32).toISOString(),
    conversations: [
      {
        id: "m_6",
        author: "Alex Rivera",
        senderRole: "Customer",
        time: "2 days ago",
        text: "Sent DM on Instagram regarding sponsorship agreement for QueryX launch.",
        isInternal: false,
        platform: "Instagram"
      },
      {
        id: "m_7",
        author: "Nhi Pham",
        senderRole: "Agent",
        time: "1 day ago",
        text: "Provided enterprise marketing partner agreement pack. Ticket closed.",
        isInternal: false,
        platform: "Instagram"
      }
    ]
  },
  {
    id: "QX-1005",
    subject: "UK VAT Invoice #INV-2026-0082 reconciliation",
    description: "Customer accountant requesting amended reverse-charge UK HMRC VAT breakdown.",
    category: "Billing",
    priority: "Medium",
    status: "Resolved",
    channel: "Email",
    platform: "Email",
    externalChatId: "billing@ukcorp.co.uk",
    customer: { name: "Oliver Brown", email: "billing@ukcorp.co.uk" },
    assignee: { name: "Nhi Pham", email: "nhi@queryx.io", avatar: "NP" },
    health: "On Track",
    resolutionTimeHours: 1.2,
    createdAt: new Date(Date.now() - 3600000 * 45).toISOString(),
    conversations: [
      {
        id: "m_8",
        author: "Oliver Brown",
        senderRole: "Customer",
        time: "2 days ago",
        text: "Please send VAT invoice with UK company tax registration #882910.",
        isInternal: false,
        platform: "Email"
      }
    ]
  },
  {
    id: "QX-1006",
    subject: "Webhook latency spikes on European Frankfurt region",
    description: "Inbound payload queue backing up with 504 Gateway Timeouts.",
    category: "Technical",
    priority: "Urgent",
    status: "In Progress",
    channel: "Telegram",
    platform: "Telegram",
    externalChatId: "tg_88192",
    customer: { name: "Marcus Lindner", email: "marcus@cloudgermany.de" },
    assignee: { name: "Jason Duong", email: "agent@queryx.io", avatar: "JD" },
    health: "Warning",
    resolutionTimeHours: null,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    conversations: [
      {
        id: "m_9",
        author: "Marcus Lindner",
        senderRole: "Customer",
        time: "4 hours ago",
        text: "Critical: EU Frankfurt cluster latency spiked over 2800ms. Please escalate.",
        isInternal: false,
        platform: "Telegram"
      }
    ]
  }
];

function loadJSON(file, fallback) {
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
      return fallback;
    }
  }
  saveJSON(file, fallback);
  return fallback;
}

function saveJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('File write error:', e);
  }
}

let users = loadJSON(USERS_FILE, DEFAULT_USERS);
let integrations = loadJSON(INTEGRATIONS_FILE, DEFAULT_INTEGRATIONS);
let tickets = loadJSON(TICKETS_FILE, INITIAL_TICKETS);
let billing = loadJSON(BILLING_FILE, DEFAULT_BILLING);

let activeTgBot = null;

function broadcastWS(type, payload) {
  const msg = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

function setupTelegramBot() {
  if (activeTgBot) {
    try { activeTgBot.stopPolling(); } catch(e) {}
    activeTgBot = null;
  }

  const tgConfig = integrations.telegram;
  if (tgConfig && tgConfig.enabled && tgConfig.botToken) {
    try {
      activeTgBot = new TelegramBot(tgConfig.botToken, { polling: true });
      activeTgBot.getMe().then(botInfo => {
        integrations.telegram.status = 'Connected';
        integrations.telegram.botUsername = botInfo.username;
        saveJSON(INTEGRATIONS_FILE, integrations);
        broadcastWS('INTEGRATION_STATUS_CHANGE', { platform: 'telegram', status: 'Connected' });
      }).catch(err => {
        integrations.telegram.status = 'Error';
        saveJSON(INTEGRATIONS_FILE, integrations);
      });

      activeTgBot.on('message', (msg) => {
        if (!msg.text) return;
        const chatId = msg.chat.id.toString();
        const senderName = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || msg.from.username || `User_${chatId}`;
        const text = msg.text;

        let ticket = tickets.find(t => t.platform === 'Telegram' && t.externalChatId === chatId && t.status !== 'Closed');

        if (!ticket) {
          const newId = `QX-${Math.floor(1000 + Math.random() * 9000)}`;
          ticket = {
            id: newId,
            subject: `Telegram: ${text.substring(0, 45)}${text.length > 45 ? '...' : ''}`,
            description: text,
            category: 'Technical',
            priority: 'Medium',
            status: 'Open',
            channel: 'Telegram',
            platform: 'Telegram',
            externalChatId: chatId,
            customer: { name: senderName, email: `${msg.from.username || chatId}@telegram.queryx` },
            assignee: { name: 'Jason Duong', email: 'agent@queryx.io', avatar: 'JD' },
            health: 'On Track',
            createdAt: new Date().toISOString(),
            conversations: []
          };
          tickets.unshift(ticket);
        }

        const newMsg = {
          id: 'msg_tg_' + Date.now(),
          author: senderName,
          senderRole: 'Customer',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text,
          isInternal: false,
          platform: 'Telegram'
        };

        ticket.conversations.push(newMsg);
        saveJSON(TICKETS_FILE, tickets);
        broadcastWS('NEW_OMNICHANNEL_MESSAGE', { ticketId: ticket.id, message: newMsg, ticket });
      });
    } catch (e) {
      integrations.telegram.status = 'Error';
      saveJSON(INTEGRATIONS_FILE, integrations);
    }
  }
}

setupTelegramBot();

// ======================== API ROUTES ========================

// 1. Role-Based Login (Admin & Agent Only)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Access restricted to Admin & Agent personnel only.' });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // 'Admin' or 'Agent'
      avatar: user.avatar,
      department: user.department
    }
  });
});

// 2. Agents / Employees API (Admin Can Add New Agent/Employee)
app.get('/api/agents', (req, res) => {
  const agentList = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    department: u.department,
    activeStatus: u.activeStatus || 'Active',
    joinedDate: u.joinedDate || '2025-01-01'
  }));
  res.json({ success: true, data: agentList });
});

app.post('/api/agents', (req, res) => {
  const role = req.headers['x-user-role'];
  if (role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Only Admin can add new agents or employees.' });
  }

  const { name, email, password, department, roleType } = req.body;
  if (!name || !email) {
    return res.status(400).json({ success: false, message: 'Name and email are required.' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
  }

  const avatar = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AG';
  const newAgent = {
    id: 'usr_' + Date.now(),
    name,
    email: email.toLowerCase().trim(),
    password: password || 'agent123',
    role: roleType === 'Admin' ? 'Admin' : 'Agent',
    avatar,
    department: department || 'Customer Support',
    activeStatus: 'Active',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  users.push(newAgent);
  saveJSON(USERS_FILE, users);

  broadcastWS('AGENT_ADDED', newAgent);
  res.status(201).json({ success: true, message: `New Agent ${name} added successfully!`, data: newAgent });
});

// 3. Tickets API
app.get('/api/tickets', (req, res) => {
  res.json({ success: true, count: tickets.length, data: tickets });
});

app.patch('/api/tickets/:id', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

  const { status, priority, assigneeName, health } = req.body;
  if (status) {
    ticket.status = status;
    if (status === 'Resolved' && !ticket.resolutionTimeHours) {
      ticket.resolutionTimeHours = +(Math.random() * 2 + 0.8).toFixed(1);
    }
  }
  if (priority) ticket.priority = priority;
  if (health) ticket.health = health;
  if (assigneeName) {
    ticket.assignee = {
      name: assigneeName,
      email: assigneeName.toLowerCase().replace(/\s+/g, '.') + '@queryx.io',
      avatar: assigneeName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    };
  }

  saveJSON(TICKETS_FILE, tickets);
  broadcastWS('TICKET_UPDATED', ticket);
  res.json({ success: true, data: ticket });
});

// 4. Send Reply / Staff Internal Note
app.post('/api/tickets/:id/reply', async (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

  const { author, senderRole, text, isInternal } = req.body;
  if (!text) return res.status(400).json({ success: false, message: 'Message text required' });

  const replyMsg = {
    id: 'msg_' + Date.now(),
    author: author || 'Support Agent',
    senderRole: senderRole || 'Agent',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text,
    isInternal: !!isInternal,
    platform: ticket.platform || ticket.channel
  };

  ticket.conversations.push(replyMsg);

  if (!isInternal) {
    ticket.status = 'Waiting for Customer';
    if (ticket.platform === 'Telegram' && ticket.externalChatId && activeTgBot) {
      try {
        await activeTgBot.sendMessage(ticket.externalChatId, `[QueryX Support - ${author}]\n${text}`);
      } catch (tgErr) {
        console.error('Telegram dispatch error:', tgErr.message);
      }
    }
  }

  saveJSON(TICKETS_FILE, tickets);
  broadcastWS('NEW_OMNICHANNEL_MESSAGE', { ticketId: ticket.id, message: replyMsg, ticket });
  res.json({ success: true, data: replyMsg, ticket });
});

// 5. App Integrations Management (Admin Only)
app.get('/api/integrations', (req, res) => {
  const role = req.headers['x-user-role'];
  if (role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Only Admin can access Integrations' });
  }
  res.json({ success: true, data: integrations });
});

app.post('/api/integrations/:platform', (req, res) => {
  const role = req.headers['x-user-role'];
  if (role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Only Admin can configure Integrations' });
  }

  const platform = req.params.platform.toLowerCase();
  if (!integrations[platform]) {
    return res.status(404).json({ success: false, message: 'Platform not supported' });
  }

  const { enabled, ...configData } = req.body;
  integrations[platform] = {
    ...integrations[platform],
    ...configData,
    enabled: !!enabled,
    status: enabled ? 'Connected' : 'Disconnected',
    lastSync: new Date().toISOString()
  };

  saveJSON(INTEGRATIONS_FILE, integrations);
  if (platform === 'telegram') setupTelegramBot();

  broadcastWS('INTEGRATION_CONFIG_UPDATED', { platform, config: integrations[platform] });
  res.json({ success: true, message: `${integrations[platform].platform} settings updated`, data: integrations[platform] });
});

// 6. Billing Management (Admin Only)
app.get('/api/billing', (req, res) => {
  const role = req.headers['x-user-role'];
  if (role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Only Admin can access Billing' });
  }
  res.json({ success: true, data: billing });
});

app.post('/api/billing/invoices/export', (req, res) => {
  const role = req.headers['x-user-role'];
  if (role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied' });
  }

  let csv = 'Invoice ID,Billing Date,Due Date,Amount,Status,Payment Method\n';
  billing.invoices.forEach(inv => {
    csv += `"${inv.invoiceId}","${inv.date}","${inv.dueDate}","${inv.amount}","${inv.status}","${inv.paymentMethod}"\n`;
  });

  res.header('Content-Type', 'text/csv');
  res.attachment(`QueryX_Billing_Ledger_${Date.now()}.csv`);
  res.send(csv);
});

// 7. SLA Report Export (Admin Only)
app.post('/api/sla/export', (req, res) => {
  const role = req.headers['x-user-role'];
  if (role !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Access Denied: Only Admin can export SLA reports' });
  }

  let csv = 'Ticket ID,Channel,Category,Priority,Status,Assignee,SLA Health,Resolution Hours,Created At\n';
  tickets.forEach(t => {
    csv += `"${t.id}","${t.platform || t.channel}","${t.category}","${t.priority}","${t.status}","${t.assignee?.name || 'Unassigned'}","${t.health}","${t.resolutionTimeHours || 'In Progress'}","${t.createdAt}"\n`;
  });

  res.header('Content-Type', 'text/csv');
  res.attachment(`QueryX_SLA_Executive_Report_${Date.now()}.csv`);
  res.send(csv);
});

// 8. Automated Business Analytics & Hourly Growth Engine (Automata)
app.get('/api/analytics/business-automata', (req, res) => {
  const total = tickets.length;
  const resolved = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const open = tickets.filter(t => t.status === 'Open').length;
  const waiting = tickets.filter(t => t.status === 'Waiting for Customer').length;

  const fixedRatePercentage = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

  // Hourly Growth Data (09:00 - 18:00 BST)
  const hourlyLabels = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const hourlyInboundQueries = [4, 7, 12, 19, 14, 23, 31, 28, 22, 15];
  const hourlyResolvedQueries = [2, 5, 10, 16, 13, 21, 29, 27, 21, 14];

  // Daily Ticket Trends (Line Chart dataset over 7 days)
  const trendDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const incomingTrends = [12, 19, 24, 28, 32, 18, 14];
  const resolvedTrends = [10, 17, 22, 26, 30, 17, 13];

  // Channel Analytics: Problem Solved per hour & breakdown by Agent
  const channelHourlyPerformance = [
    { hour: '10:00 - 11:00', channel: 'Telegram', agent: 'Jason Duong', solved: 4 },
    { hour: '11:00 - 12:00', channel: 'Email', agent: 'Jason Duong', solved: 6 },
    { hour: '13:00 - 14:00', channel: 'Messenger', agent: 'Nhi Pham', solved: 5 },
    { hour: '14:00 - 15:00', channel: 'Instagram', agent: 'Nhi Pham', solved: 7 },
    { hour: '15:00 - 16:00', channel: 'Telegram', agent: 'Jason Duong', solved: 8 },
    { hour: '16:00 - 17:00', channel: 'Email', agent: 'Nhi Pham', solved: 6 }
  ];

  // Major Issues
  const categoryCounts = {};
  tickets.forEach(t => { categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1; });

  const weeklyMajorIssues = Object.entries(categoryCounts).map(([issueName, count]) => ({
    issueName,
    count,
    percentage: ((count / total) * 100).toFixed(1),
    trend: count > 2 ? "+14% vs last week" : "-5% vs last week",
    severity: issueName === 'Billing' || issueName === 'Technical' ? 'High' : 'Normal'
  })).sort((a, b) => b.count - a.count);

  // Agent Performance & Problem Fixed Rate Ranking
  const agentMap = {};
  tickets.forEach(t => {
    const name = t.assignee?.name || 'Unassigned';
    if (!agentMap[name]) {
      agentMap[name] = { name, assigned: 0, resolved: 0, breachCount: 0, totalHours: 0, avatar: t.assignee?.avatar || 'AG' };
    }
    agentMap[name].assigned += 1;
    if (t.status === 'Resolved' || t.status === 'Closed') {
      agentMap[name].resolved += 1;
      agentMap[name].totalHours += (t.resolutionTimeHours || 1.5);
    }
    if (t.health === 'Breached') {
      agentMap[name].breachCount += 1;
    }
  });

  const agentPerformance = Object.values(agentMap).map(ag => {
    const fixRate = ag.assigned > 0 ? ((ag.resolved / ag.assigned) * 100).toFixed(1) : '0.0';
    const avgSpeed = ag.resolved > 0 ? (ag.totalHours / ag.resolved).toFixed(1) + ' hrs' : 'Under Review';
    return {
      ...ag,
      fixRate,
      avgSpeed,
      score: +(fixRate * 0.7 + (ag.assigned * 5) - (ag.breachCount * 10)).toFixed(0)
    };
  }).sort((a, b) => b.score - a.score);

  // Automated Mermaid Workflow generated dynamically from live system status
  const automataGeneratedMermaid = `flowchart LR
    A["Inbound Customers\\n(TG, FB, IG, Email)"]:::nodeStyle --> B["QueryX Gateway Router\\n(4 Live Channels)"]:::nodeStyle
    B --> C{"Auto Ingestion\\n(${total} Tickets Active)"}:::decisionStyle
    C -- "Routing" --> D["Agent Assigned Queue\\n(${agentPerformance[0]?.name || 'Agents'})"]:::nodeStyle
    D --> E["Resolution Engine\\n(Problem Fixed Rate: ${fixedRatePercentage}%)"]:::nodeStyle
    E --> F["Automated Billing & Ledger\\n(£${billing.subscription.monthlyPrice}/mo UK Plan)"]:::nodeStyle
    F --> G(["Live SLA Compliance: 99.4%"]):::endStyle

    classDef nodeStyle fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef decisionStyle fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#fff;
    classDef endStyle fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;`;

  res.json({
    success: true,
    data: {
      totalTickets: total,
      fixedRatePercentage: `${fixedRatePercentage}%`,
      resolvedCount: resolved,
      activeCount: inProgress + open + waiting,
      weeklyMajorIssues,
      agentPerformance,
      topServiceAgent: agentPerformance[0] || null,
      hourlyLabels,
      hourlyInboundQueries,
      hourlyResolvedQueries,
      trendDays,
      incomingTrends,
      resolvedTrends,
      channelHourlyPerformance,
      automataGeneratedMermaid,
      generatedAt: new Date().toISOString()
    }
  });
});

// 9. Simulation Trigger (Auto-routing to Agents)
app.post('/api/integrations/simulate-incoming', (req, res) => {
  const { platform, senderName, text } = req.body;
  if (!platform || !text) return res.status(400).json({ success: false, message: 'Platform and text required' });

  const randomExternalId = 'ext_' + Math.floor(10000 + Math.random() * 90000);
  const newId = `QX-${Math.floor(1000 + Math.random() * 9000)}`;

  const ticket = {
    id: newId,
    subject: `[${platform}] ${text.substring(0, 42)}${text.length > 42 ? '...' : ''}`,
    description: text,
    category: platform === 'Email' ? 'Billing' : 'Technical',
    priority: platform === 'Telegram' ? 'Urgent' : 'High',
    status: 'In Progress',
    channel: platform,
    platform: platform,
    externalChatId: randomExternalId,
    customer: {
      name: senderName || `${platform} Customer`,
      email: `${(senderName || 'user').toLowerCase().replace(/\s+/g, '')}@${platform.toLowerCase()}.com`
    },
    assignee: { name: 'Jason Duong', email: 'agent@queryx.io', avatar: 'JD' },
    health: 'On Track',
    resolutionTimeHours: null,
    createdAt: new Date().toISOString(),
    conversations: [
      {
        id: 'msg_sim_' + Date.now(),
        author: senderName || `${platform} Customer`,
        senderRole: 'Customer',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text,
        isInternal: false,
        platform: platform
      }
    ]
  };

  tickets.unshift(ticket);
  saveJSON(TICKETS_FILE, tickets);
  broadcastWS('NEW_OMNICHANNEL_MESSAGE', { ticketId: ticket.id, message: ticket.conversations[0], ticket });
  res.json({ success: true, message: `Inbound query from ${platform} auto-routed as Ticket ${ticket.id}`, ticket });
});

// WebSocket Server
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'CONNECTED', message: 'QueryX Real-time Engine Connected' }));
});

server.listen(PORT, () => {
  console.log(`QueryX Support Desk running at http://localhost:${PORT}`);
});
