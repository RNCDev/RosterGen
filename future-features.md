# Future Features for RosterGen

## 🔐 Administrative Features

### Multi-Admin Support
**Priority: Low**

Allow multiple administrators with different permission levels.

**Features:**
- Admin role management
- Permission levels (Super Admin, Group Admin, View Only)
- Admin activity logging
- Admin invitation system

---

## Implementation Priority

### Phase 1 (Next Sprint)
1. Player attendance rate tracking
2. Bulk event creation for recurring schedules

### Phase 2 (Following Sprint)  
1. Player self-service portal foundation
2. Substitute integration system

### Phase 3 (Future)
1. Player preferences system
2. Email notifications (Resend integration)
3. Goalie management features

### Phase 4 (Long-term)
1. SMS notifications
2. Enhanced archiving
3. Multi-admin support

# Future Features: Automated Email Reminder System

## Overview
Transform RosterGen from a manual roster management tool into a fully automated, self-service event management system. The goal is to enable administrators to set up rosters and events once, then let the system handle attendance reminders, player responses, and final roster generation automatically.

## Core Concept: "Set It and Forget It" Hockey Management

### Current Workflow (Manual):
1. Admin creates roster and events
2. Admin manually tracks attendance
3. Admin generates teams
4. Admin communicates with players

### Target Workflow (Automated):
1. Admin creates roster and events **once**
2. System sends automated email reminders at configured intervals
3. Players respond to emails directly (self-service attendance)
4. System locks roster at final deadline
5. Admin generates and saves final teams **once**
6. Public roster link available for all participants

## Database Schema Changes Required

### SQL Migration Scripts

#### 1. Create New Tables

```sql
-- Create email_reminders table
CREATE TABLE email_reminders (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN ('reminder_1', 'reminder_2', 'reminder_3')),
    hours_before_event INTEGER NOT NULL,
    email_sent_at TIMESTAMP,
    email_status VARCHAR(20) DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for email_reminders
CREATE INDEX idx_email_reminders_event_id ON email_reminders(event_id);
CREATE INDEX idx_email_reminders_status ON email_reminders(email_status);
CREATE INDEX idx_email_reminders_send_time ON email_reminders(email_sent_at);

-- Create attendance_responses table
CREATE TABLE attendance_responses (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    response_token VARCHAR(255) UNIQUE NOT NULL,
    is_attending BOOLEAN,
    responded_at TIMESTAMP,
    reminder_type VARCHAR(20) CHECK (reminder_type IN ('reminder_1', 'reminder_2', 'reminder_3')),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for attendance_responses
CREATE INDEX idx_attendance_responses_player_id ON attendance_responses(player_id);
CREATE INDEX idx_attendance_responses_event_id ON attendance_responses(event_id);
CREATE INDEX idx_attendance_responses_token ON attendance_responses(response_token);
CREATE UNIQUE INDEX idx_attendance_responses_unique ON attendance_responses(player_id, event_id, reminder_type);
```

#### 2. Modify Existing Tables

```sql
-- Add email configuration columns to groups table
ALTER TABLE groups 
ADD COLUMN reminder_1_hours INTEGER DEFAULT 72,
ADD COLUMN reminder_2_hours INTEGER DEFAULT 24,
ADD COLUMN reminder_3_hours INTEGER DEFAULT 2,
ADD COLUMN email_reminders_enabled BOOLEAN DEFAULT false,
ADD COLUMN roster_lock_hours INTEGER DEFAULT 1;

-- Add email tracking columns to events table
ALTER TABLE events 
ADD COLUMN roster_locked_at TIMESTAMP,
ADD COLUMN public_roster_token VARCHAR(255) UNIQUE,
ADD COLUMN final_roster_generated BOOLEAN DEFAULT false;

-- Create index for public roster tokens
CREATE INDEX idx_events_public_token ON events(public_roster_token);

-- Add email support columns to players table (if they don't exist)
-- Check if email column exists first, then add email_notifications
DO $$
BEGIN
    -- Add email column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'email') THEN
        ALTER TABLE players ADD COLUMN email VARCHAR(255);
    END IF;
    
    -- Add email_notifications column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'email_notifications') THEN
        ALTER TABLE players ADD COLUMN email_notifications BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Update email column to be NOT NULL (only if data allows)
-- Note: Run this only after ensuring all players have email addresses
-- ALTER TABLE players ALTER COLUMN email SET NOT NULL;
```

#### 3. Create Helper Functions

