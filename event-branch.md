# Event-Based Attendance System Implementation Guide

## Overview

This document outlines the implementation of an event-based attendance system to replace the current static `is_attending` player attribute. This enhancement will transform the app from a simple roster manager into a comprehensive hockey league management system.

## Current State vs. Proposed State

### Current Architecture
```
Group -> Players (with static is_attending)
```

### Proposed Architecture
```
Group -> Players (core attributes only)
Group -> Events -> Attendance (player-event relationships)
```

## Database Schema Changes

### New Tables

#### 1. Events Table
```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(255),
    group_code VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_events_group_code (group_code),
    INDEX idx_events_date (event_date),
    INDEX idx_events_active (is_active)
);
```

#### 2. Attendance Table
```sql
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    is_attending BOOLEAN NOT NULL DEFAULT false,
    response_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Foreign keys
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate responses
    UNIQUE(player_id, event_id),
    
    -- Indexes
    INDEX idx_attendance_player (player_id),
    INDEX idx_attendance_event (event_id),
    INDEX idx_attendance_status (is_attending)
);
```

### Modified Tables

#### Updated Players Table
```sql
-- Remove is_attending column (after migration)
ALTER TABLE players DROP COLUMN is_attending;

-- Add any new columns if needed
ALTER TABLE players ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
```

## TypeScript Type Definitions

### New Types

```typescript
// Event types
export interface EventDB {
    id: number;
    name: string;
    description?: string;
    event_date: Date;
    event_time?: string;
    location?: string;
    group_code: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface EventInput {
    name: string;
    description?: string;
    event_date: Date;
    event_time?: string;
    location?: string;
    group_code: string;
    is_active?: boolean;
}

export interface EventForm {
    name: string;
    description: string;
    date: string; // YYYY-MM-DD format
    time: string; // HH:MM format
    location: string;
}

// Attendance types
export interface AttendanceDB {
    id: number;
    player_id: number;
    event_id: number;
    is_attending: boolean;
    response_date: Date;
    notes?: string;
}

export interface AttendanceInput {
    player_id: number;
    event_id: number;
    is_attending: boolean;
    notes?: string;
}

// Combined types for UI
export interface PlayerWithAttendance extends PlayerDB {
    attendance?: AttendanceDB;
    is_attending?: boolean; // Computed field for specific event
}

export interface EventWithStats extends EventDB {
    total_players: number;
    attending_count: number;
    not_attending_count: number;
    no_response_count: number;
    attendance_rate: number;
}

// Team generation types (updated)
export interface EventTeamGeneration {
    event_id: number;
    teams: Teams;
    generated_at: Date;
}
```

### Updated Existing Types

```typescript
// Remove is_attending from PlayerDB
export interface PlayerDB {
    id: number;
    first_name: string;
    last_name: string;
    skill: number;
    is_defense: boolean;
    group_code: string;
    is_active: boolean; // New field
    created_at?: Date;
    updated_at?: Date;
}

// Update team generation to be event-specific
export interface Teams {
    red: Team;
    white: Team;
    event_id?: number; // New field
    generated_at?: Date; // New field
}
```

## API Endpoints

### Events API (`/api/events`)

```typescript
// GET /api/events?group_code=xxx
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const groupCode = searchParams.get('group_code');
    
    // Return events for group, ordered by date
}

// POST /api/events
export async function POST(request: NextRequest) {
    const eventData: EventInput = await request.json();
    
    // Create new event
    // Auto-create attendance records for all players in group
}

// PUT /api/events/[id]
export async function PUT(request: NextRequest) {
    // Update event details
}

// DELETE /api/events/[id]
export async function DELETE(request: NextRequest) {
    // Delete event and all associated attendance records
}
```

### Attendance API (`/api/attendance`)

```typescript
// GET /api/attendance?event_id=xxx
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    
    // Return attendance records with player details
}

// POST /api/attendance/bulk
export async function POST(request: NextRequest) {
    const attendanceUpdates: AttendanceInput[] = await request.json();
    
    // Bulk update attendance for an event
}

// PUT /api/attendance/[id]
export async function PUT(request: NextRequest) {
    // Update individual attendance record
}
```

