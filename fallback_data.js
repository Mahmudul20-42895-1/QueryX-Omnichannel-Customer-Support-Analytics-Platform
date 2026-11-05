    // Pre-loaded offline fallback data for GitHub Pages
    const FALLBACK_USERS = [
      { id: "usr_admin", name: "Admin Director", email: "admin@queryx.io", password: "admin", role: "Admin", avatar: "AD", department: "Executive Operations & Billing", activeStatus: "Active", joinedDate: "2025-01-10" },
      { id: "usr_agent1", name: "Jason Duong", email: "agent@queryx.io", password: "agent", role: "Agent", avatar: "JD", department: "Technical Escalations", activeStatus: "Active", joinedDate: "2025-04-12" },
      { id: "usr_agent2", name: "Nhi Pham", email: "nhi@queryx.io", password: "agent", role: "Agent", avatar: "NP", department: "Customer Success & Resolution", activeStatus: "Active", joinedDate: "2025-06-20" }
    ];

    const FALLBACK_TICKETS = [
      {
        id: "QX-1001",
        subject: "SSO SAML configuration failing on IdP callback",
        description: "Our enterprise Okta integration returns HTTP 500 when users redirect back from login portal.",
        category: "Technical",
        priority: "High",
        status: "Resolved",
        channel: "Email",
        platform: "Email",
        customer: { name: "Sarah Jenkins", email: "sarah.j@acme.corp" },
        assignee: { name: "Jason Duong", email: "agent@queryx.io", avatar: "JD" },
        health: "On Track",
        resolutionTimeHours: 1.8,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        conversations: [
          { id: "m_1", author: "Sarah Jenkins", senderRole: "Customer", time: "5 hours ago", text: "Hi support team, Okta SAML callback throws 500 internal server error. Please check.", isInternal: false, platform: "Email" },
          { id: "m_2", author: "Jason Duong", senderRole: "Agent", time: "3 hours ago", text: "Checked Auth0 certificate fingerprint. Re-synced SAML assertion audience URL. Fixed.", isInternal: false, platform: "Email" }
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
        customer: { name: "David Kim", email: "david@fastops.kr" },
        assignee: { name: "Jason Duong", email: "agent@queryx.io", avatar: "JD" },
        health: "Breached",
        resolutionTimeHours: null,
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        conversations: [
          { id: "m_3", author: "David Kim", senderRole: "Customer", time: "8 hours ago", text: "Hey! Telegram bot replied, but payment charged twice. Transaction ref TXN-49191.", isInternal: false, platform: "Telegram" },
          { id: "m_3b", author: "Jason Duong", senderRole: "Agent", time: "4 hours ago", text: "Connecting with Stripe billing settlement team to void second charge and unlock seats.", isInternal: false, platform: "Telegram" }
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
        customer: { name: "Elena Rostova", email: "elena@client.eu" },
        assignee: { name: "Nhi Pham", email: "nhi@queryx.io", avatar: "NP" },
        health: "On Track",
        resolutionTimeHours: null,
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
        conversations: [
          { id: "m_4", author: "Elena Rostova", senderRole: "Customer", time: "Yesterday", text: "Hello! We run 10M requests daily. Can your endpoints handle our webhook throughput?", isInternal: false, platform: "Messenger" },
          { id: "m_5", author: "Nhi Pham", senderRole: "Agent", time: "6 hours ago", text: "Hi Elena! Yes, our Tier-3 Dedicated plan offers 25k req/min with automatic bursting.", isInternal: false, platform: "Messenger" }
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
        customer: { name: "Alex Rivera", email: "alex@creatorhub.co" },
        assignee: { name: "Nhi Pham", email: "nhi@queryx.io", avatar: "NP" },
        health: "On Track",
        resolutionTimeHours: 2.1,
        createdAt: new Date(Date.now() - 3600000 * 32).toISOString(),
        conversations: [
          { id: "m_6", author: "Alex Rivera", senderRole: "Customer", time: "2 days ago", text: "Sent DM on Instagram regarding sponsorship agreement for QueryX launch.", isInternal: false, platform: "Instagram" },
          { id: "m_7", author: "Nhi Pham", senderRole: "Agent", time: "1 day ago", text: "Provided enterprise marketing partner agreement pack. Ticket closed.", isInternal: false, platform: "Instagram" }
        ]
      }
    ];

    const FALLBACK_BILLING = {
      subscription: {
        planName: "Enterprise Tier UK",
        status: "Active",
        monthlyPrice: 1250,
        currency: "GBP (£)",
        billingCycle: "Annual (Billed Monthly)",
        renewsOn: "2027-01-15",
        seatsActive: 3,
        seatsTotal: 25,
        connectedChannels: 4,
        slaTargetCompliance: "99.4%"
      },
      invoices: [
        { invoiceId: "INV-2026-0091", date: "2026-11-01", dueDate: "2026-11-15", amount: "£1,250.00", status: "Paid", paymentMethod: "Corporate Wire Transfer •••• 9821" },
        { invoiceId: "INV-2026-0082", date: "2026-10-01", dueDate: "2026-10-15", amount: "£1,250.00", status: "Paid", paymentMethod: "Corporate Wire Transfer •••• 9821" },
        { invoiceId: "INV-2026-0071", date: "2026-09-01", dueDate: "2026-09-15", amount: "£1,480.00", status: "Paid", paymentMethod: "Mastercard •••• 4129" },
        { invoiceId: "INV-2026-0063", date: "2026-08-01", dueDate: "2026-08-15", amount: "£1,250.00", status: "Paid", paymentMethod: "Mastercard •••• 4129" }
      ]
    };