```sql
-- Function to generate secure tokens
CREATE OR REPLACE FUNCTION generate_secure_token() 
RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to get events needing reminders
CREATE OR REPLACE FUNCTION get_events_needing_reminders() 
RETURNS TABLE (
    event_id INTEGER,
    group_id INTEGER,
    event_datetime TIMESTAMP,
    reminder_type VARCHAR(20),
    hours_before INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH reminder_schedule AS (
        SELECT 
            e.id as event_id,
            e.group_id,
            e.event_datetime,
            'reminder_1' as reminder_type,
            g.reminder_1_hours as hours_before
        FROM events e
        JOIN groups g ON e.group_id = g.id
        WHERE g.email_reminders_enabled = true
        
        UNION ALL
        
        SELECT 
            e.id as event_id,
            e.group_id,
            e.event_datetime,
            'reminder_2' as reminder_type,
            g.reminder_2_hours as hours_before
        FROM events e
        JOIN groups g ON e.group_id = g.id
        WHERE g.email_reminders_enabled = true
        
        UNION ALL
        
        SELECT 
            e.id as event_id,
            e.group_id,
            e.event_datetime,
            'reminder_3' as reminder_type,
            g.reminder_3_hours as hours_before
        FROM events e
        JOIN groups g ON e.group_id = g.id
        WHERE g.email_reminders_enabled = true
    )
    SELECT 
        rs.event_id,
        rs.group_id,
        rs.event_datetime,
        rs.reminder_type,
        rs.hours_before
    FROM reminder_schedule rs
    LEFT JOIN email_reminders er ON (
        rs.event_id = er.event_id 
        AND rs.reminder_type = er.reminder_type
    )
    WHERE 
        er.id IS NULL  -- No reminder sent yet
        AND rs.event_datetime > NOW()  -- Future events only
        AND rs.event_datetime <= NOW() + INTERVAL '1 hour' * rs.hours_before  -- Within reminder window
    ORDER BY rs.event_datetime, rs.reminder_type;
END;
$$ LANGUAGE plpgsql;
```

#### 4. Data Migration (Optional)

```sql
-- Generate public roster tokens for existing events (if desired)
UPDATE events 
SET public_roster_token = generate_secure_token() 
WHERE public_roster_token IS NULL;

-- Set default email preferences for existing players
UPDATE players 
SET email_notifications = true 
WHERE email_notifications IS NULL;
```

### New Tables Schema

#### `email_reminders` Table
Tracks reminder configuration and delivery status for each event.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | integer | Primary Key | Unique identifier for the reminder record |
| `event_id` | integer | Foreign Key (`events.id`) | Links to the event |
| `reminder_type` | varchar(20) | Not Null | Type: 'reminder_1', 'reminder_2', 'reminder_3' |
| `hours_before_event` | integer | Not Null | Hours before event start to send (e.g., 72, 24, 2) |
| `email_sent_at` | timestamp | | When the email was actually sent |
| `email_status` | varchar(20) | Default: 'pending' | Status: 'pending', 'sent', 'failed' |
| `created_at` | timestamp | Default: CURRENT_TIMESTAMP | Record creation time |

#### `attendance_responses` Table
Tracks player responses to email reminders (separate from manual attendance updates).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | integer | Primary Key | Unique identifier |
| `player_id` | integer | Foreign Key (`players.id`) | Player who responded |
| `event_id` | integer | Foreign Key (`events.id`) | Event being responded to |
| `response_token` | varchar(255) | Unique, Not Null | Secure token for email links |
| `is_attending` | boolean | | Player's attendance response |
| `responded_at` | timestamp | | When player clicked email link |
| `reminder_type` | varchar(20) | | Which reminder they responded to |
| `ip_address` | varchar(45) | | Security tracking |

### Modified Tables

#### `groups` Table (Add Email Configuration)
| New Column | Type | Constraints | Description |
|---|---|---|---|
| `reminder_1_hours` | integer | Default: 72 | Hours before event for first reminder |
| `reminder_2_hours` | integer | Default: 24 | Hours before event for second reminder |
| `reminder_3_hours` | integer | Default: 2 | Hours before event for final reminder |
| `email_reminders_enabled` | boolean | Default: false | Whether email reminders are active |
| `roster_lock_hours` | integer | Default: 1 | Hours after final reminder to lock roster |

#### `events` Table (Add Email Tracking)
| New Column | Type | Constraints | Description |
|---|---|---|---|
| `roster_locked_at` | timestamp | | When roster was automatically locked |
| `public_roster_token` | varchar(255) | Unique | Secure token for public roster viewing |
| `final_roster_generated` | boolean | Default: false | Whether admin has generated final teams |

#### `players` Table (Ensure Email Support)
| Verify Column | Type | Constraints | Description |
|---|---|---|---|
| `email` | varchar(255) | Not Null | Player's email (required for reminders) |
| `email_notifications` | boolean | Default: true | Player preference for receiving emails |

## Implementation Plan

### Phase 1: Core Email Infrastructure
**Goal**: Basic automated reminder system

#### 1.1 Database Setup
- [ ] Create new tables (`email_reminders`, `attendance_responses`)
- [ ] Add new columns to existing tables
- [ ] Create database migration scripts
- [ ] Update TypeScript interfaces