### Updated Team Generation API

```typescript
// POST /api/teams
export async function POST(request: NextRequest) {
    const { event_id, group_code } = await request.json();
    
    // Generate teams based on event attendance
    const attendingPlayers = await getAttendingPlayersForEvent(event_id);
    const teams = generateTeams(attendingPlayers, group_code);
    
    return NextResponse.json({ 
        teams, 
        event_id,
        generated_at: new Date() 
    });
}
```

## Data Access Layer

### Event Operations

```typescript
// lib/db.ts additions

export async function createEvent(event: EventInput): Promise<EventDB> {
    const { rows } = await sql<EventDB>`
        INSERT INTO events (name, description, event_date, event_time, location, group_code, is_active)
        VALUES (${event.name}, ${event.description}, ${event.event_date}, ${event.event_time}, ${event.location}, ${event.group_code}, ${event.is_active || true})
        RETURNING *
    `;
    
    // Auto-create attendance records for all players in the group
    await createAttendanceRecordsForEvent(rows[0].id, event.group_code);
    
    return rows[0];
}

export async function getEventsByGroup(groupCode: string): Promise<EventWithStats[]> {
    const { rows } = await sql<EventWithStats>`
        SELECT 
            e.*,
            COUNT(a.id) as total_players,
            COUNT(CASE WHEN a.is_attending = true THEN 1 END) as attending_count,
            COUNT(CASE WHEN a.is_attending = false THEN 1 END) as not_attending_count,
            COUNT(CASE WHEN a.is_attending IS NULL THEN 1 END) as no_response_count,
            ROUND(
                COUNT(CASE WHEN a.is_attending = true THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0), 
                1
            ) as attendance_rate
        FROM events e
        LEFT JOIN attendance a ON e.id = a.event_id
        WHERE e.group_code = ${groupCode} AND e.is_active = true
        GROUP BY e.id
        ORDER BY e.event_date DESC, e.event_time DESC
    `;
    
    return rows;
}

async function createAttendanceRecordsForEvent(eventId: number, groupCode: string): Promise<void> {
    await sql`
        INSERT INTO attendance (player_id, event_id, is_attending)
        SELECT p.id, ${eventId}, false
        FROM players p
        WHERE p.group_code = ${groupCode} AND p.is_active = true
    `;
}
```

### Attendance Operations

```typescript
export async function getAttendanceForEvent(eventId: number): Promise<PlayerWithAttendance[]> {
    const { rows } = await sql<PlayerWithAttendance>`
        SELECT 
            p.*,
            a.id as attendance_id,
            a.is_attending,
            a.response_date,
            a.notes
        FROM players p
        LEFT JOIN attendance a ON p.id = a.player_id AND a.event_id = ${eventId}
        WHERE p.group_code = (SELECT group_code FROM events WHERE id = ${eventId})
        AND p.is_active = true
        ORDER BY p.first_name, p.last_name
    `;
    
    return rows;
}

export async function updateAttendance(attendanceData: AttendanceInput[]): Promise<void> {
    // Use transaction for bulk updates
    await sql.begin(async (sql) => {
        for (const attendance of attendanceData) {
            await sql`
                INSERT INTO attendance (player_id, event_id, is_attending, notes)
                VALUES (${attendance.player_id}, ${attendance.event_id}, ${attendance.is_attending}, ${attendance.notes})
                ON CONFLICT (player_id, event_id)
                DO UPDATE SET 
                    is_attending = EXCLUDED.is_attending,
                    notes = EXCLUDED.notes,
                    response_date = CURRENT_TIMESTAMP
            `;
        }
    });
}

export async function getAttendingPlayersForEvent(eventId: number): Promise<Player[]> {
    const { rows } = await sql<Player>`
        SELECT p.*
        FROM players p
        INNER JOIN attendance a ON p.id = a.player_id
        WHERE a.event_id = ${eventId} AND a.is_attending = true AND p.is_active = true
        ORDER BY p.first_name, p.last_name
    `;
    
    return rows;
}
```

## UI/UX Implementation Options

### Option 1: Tab-Based Navigation (Recommended)

