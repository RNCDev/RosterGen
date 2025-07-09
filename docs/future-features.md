# Future Features

## TeamSnap Integration for Attendance Sync

### Overview
Integrate with TeamSnap's API to automatically sync attendance data from TeamSnap events into RosterGen events. This will allow users to import attendance responses from their TeamSnap team events with a single button click.

### Prerequisites
1. **App Registration Required**: Yes, you need to register an OAuth application with TeamSnap to get:
   - Client ID
   - Client Secret
   - Redirect URIs

TEAMSNAP_CLIENT_ID=_uOaD0EiVvsI1aAB4w8ydRM5GtqIEHtMyPw2FukvuuU
TEAMSNAP_CLIENT_SECRET=1E6d6d7tSyXUB_PzLyFX1lmE00f5zm-I7urB9pVC_2w
TEAMSNAP_REDIRECT_URI=http://localhost:3000/api/auth/teamsnap/callback 

2. **TeamSnap API Authentication**: Uses OAuth 2.0 flow
   - Authorization endpoint: `https://auth.teamsnap.com/oauth/authorize`
   - Token endpoint: `https://auth.teamsnap.com/oauth/token`
   - API Base URL: `https://api.teamsnap.com/v3/`

### Implementation Plan

#### Phase 1: OAuth Setup & Configuration
- [ ] Register OAuth application at TeamSnap Developer Portal with redirect URIs:
  - Development: `http://localhost:3000/api/auth/teamsnap/callback`
  - Production: `https://roster-gen.vercel.app/api/auth/teamsnap/callback`
- [ ] Add environment variables for TeamSnap credentials:
  
  **Development (.env.local):**
  ```env
  TEAMSNAP_CLIENT_ID=your_client_id
  TEAMSNAP_CLIENT_SECRET=your_client_secret
  TEAMSNAP_REDIRECT_URI=http://localhost:3000/api/auth/teamsnap/callback
  ```
  
  **Production (Vercel Environment Variables):**
  ```env
  TEAMSNAP_CLIENT_ID=your_client_id
  TEAMSNAP_CLIENT_SECRET=your_client_secret
  TEAMSNAP_REDIRECT_URI=https://roster-gen.vercel.app/api/auth/teamsnap/callback
  ```
- [ ] Create OAuth callback API route: `/api/auth/teamsnap/callback`
- [ ] Store TeamSnap tokens securely (consider encrypted storage)

#### Phase 2: Database Schema Updates
- [ ] Add TeamSnap integration table:
  ```sql
  CREATE TABLE teamsnap_integrations (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES groups(id),
    teamsnap_team_id VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- [ ] Add TeamSnap event mapping:
  ```sql
  CREATE TABLE teamsnap_event_mappings (
    id SERIAL PRIMARY KEY,
    event_id INTEGER REFERENCES events(id),
    teamsnap_event_id VARCHAR(255),
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

#### Phase 3: TeamSnap API Client
- [ ] Create `src/lib/teamsnap-client.ts` with:
  - OAuth token management
  - API request helpers
  - Error handling for rate limits and API errors
  - Functions for:
    - `getTeams()` - List user's teams
    - `getEvents(teamId)` - Get events for a team
    - `getAvailabilities(eventId)` - Get attendance responses for an event
    - `getMembers(teamId)` - Get team members for player matching

#### Phase 4: Player Matching Logic
- [ ] Create `src/lib/teamsnap-matcher.ts` for:
  - Matching TeamSnap members to RosterGen players by:
    - Name similarity (fuzzy matching)
    - Email address (if available)
    - Manual mapping interface
  - Handling unmatched players:
    - Option to create new players
    - Option to skip unmatched players
    - Store mapping preferences

#### Phase 5: UI Components
- [ ] **TeamSnap Connect Button** in Group Settings:
  - Trigger OAuth flow
  - Show connection status
  - Allow disconnection

- [ ] **Sync Attendance Button** in `AttendanceControls.tsx`:
  - Add new button next to "Generate Teams"
  - Show sync status and last sync time
  - Display sync conflicts/errors

- [ ] **TeamSnap Event Selector Dialog**:
  - List available TeamSnap events
  - Allow user to map to current RosterGen event
  - Show preview of attendance changes

- [ ] **Player Mapping Interface**:
  - Side-by-side view of TeamSnap members vs RosterGen players
  - Drag-and-drop or dropdown mapping
  - Confidence scores for automatic matches

#### Phase 6: API Endpoints
- [ ] `POST /api/teamsnap/connect` - Initiate OAuth flow
- [ ] `GET /api/teamsnap/teams` - List connected teams
- [ ] `GET /api/teamsnap/events?teamId=...` - List team events
- [ ] `POST /api/teamsnap/sync-attendance` - Sync attendance from TeamSnap event
- [ ] `GET /api/teamsnap/status?groupId=...` - Check connection status

#### Phase 7: Sync Logic Implementation
- [ ] Create `src/lib/teamsnap-sync.ts`:
  - Map TeamSnap availabilities to RosterGen attendance
  - Handle different response types:
    - "Yes" → `is_attending: true`
    - "No" → `is_attending: false`
    - "Maybe" → `is_attending: false` (with note)
    - No response → no change
  - Batch update attendance records
  - Log sync operations for auditing

#### Phase 8: Enhanced UX Features
- [ ] **Auto-sync Options**:
  - Periodic background sync (webhook or cron)
  - Real-time sync via webhooks (if supported)
  - Manual refresh button

- [ ] **Conflict Resolution**:
  - Show changes before applying
  - Allow selective sync (choose which players to update)
  - Preserve manual overrides option

- [ ] **Sync History**:
  - Track sync operations in database
  - Show last sync time in UI
  - Rollback capability for recent syncs

### User Experience Flow
1. **Setup** (One-time per group):
   - User clicks "Connect TeamSnap" in group settings
   - OAuth flow redirects to TeamSnap for authorization
   - User selects which TeamSnap team to connect
   - Connection stored and verified

2. **Per-Event Sync**:
   - User navigates to event attendance view
   - Clicks "Sync from TeamSnap" button
   - Dialog shows available TeamSnap events
   - User selects corresponding TeamSnap event
   - Preview shows which players will be updated
   - User confirms sync
   - Attendance table updates with TeamSnap data

3. **Ongoing Usage**:
   - Button shows last sync time
   - Quick re-sync with same event mapping
   - Notifications for sync conflicts or errors

### Technical Considerations
- **Rate Limiting**: TeamSnap API has rate limits, implement retry logic
- **Token Refresh**: Handle expired tokens gracefully
- **Error Handling**: Comprehensive error messages for API failures
- **Security**: Store tokens encrypted, validate all API responses
- **Performance**: Cache TeamSnap data where appropriate
- **Privacy**: Only request necessary permissions from TeamSnap

### Future Enhancements
- [ ] Two-way sync (update TeamSnap from RosterGen changes)
- [ ] Multiple team connections per group
- [ ] Automatic event matching by date/time
- [ ] Integration with other sports management platforms
- [ ] Webhook support for real-time updates

### Testing Strategy
- [ ] Unit tests for API client and sync logic
- [ ] Integration tests with TeamSnap sandbox environment
- [ ] E2E tests for OAuth flow
- [ ] Mock TeamSnap responses for CI/CD
- [ ] User acceptance testing with real TeamSnap accounts

### Documentation
- [ ] User guide for setting up TeamSnap integration
- [ ] Troubleshooting guide for common sync issues
- [ ] API documentation for internal TeamSnap integration
- [ ] Privacy policy updates for TeamSnap data handling
