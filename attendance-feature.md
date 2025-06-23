# Email-Based Attendance Feature Analysis

## Overview
This document explores two approaches for implementing email-based attendance confirmation that allow admins to send **one email to all players** instead of individual personalized emails.

## Approach 1: Single Email + Name Selection

### User Experience
1. **Admin sends one email** to all players (CC/BCC)
2. **Players click a shared link** in the email
3. **Players select their name** from a dropdown
4. **Players indicate attendance** (Yes/No)
5. **System records response** automatically

### Sample Email
```
Subject: Attendance Confirmation - Friday Night Skate

Hi Team,

Please confirm your attendance for Friday Night Skate on December 15th at 7:00 PM.

📍 Location: Community Arena
🕖 Time: 7:00 PM - 9:00 PM

👉 Click here to confirm: https://rostergen.com/rsvp/event-123

Thanks!
Coach
```

### RSVP Page Experience
```
┌─────────────────────────────────────┐
│ Friday Night Skate - Dec 15th      │
│                                     │
│ Select your name:                   │
│ [▼ Choose your name...        ]     │
│   - John Smith                      │
│   - Jane Doe                        │
│   - Mike Johnson                    │
│   - Sarah Wilson                    │
│                                     │
│ Will you attend?                    │
│ ( ) Yes, I'll be there             │
│ ( ) No, I can't make it            │
│                                     │
│ [    Submit Response    ]           │
└─────────────────────────────────────┘
```

### Technical Implementation

#### Database Changes
```sql
-- Add event tokens table for security
CREATE TABLE event_rsvp_tokens (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast token lookups
CREATE INDEX idx_event_rsvp_tokens_token ON event_rsvp_tokens(token);
CREATE INDEX idx_event_rsvp_tokens_expires ON event_rsvp_tokens(expires_at);
```

#### API Endpoints