**Structure**: Players | Events | Teams

#### Benefits
- Clear separation of concerns
- Familiar navigation pattern
- Easy to implement with existing tab system

#### Implementation
```typescript
// Update main page tabs
const tabs = [
    { id: 'players', label: 'Players', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'teams', label: 'Teams', icon: Trophy }
];

// New EventsView component
interface EventsViewProps {
    events: EventWithStats[];
    selectedEvent: EventDB | null;
    onEventSelect: (event: EventDB) => void;
    onCreateEvent: () => void;
    onEditEvent: (event: EventDB) => void;
    onDeleteEvent: (eventId: number) => void;
    groupCode: string;
}
```

#### Event Management UI
```tsx
// EventsView.tsx
export default function EventsView({ events, selectedEvent, onEventSelect, ... }: EventsViewProps) {
    return (
        <div className="space-y-6">
            {/* Event List */}
            <div className="grid gap-4">
                {events.map(event => (
                    <EventCard 
                        key={event.id}
                        event={event}
                        isSelected={selectedEvent?.id === event.id}
                        onClick={() => onEventSelect(event)}
                    />
                ))}
            </div>
            
            {/* Selected Event Details */}
            {selectedEvent && (
                <EventAttendanceView 
                    event={selectedEvent}
                    onAttendanceUpdate={handleAttendanceUpdate}
                />
            )}
        </div>
    );
}
```

#### Event Card Component
```tsx
interface EventCardProps {
    event: EventWithStats;
    isSelected: boolean;
    onClick: () => void;
}

function EventCard({ event, isSelected, onClick }: EventCardProps) {
    return (
        <div 
            className={`card-modern p-4 cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-gray-900">{event.name}</h3>
                    <p className="text-sm text-gray-500">
                        {formatDate(event.event_date)} {event.event_time && `at ${event.event_time}`}
                    </p>
                    {event.location && (
                        <p className="text-sm text-gray-500">{event.location}</p>
                    )}
                </div>
                
                <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                        {event.attending_count}/{event.total_players}
                    </div>
                    <div className="text-xs text-gray-500">
                        {event.attendance_rate}% attending
                    </div>
                </div>
            </div>
            
            {/* Attendance Status Bar */}
            <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${event.attendance_rate}%` }}
                />
            </div>
        </div>
    );
}
```

### Option 2: Sidebar Navigation

**Structure**: Sidebar with Groups/Events | Main Content Area

#### Benefits
- More screen real estate for content
- Better for managing multiple events simultaneously
- Professional application feel

#### Implementation
```tsx
// Layout with sidebar
export default function AppLayout() {
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <GroupSelector />
                <EventsList />
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <Header />
                <MainContent />
            </div>
        </div>
    );
}
```

### Option 3: Modal-Based Event Management

**Structure**: Players Tab | Teams Tab + Event Selection Modal

#### Benefits
- Minimal UI changes to existing structure
- Quick event switching
- Contextual event management

#### Implementation
```tsx
// Floating event selector
function EventSelector({ events, selectedEvent, onEventChange }: EventSelectorProps) {
    return (
        <div className="fixed top-4 right-4 z-50">
            <Select value={selectedEvent?.id} onValueChange={onEventChange}>
                <SelectTrigger className="w-64 bg-white shadow-lg">
                    <SelectValue placeholder="Select an event..." />
                </SelectTrigger>
                <SelectContent>
                    {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                            <div className="flex justify-between w-full">
                                <span>{event.name}</span>
                                <span className="text-green-600">
                                    {event.attending_count}/{event.total_players}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
```

## State Management Updates

### Enhanced useGroupManager Hook