#### 1.2 Email Service Integration
- [ ] Integrate transactional email service (Resend recommended)
- [ ] Create email templates for reminders
- [ ] Build email sending infrastructure
- [ ] Implement secure response token system

#### 1.3 Scheduling System
- [ ] Implement cron job system (Vercel Cron or Upstash QStash)
- [ ] Create reminder calculation logic
- [ ] Build email queue management
- [ ] Add retry logic for failed emails

#### 1.4 Response Handling
- [ ] Create public attendance response pages (`/attendance/[token]`)
- [ ] Build one-click attendance confirmation
- [ ] Update attendance records from email responses
- [ ] Add security measures (rate limiting, token validation)

### Phase 2: Admin Controls & UI
**Goal**: Admin interface for email management

#### 2.1 Group Configuration UI
- [ ] Add email reminder settings to group management
- [ ] Create reminder timing configuration interface
- [ ] Build email template preview system
- [ ] Add enable/disable toggle for reminders

#### 2.2 Event Email Management
- [ ] Show email reminder status in events view
- [ ] Add manual email trigger buttons
- [ ] Display response tracking dashboard
- [ ] Create email delivery logs viewer

#### 2.3 Player Response Tracking
- [ ] Build admin dashboard for attendance responses
- [ ] Show "responded via email" vs "manual update" indicators
- [ ] Add response timing analytics
- [ ] Create non-response follow-up tools

### Phase 3: Advanced Features
**Goal**: Enhanced automation and user experience

#### 3.1 Smart Team Integration
- [ ] Include team previews in reminder emails
- [ ] Show potential lineup in emails (if teams already generated)
- [ ] Add "team balance impact" notifications
- [ ] Create dynamic team updates based on responses

#### 3.2 Public Roster Display
- [ ] Create public roster viewing pages (`/roster/[token]`)
- [ ] Build responsive, shareable team displays
- [ ] Add QR code generation for easy sharing
- [ ] Implement automatic roster locking

#### 3.3 Enhanced Communication
- [ ] Add custom email message fields for admins
- [ ] Create event-specific email templates
- [ ] Build player preference management
- [ ] Add "last chance" reminder variations

### Phase 4: Analytics & Optimization
**Goal**: Data-driven improvements

#### 4.1 Response Analytics
- [ ] Track email open rates and click rates
- [ ] Measure response timing patterns
- [ ] Analyze optimal reminder scheduling
- [ ] Build predictive attendance models

#### 4.2 System Optimization
- [ ] Implement intelligent retry logic
- [ ] Add delivery time optimization
- [ ] Create A/B testing for email templates
- [ ] Build performance monitoring

## Technical Considerations

### Email Service Requirements
- **Recommended**: Resend (excellent Next.js integration, reliable delivery)
- **Alternative**: SendGrid (more features, slightly more complex)
- **Features needed**: Template system, webhook support, analytics

### Scheduling Infrastructure
- **Vercel Cron**: Simple, integrated with deployment
- **Upstash QStash**: More reliable for critical timing, supports retries
- **Backup**: Database-driven polling system

### Security Measures
- Secure token generation for email links
- Rate limiting on response endpoints
- IP address tracking for audit trails
- Token expiration (24-48 hours)

### Performance Considerations
- Email template caching
- Batch email sending for large rosters
- Database indexing on time-based queries
- CDN for public roster pages

## Success Metrics

### Primary Goals
- **Admin Time Savings**: 80% reduction in manual attendance tracking
- **Response Rate**: 90%+ players respond to email reminders
- **Accuracy**: 95%+ attendance prediction accuracy
- **User Satisfaction**: Streamlined workflow for both admins and players

### Technical Metrics
- Email delivery rate: >98%
- Response page load time: <500ms
- System uptime: 99.9%
- Zero missed reminder deliveries

## Future Enhancements (Phase 5+)

### Integration Possibilities
- Calendar system integration (Google Calendar, Outlook)
- Mobile app with push notifications
- Slack/Discord bot integration
- Payment integration for league fees

### Advanced Features
- Machine learning for optimal team suggestions
- Weather-based event reminders
- Multi-language email support
- Custom branding for different leagues

## Migration Strategy

### For Existing Users
1. **Opt-in approach**: Email reminders disabled by default
2. **Gradual rollout**: Enable for willing test groups first
3. **Fallback support**: Manual system remains fully functional
4. **Data preservation**: All existing data remains intact

### Implementation Timeline
- **Phase 1**: 3-4 weeks (core infrastructure)
- **Phase 2**: 2-3 weeks (admin UI)
- **Phase 3**: 2-3 weeks (advanced features)
- **Phase 4**: 2-3 weeks (analytics & optimization)

**Total estimated timeline**: 10-13 weeks for full implementation

This enhancement would transform RosterGen into a truly automated event management system, positioning it as a premium solution for recurring sports events and leagues. 