**Generate RSVP Link**
```typescript
// POST /api/events/[eventId]/rsvp-link
export async function POST(request: NextRequest) {
    const { eventId } = context.params;
    
    // Generate secure token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    // Store token
    await sql`
        INSERT INTO event_rsvp_tokens (event_id, token, expires_at)
        VALUES (${eventId}, ${token}, ${expiresAt})
    `;
    
    return NextResponse.json({
        rsvpUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/rsvp/${token}`
    });
}
```

**RSVP Page Data**
```typescript
// GET /api/rsvp/[token]
export async function GET(request: NextRequest) {
    const { token } = context.params;
    
    // Verify token and get event
    const { rows } = await sql`
        SELECT e.*, t.expires_at
        FROM events e
        JOIN event_rsvp_tokens t ON e.id = t.event_id
        WHERE t.token = ${token} AND t.expires_at > NOW()
    `;
    
    if (rows.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }
    
    const event = rows[0];
    
    // Get players for this event's group
    const players = await getPlayersByGroup(event.group_id);
    
    return NextResponse.json({
        event,
        players: players.map(p => ({ id: p.id, name: `${p.first_name} ${p.last_name}` }))
    });
}
```

**Submit RSVP**
```typescript
// POST /api/rsvp/[token]
export async function POST(request: NextRequest) {
    const { token } = context.params;
    const { playerId, isAttending } = await request.json();
    
    // Verify token and get event
    const { rows } = await sql`
        SELECT event_id FROM event_rsvp_tokens
        WHERE token = ${token} AND expires_at > NOW()
    `;
    
    if (rows.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
    }
    
    const eventId = rows[0].event_id;
    
    // Update attendance
    await updateSingleAttendance(playerId, eventId, isAttending);
    
    return NextResponse.json({ success: true });
}
```

#### Frontend Components

**Admin: Generate Email Template**
```typescript
// In EventsView.tsx
const handleGenerateEmailTemplate = async () => {
    if (!selectedEvent) return;
    
    const response = await fetch(`/api/events/${selectedEvent.id}/rsvp-link`, {
        method: 'POST'
    });
    
    const { rsvpUrl } = await response.json();
    
    const emailTemplate = `Subject: Attendance Confirmation - ${selectedEvent.name}

Hi Team,

Please confirm your attendance for ${selectedEvent.name} on ${formatDate(selectedEvent.event_date)}${selectedEvent.event_time ? ` at ${selectedEvent.event_time}` : ''}.

${selectedEvent.location ? `📍 Location: ${selectedEvent.location}` : ''}

👉 Click here to confirm: ${rsvpUrl}

Thanks!`;

    await navigator.clipboard.writeText(emailTemplate);
    alert('Email template copied to clipboard!');
};
```

**RSVP Page Component**
```typescript
// /src/app/rsvp/[token]/page.tsx
export default function RSVPPage({ params }: { params: { token: string } }) {
    const [event, setEvent] = useState(null);
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [isAttending, setIsAttending] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    
    useEffect(() => {
        fetchEventData();
    }, []);
    
    const fetchEventData = async () => {
        const response = await fetch(`/api/rsvp/${params.token}`);
        if (response.ok) {
            const data = await response.json();
            setEvent(data.event);
            setPlayers(data.players);
        }
    };
    
    const handleSubmit = async () => {
        const response = await fetch(`/api/rsvp/${params.token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerId: parseInt(selectedPlayer),
                isAttending
            })
        });
        
        if (response.ok) {
            setSubmitted(true);
        }
    };
    
    if (submitted) {
        return <div>Thank you! Your response has been recorded.</div>;
    }
    
    return (
        <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
            <h1>{event?.name}</h1>
            <p>{formatDate(event?.event_date)} {event?.event_time}</p>
            
            <select 
                value={selectedPlayer} 
                onChange={(e) => setSelectedPlayer(e.target.value)}
            >
                <option value="">Choose your name...</option>
                {players.map(player => (
                    <option key={player.id} value={player.id}>
                        {player.name}
                    </option>
                ))}
            </select>
            
            <div>
                <label>
                    <input 
                        type="radio" 
                        checked={isAttending === true}
                        onChange={() => setIsAttending(true)}
                    />
                    Yes, I'll be there
                </label>
                <label>
                    <input 
                        type="radio" 
                        checked={isAttending === false}
                        onChange={() => setIsAttending(false)}
                    />
                    No, I can't make it
                </label>
            </div>
            
            <button 
                onClick={handleSubmit}
                disabled={!selectedPlayer || isAttending === null}
            >
                Submit Response
            </button>
        </div>
    );
}
```

---

## Approach 2: Single Email + Event Code

### User Experience
1. **Admin sends one email** with an event code
2. **Players visit the main RSVP page**
3. **Players enter the event code**
4. **Players select their name** from filtered list
5. **Players indicate attendance**

### Sample Email
```
Subject: Attendance Confirmation - Friday Night Skate

Hi Team,

Please confirm your attendance for Friday Night Skate on December 15th at 7:00 PM.

🔑 Event Code: SKATE123
🌐 Go to: rostergen.com/rsvp

Enter the code above and select your name to confirm attendance.

Thanks!
Coach
```

### RSVP Page Experience
```
┌─────────────────────────────────────┐
│ Event Attendance Confirmation       │
│                                     │
│ Enter Event Code:                   │
│ [SKATE123________________]  [Go]    │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Friday Night Skate - Dec 15th      │
│                                     │
│ Select your name:                   │
│ [▼ Choose your name...        ]     │
│                                     │
│ Will you attend?                    │
│ ( ) Yes, I'll be there             │
│ ( ) No, I can't make it            │
│                                     │
│ [    Submit Response    ]           │
└─────────────────────────────────────┘
```

### Technical Implementation

#### Database Changes
```sql
-- Add event codes table
CREATE TABLE event_codes (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    code VARCHAR(20) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_codes_code ON event_codes(code);
CREATE INDEX idx_event_codes_expires ON event_codes(expires_at);
```

#### API Endpoints

**Generate Event Code**
```typescript
// POST /api/events/[eventId]/code
export async function POST(request: NextRequest) {
    const { eventId } = context.params;
    
    // Generate readable code
    const code = generateEventCode(); // e.g., "SKATE123", "GAME456"
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await sql`
        INSERT INTO event_codes (event_id, code, expires_at)
        VALUES (${eventId}, ${code}, ${expiresAt})
        ON CONFLICT (event_id) DO UPDATE SET 
            code = ${code}, 
            expires_at = ${expiresAt}
    `;
    
    return NextResponse.json({ code });
}

function generateEventCode(): string {
    const adjectives = ['FRIDAY', 'NIGHT', 'GAME', 'SKATE', 'MATCH'];
    const numbers = Math.floor(Math.random() * 999) + 1;
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    return `${adj}${numbers}`;
}
```

**Lookup Event by Code**
```typescript
// GET /api/rsvp/code/[code]
export async function GET(request: NextRequest) {
    const { code } = context.params;
    
    const { rows } = await sql`
        SELECT e.*, ec.expires_at
        FROM events e
        JOIN event_codes ec ON e.id = ec.event_id
        WHERE ec.code = ${code.toUpperCase()} AND ec.expires_at > NOW()
    `;
    
    if (rows.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 });
    }
    
    const event = rows[0];
    const players = await getPlayersByGroup(event.group_id);
    
    return NextResponse.json({
        event,
        players: players.map(p => ({ id: p.id, name: `${p.first_name} ${p.last_name}` }))
    });
}
```

**Submit RSVP by Code**
```typescript
// POST /api/rsvp/code/[code]
export async function POST(request: NextRequest) {
    const { code } = context.params;
    const { playerId, isAttending } = await request.json();
    
    // Get event from code
    const { rows } = await sql`
        SELECT ec.event_id
        FROM event_codes ec
        WHERE ec.code = ${code.toUpperCase()} AND ec.expires_at > NOW()
    `;
    
    if (rows.length === 0) {
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 });
    }
    
    await updateSingleAttendance(playerId, rows[0].event_id, isAttending);
    return NextResponse.json({ success: true });
}
```

#### Frontend Components

**Admin: Generate Event Code**
```typescript
const handleGenerateEventCode = async () => {
    if (!selectedEvent) return;
    
    const response = await fetch(`/api/events/${selectedEvent.id}/code`, {
        method: 'POST'
    });
    
    const { code } = await response.json();
    
    const emailTemplate = `Subject: Attendance Confirmation - ${selectedEvent.name}

Hi Team,

Please confirm your attendance for ${selectedEvent.name} on ${formatDate(selectedEvent.event_date)}.

🔑 Event Code: ${code}
🌐 Go to: ${window.location.origin}/rsvp

Enter the code above and select your name to confirm attendance.

Thanks!`;

    await navigator.clipboard.writeText(emailTemplate);
    alert(`Email template with code ${code} copied to clipboard!`);
};
```

**Universal RSVP Page**
```typescript
// /src/app/rsvp/page.tsx
export default function RSVPPage() {
    const [eventCode, setEventCode] = useState('');
    const [event, setEvent] = useState(null);
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [isAttending, setIsAttending] = useState(null);
    
    const handleCodeSubmit = async () => {
        const response = await fetch(`/api/rsvp/code/${eventCode}`);
        if (response.ok) {
            const data = await response.json();
            setEvent(data.event);
            setPlayers(data.players);
        } else {
            alert('Invalid event code');
        }
    };
    
    const handleAttendanceSubmit = async () => {
        const response = await fetch(`/api/rsvp/code/${eventCode}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerId: parseInt(selectedPlayer),
                isAttending
            })
        });
        
        if (response.ok) {
            alert('Response recorded!');
            setEvent(null);
            setEventCode('');
        }
    };
    
    return (
        <div className="max-w-md mx-auto mt-8 p-6">
            {!event ? (
                <div>
                    <h1>Event Attendance</h1>
                    <input
                        placeholder="Enter event code"
                        value={eventCode}
                        onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                    />
                    <button onClick={handleCodeSubmit}>Go</button>
                </div>
            ) : (
                <div>
                    <h1>{event.name}</h1>
                    <p>{formatDate(event.event_date)}</p>
                    
                    <select onChange={(e) => setSelectedPlayer(e.target.value)}>
                        <option>Choose your name...</option>
                        {players.map(player => (
                            <option key={player.id} value={player.id}>
                                {player.name}
                            </option>
                        ))}
                    </select>
                    
                    <div>
                        <label>
                            <input 
                                type="radio" 
                                onChange={() => setIsAttending(true)}
                            />
                            Yes, I'll be there
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                onChange={() => setIsAttending(false)}
                            />
                            No, I can't make it
                        </label>
                    </div>
                    
                    <button onClick={handleAttendanceSubmit}>
                        Submit Response
                    </button>
                </div>
            )}
        </div>
    );
}
```

---

## Comparison Matrix

| Factor | Direct Link | Event Code |
|--------|-------------|------------|
| **User Steps** | 2 (click link, select name) | 3 (enter code, select name, submit) |
| **URL Sharing** | Each event has unique URL | Universal URL + code |
| **Code Memorability** | N/A | Easy to remember/share verbally |
| **Security** | Cryptographic token | Human-readable code |
| **Link Expiration** | Built-in | Built-in |
| **Implementation** | Medium | Medium |
| **User Experience** | Slightly better | Good |
| **Admin Flexibility** | Generate new links anytime | Generate new codes anytime |

## Recommendation

**For your use case, I recommend the Direct Link approach** because:

1. **Fewer user steps** (click → select → done)
2. **More professional** appearance in emails
3. **Better mobile experience** (no typing required)
4. **Familiar pattern** (like meeting links, calendar invites)
5. **Same admin effort** for both approaches

The event code approach is better if you need to:
- Share attendance verbally ("Use code GAME123")
- Have a permanent RSVP page for multiple events
- Want users to bookmark one URL

## Implementation Priority

1. **Phase 1**: Implement direct link approach
2. **Phase 2**: Add "Load All Emails" button 
3. **Phase 3**: Add email validation and error handling
4. **Optional**: Add event code approach as alternative

Both approaches solve your core problem: **one email composition, sent to everyone, with automatic attendance tracking**.

# Automated Email Service Integration with Resend

## Email Service Costs for 3000 Emails/Month

| Service | Free Tier | Paid Tier | Monthly Cost | Vercel Integration |
|---------|-----------|-----------|--------------|-------------------|
| **Resend** ⭐ | 3000 emails/month | Pro: 50k emails | **FREE** or $20 | **⭐⭐⭐⭐⭐ Native** |
| **SendGrid** | 100 emails/day (~3000/month) | Essentials: 50k emails | **FREE** or $14.95 | ⭐⭐⭐ Standard API |
| **Mailgun** | 5000 emails/month | Pay-as-go: $0.80/1k | **FREE** or $2.40 | ⭐⭐⭐ Standard API |
| **AWS SES** | 200/day if on EC2 | $0.10 per 1000 | **FREE** or $3 | ⭐⭐ Manual setup |

## **Winner: Resend (Perfect for Vercel + Next.js)**

**Resend is specifically built for modern web apps** and has the best Vercel integration.

## Resend Implementation

### **1. Setup (5 minutes)**

#### Install Resend
```bash
npm install resend
```

#### Environment Variables
```env
# .env.local
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