```typescript
// hooks/useGroupManager.ts
export function useGroupManager() {
    // Existing state
    const [players, setPlayers] = useState<Player[]>([]);
    const [groupCode, setGroupCode] = useState('');
    
    // New event-related state
    const [events, setEvents] = useState<EventWithStats[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventDB | null>(null);
    const [attendanceData, setAttendanceData] = useState<Map<number, AttendanceDB[]>>(new Map());
    
    // New methods
    const loadEvents = useCallback(async (groupCode: string) => {
        const response = await fetch(`/api/events?group_code=${groupCode}`);
        const events = await response.json();
        setEvents(events);
        
        // Auto-select most recent upcoming event
        const upcomingEvent = events.find(e => new Date(e.event_date) >= new Date());
        if (upcomingEvent) {
            setSelectedEvent(upcomingEvent);
        }
    }, []);
    
    const createEvent = useCallback(async (eventData: EventInput) => {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        
        if (response.ok) {
            const newEvent = await response.json();
            setEvents(prev => [newEvent, ...prev]);
            setSelectedEvent(newEvent);
        }
    }, []);
    
    const updateAttendance = useCallback(async (eventId: number, updates: AttendanceInput[]) => {
        const response = await fetch('/api/attendance/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        
        if (response.ok) {
            // Refresh attendance data
            await loadAttendanceForEvent(eventId);
            await loadEvents(groupCode); // Refresh stats
        }
    }, [groupCode]);
    
    return {
        // Existing returns
        players,
        groupCode,
        // New returns
        events,
        selectedEvent,
        attendanceData,
        loadEvents,
        createEvent,
        updateAttendance,
        setSelectedEvent
    };
}
```

## Migration Strategy

### Phase 1: Database Migration
1. Create new tables (`events`, `attendance`)
2. Keep existing `is_attending` column temporarily
3. Create migration script to convert existing data

### Phase 2: API Implementation
1. Implement new API endpoints
2. Update existing endpoints to work with both old and new systems
3. Add feature flags for gradual rollout

### Phase 3: UI Implementation
1. Implement chosen UI option
2. Add event management interfaces
3. Update team generation to use event-based attendance

### Phase 4: Data Migration & Cleanup
1. Migrate existing attendance data to event-based system
2. Remove deprecated `is_attending` column
3. Clean up old API endpoints

### Migration Script Example

```sql
-- Create a default "General Attendance" event for each group
INSERT INTO events (name, description, event_date, group_code, is_active)
SELECT 
    'General Attendance' as name,
    'Migrated from legacy attendance system' as description,
    CURRENT_DATE as event_date,
    DISTINCT group_code,
    true as is_active
FROM players
WHERE group_code IS NOT NULL;

-- Migrate existing attendance data
INSERT INTO attendance (player_id, event_id, is_attending)
SELECT 
    p.id as player_id,
    e.id as event_id,
    p.is_attending
FROM players p
INNER JOIN events e ON p.group_code = e.group_code
WHERE e.name = 'General Attendance';
```

## Testing Strategy

### Unit Tests
- Event CRUD operations
- Attendance management functions
- Team generation with event-based attendance

### Integration Tests
- API endpoint functionality
- Database operations with transactions
- Migration script validation

### E2E Tests
- Complete user workflows
- Event creation and management
- Attendance tracking and team generation

## Performance Considerations

### Database Optimization
- Proper indexing on foreign keys
- Composite indexes for common queries
- Query optimization for attendance statistics

### Caching Strategy
- Cache event lists per group
- Cache attendance data for active events
- Invalidate caches on updates

### UI Performance
- Lazy loading of attendance data
- Optimistic updates for attendance changes
- Debounced search and filtering

## Security Considerations

### Data Access Control
- Ensure users can only access events for their groups
- Validate group membership before attendance updates
- Audit trail for attendance changes

### API Security
- Rate limiting on event creation
- Input validation and sanitization
- Proper error handling without data leakage

## Future Enhancements

### Advanced Features
- Recurring events
- Event templates
- Attendance reminders
- Historical attendance analytics
- Player availability patterns
- Automated team generation based on historical data

### Integration Possibilities
- Calendar integration (Google Calendar, Outlook)
- Notification system (email, SMS)
- Mobile app for quick attendance updates
- Statistics dashboard for league managers

## Conclusion

This event-based attendance system will significantly enhance the application's capabilities while maintaining the existing user experience. The phased implementation approach ensures minimal disruption to current users while providing a clear path to advanced league management features.

The recommended implementation is **Option 1 (Tab-Based Navigation)** as it provides the best balance of functionality, familiarity, and implementation complexity.