#### Verify Domain (Optional but Recommended)
```typescript
// Can send from your own domain
FROM_EMAIL=attendance@yourdomain.com
// Or use default
FROM_EMAIL=onboarding@resend.dev
```

### **2. Email Service Implementation**

#### Create Email Service
```typescript
// src/lib/resend.ts
import { Resend } from 'resend';
import { type EventDB } from '@/types/PlayerTypes';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendAttendanceEmail(
    playerEmail: string,
    playerName: string,
    event: EventDB,
    rsvpUrl: string
) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'RosterGen <noreply@yourdomain.com>',
            to: [playerEmail],
            subject: `Attendance Confirmation - ${event.name}`,
            html: generateEmailTemplate(playerName, event, rsvpUrl),
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('Email send failed:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

function generateEmailTemplate(playerName: string, event: EventDB, rsvpUrl: string): string {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Attendance Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2563eb; margin: 0;">🏒 RosterGen</h1>
            </div>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; color: #1e293b;">Hi ${playerName}!</h2>
                <p style="margin: 0; font-size: 16px;">Please confirm your attendance for <strong>${event.name}</strong></p>
            </div>
            
            <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin: 0 0 20px 0; color: #374151; font-size: 18px;">Event Details</h3>
                
                <div style="margin-bottom: 15px;">
                    <span style="display: inline-block; width: 20px;">📅</span>
                    <strong>Date:</strong> ${formatDate(event.event_date)}
                </div>
                
                ${event.event_time ? `
                <div style="margin-bottom: 15px;">
                    <span style="display: inline-block; width: 20px;">🕐</span>
                    <strong>Time:</strong> ${event.event_time}
                </div>
                ` : ''}
                
                ${event.location ? `
                <div style="margin-bottom: 15px;">
                    <span style="display: inline-block; width: 20px;">📍</span>
                    <strong>Location:</strong> ${event.location}
                </div>
                ` : ''}
                
                ${event.description ? `
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="margin: 0; font-style: italic; color: #6b7280;">${event.description}</p>
                </div>
                ` : ''}
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="${rsvpUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); transition: transform 0.2s;">
                    ✅ Confirm Your Attendance
                </a>
            </div>
            
            <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; color: #64748b; text-align: center;">
                    💡 <strong>How it works:</strong> Click the button above to go to a quick form where you can select your name and confirm if you'll be attending.
                </p>
            </div>
            
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                    This link will expire in 30 days. Having trouble? Contact your team admin.
                </p>
            </div>
            
        </body>
        </html>
    `;
}

export { resend };
```

### **3. Bulk Email API Endpoint**

```typescript
// src/app/api/events/[eventId]/send-invites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendAttendanceEmail } from '@/lib/resend';
import { getEventById, getPlayersByGroup } from '@/lib/db';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export async function POST(request: NextRequest, context: { params: { eventId: string } }) {
    try {
        const { eventId } = context.params;
        
        // Get event details
        const event = await getEventById(parseInt(eventId));
        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }
        
        // Generate or reuse RSVP token
        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        
        await sql`
            INSERT INTO event_rsvp_tokens (event_id, token, expires_at)
            VALUES (${eventId}, ${token}, ${expiresAt})
            ON CONFLICT (event_id) DO UPDATE SET 
                token = ${token}, 
                expires_at = ${expiresAt}
        `;
        
        const rsvpUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/rsvp/${token}`;
        
        // Get players with email addresses
        const allPlayers = await getPlayersByGroup(event.group_id);
        const playersWithEmail = allPlayers.filter(p => p.email && p.email.trim() !== '');
        
        console.log(`Sending emails to ${playersWithEmail.length} players out of ${allPlayers.length} total players`);
        
        // Send emails with rate limiting
        const results = [];
        for (const player of playersWithEmail) {
            try {
                const result = await sendAttendanceEmail(
                    player.email!,
                    `${player.first_name} ${player.last_name}`,
                    event,
                    rsvpUrl
                );
                
                results.push({ 
                    playerId: player.id, 
                    playerName: `${player.first_name} ${player.last_name}`,
                    email: player.email,
                    ...result 
                });
                
                // Rate limiting: wait 100ms between emails to avoid overwhelming Resend
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`Failed to send email to ${player.email}:`, error);
                results.push({ 
                    playerId: player.id, 
                    playerName: `${player.first_name} ${player.last_name}`,
                    email: player.email,
                    success: false, 
                    error: error instanceof Error ? error.message : 'Unknown error' 
                });
            }
        }
        
        const summary = {
            totalPlayers: allPlayers.length,
            emailsSent: results.filter(r => r.success).length,
            emailsFailed: results.filter(r => !r.success).length,
            playersWithoutEmail: allPlayers.length - playersWithEmail.length,
            rsvpUrl,
            results
        };
        
        console.log('Email sending summary:', summary);
        
        return NextResponse.json(summary);
        
    } catch (error) {
        console.error('Error in send-invites API:', error);
        return NextResponse.json(
            { error: 'Failed to send email invites' },
            { status: 500 }
        );
    }
}
```

### **4. Frontend Integration**

```typescript
// In EventsView.tsx - Add to the existing admin controls
const [isSendingEmails, setIsSendingEmails] = useState(false);

const handleSendEmailInvites = async () => {
    if (!selectedEvent) return;
    
    const confirmed = window.confirm(
        `Send email invites for "${selectedEvent.name}" to all players with email addresses?`
    );
    
    if (!confirmed) return;
    
    setIsSendingEmails(true);
    try {
        const response = await fetch(`/api/events/${selectedEvent.id}/send-invites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }
        
        const results = await response.json();
        
        // Show detailed results
        const message = `
📧 Email Invites Sent!

✅ Successfully sent: ${results.emailsSent}
❌ Failed to send: ${results.emailsFailed}
⚠️ Players without email: ${results.playersWithoutEmail}
📋 Total players: ${results.totalPlayers}

${results.emailsFailed > 0 ? '\nCheck console for failed email details.' : ''}
        `.trim();
        
        alert(message);
        
        // Log failed emails for debugging
        if (results.emailsFailed > 0) {
            console.log('Failed emails:', results.results.filter(r => !r.success));
        }
        
    } catch (error) {
        console.error('Failed to send email invites:', error);
        alert(`Failed to send email invites: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
        setIsSendingEmails(false);
    }
};

// Add to the admin controls section where the "Generate Teams" button is
<div className="flex items-center gap-2">
    <Button variant="outline" onClick={handleEnterBulkEditMode}>
        Bulk Edit
    </Button>
    <Button 
        onClick={handleSendEmailInvites}
        disabled={isSendingEmails || !selectedEvent}
        className="btn-primary"
    >
        {isSendingEmails ? (
            <>
                <span className="animate-spin mr-2">⏳</span>
                Sending...
            </>
        ) : (
            <>
                📧 Send Email Invites
            </>
        )}
    </Button>
    <Button
        onClick={handleGenerateTeams}
        disabled={isGeneratingTeams}
        className="btn-primary"
    >
        <ArrowRightLeft className={`w-4 h-4 mr-2 ${isGeneratingTeams ? 'animate-spin' : ''}`} />
        {isGeneratingTeams ? 'Generating...' : 'Generate Teams'}
    </Button>
</div>
```

### **5. Environment Variables Setup**

```env
# .env.local (for development)
RESEND_API_KEY=re_your_api_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# .env.production (or set in Vercel dashboard)
RESEND_API_KEY=re_your_production_api_key
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### **6. Resend Dashboard Setup**

1. **Sign up at resend.com**
2. **Get your API key** from the dashboard
3. **Optional: Add your domain** for branded emails (attendance@yourdomain.com)
4. **Add API key to Vercel** environment variables

## **Implementation Timeline**

| Task | Time | Notes |
|------|------|-------|
| **Resend setup** | 30 min | Create account, get API key |
| **Email service code** | 1.5 hours | Write sendAttendanceEmail function |
| **Bulk email API** | 2 hours | Create send-invites endpoint |
| **Frontend integration** | 1 hour | Add button to EventsView |
| **Testing** | 1 hour | Test with real emails |
| **Email template polish** | 1 hour | Make it look professional |
| **Total** | **~7 hours** |

## **Cost Analysis**

**Resend Free Tier:**
- ✅ **3,000 emails/month** (perfect for your 3000 emails)
- ✅ **Professional templates**
- ✅ **Delivery analytics**
- ✅ **Perfect Vercel integration**

**Your Usage:**
- 10 events/month × 200 players = 2,000 emails
- **$0/month cost** (well within free tier)

## **Benefits of Automated Approach**

### **Time Savings**
- **Manual**: 8-10 minutes per event (write email, copy addresses, send)
- **Automated**: 30 seconds per event (just click button)
- **Savings**: 7.5 minutes × 10 events = 75 minutes/month

### **Better User Experience**
- ✅ Professional HTML emails
- ✅ Beautiful, responsive design
- ✅ Consistent branding
- ✅ Clear call-to-action buttons

### **Admin Benefits**
- ✅ One-click sending
- ✅ Delivery tracking
- ✅ Error reporting
- ✅ No copy/paste errors
- ✅ Automatic RSVP link generation

### **Player Benefits**
- ✅ Beautiful, easy-to-read emails
- ✅ Mobile-friendly design
- ✅ One-click RSVP process
- ✅ Clear event information

## **Final Recommendation**

**Definitely implement the automated Resend approach** because:

1. **Perfect Vercel integration** (5-minute setup)
2. **Zero ongoing cost** (free tier covers your needs)
3. **Massive time savings** (7.5 minutes per event)
4. **Professional appearance** (better than manual emails)
5. **Higher response rates** (easier RSVP process)
6. **Implementation pays for itself** in 2 months of time savings

**ROI**: 7 hours implementation saves 15+ hours per year = **115% ROI in first year!**
