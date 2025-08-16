# RosterGen: A Modern Hockey Event & Roster Manager

This is a Next.js application designed to help organize hockey games and manage rosters. It allows users to create groups of players, schedule events, track attendance, and automatically generate balanced teams. The application is built with a focus on a reactive and efficient user experience.

## Core Features

-   **Group Management**: Organize players into distinct groups using a unique group code. Load, create, and manage your group's roster.
-   **Player Management**: Add, edit, and delete players from your group. Set their skill level (1-7) and preferred position (forward/defense). Includes bulk editing capabilities for efficient roster updates.
-   **CSV Import**: Quickly populate your roster by uploading a CSV file of players.
-   **Event Scheduling**: Create and manage events (games, practices, etc.) with specific dates, times, and locations.
-   **Advanced Attendance Tracking**:
-   View attendance status for each player for a selected event.
-   Toggle individual player attendance with an instant UI update (no page reloads!).
-   **Smart Attendance Defaults**: When creating a new event, player attendance automatically defaults to their attendance status from the most recent previous event, saving time for groups with consistent attendance patterns.
-   **New! Automatic Future Attendance**: When adding a new player to the roster, they are automatically added to all future events in the group with a default "not attending" status.
-   **Advanced Team Generation & Management**:
-   **Automatic Team Generation**: Generate balanced teams for an event based on the skill level and position of attending players.
-   **Custom Team Names**: Define custom team names (instead of "Red" and "White") that persist across all events in a group, with real-time UI feedback when updating.
-   **Save Teams to Events**: Preserve generated team rosters by saving them directly to specific events for future reference.
-   **Load Saved Teams**: Quickly restore previously saved team compositions with a single click, perfect for recurring lineups or preferred team arrangements.
-   **Dynamic Team Display**: Teams automatically use custom names throughout the interface, from generation to display and copying.
-   **Player Rank Tournament**: Interactive tournament system to refine player skill ratings through head-to-head comparisons:
-   **Smart Matchup Generation**: Creates approximately 1.5x the number of players in strategic pairings
-   **Head-to-Head Comparisons**: Simple click-based interface to choose the better player in each matchup
-   **Elo-Based Ranking System**: Uses tournament-grade rating algorithms for accurate skill assessment
-   **Whole Number Rankings**: Produces clean 1-7 skill levels that can be applied directly to the roster
-   **Progress Tracking**: Real-time progress bar and completion counter during tournament play
-   **Paginated Results**: Easy-to-read results table with pagination for large rosters
-   **Direct Integration**: Apply tournament results directly to player skill levels with one click
-   **Event Management**:
-   Create and manage events with specific dates, times, and locations.
-   **New! Duplicate Events**: Quickly duplicate existing events with a new name and date using the copy icon on event cards, perfect for recurring events.

-   **New! TeamSnap Integration (In Progress)**:
    -   Connect your TeamSnap account directly to RosterGen via a secure OAuth2 flow.
    -   Link your RosterGen group to a specific TeamSnap team using the TeamSnap Team ID.
    -   View detailed attendance status (Confirmed, Maybe, Declined) for a linked event directly from TeamSnap.
    -   *Next Step:* Use the fetched TeamSnap data to automatically update attendance in RosterGen with a single click.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Database**: [Vercel Postgres](https://vercel.com/storage/postgres)
-   **Deployment**: [Vercel](https://vercel.com/)

## Database Schema

The database is designed around five core tables to manage groups, players, events, and attendance.

### `groups` Table
Stores the top-level grouping for rosters. Each group has a unique, user-defined code.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | integer | Primary Key | Unique identifier for the group. |
| `code` | character varying(255) | Not Null, Unique | The user-facing unique code for the group. |
| `created_at` | timestamp with time zone | Default: `CURRENT_TIMESTAMP` | Timestamp of when the group was created. |
| `team-alias-1` | character varying(125) | Not Null, Default: `'Red'` | Custom name for Team 1. |
| `team-alias-2` | character varying(125) | Not Null, Default: `'White'` | Custom name for Team 2. |
| `teamsnap_team_id` | character varying(125) | Not Null | link to Teamsnap team |

### `players` Table
Contains the roster of players for each group.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | integer | Primary Key | Unique identifier for the player. |
| `first_name` | character varying(255) | Not Null | Player's first name. |
| `last_name` | character varying(255) | Not Null | Player's last name. |
| `skill` | integer | | Skill level from 1-7. |
| `is_defense` | boolean | Default: `false` | Preferred position (true for defense, false for forward). |
| `is_active` | boolean | Default: `true` | Soft delete flag. |
| `group_id` | integer | Foreign Key (`groups.id`) | Links the player to a group. |
| `created_at` | timestamp with time zone | Default: `CURRENT_TIMESTAMP` | Timestamp of when the player was added. |
| `updated_at` | timestamp with time zone | Default: `CURRENT_TIMESTAMP` | Timestamp of the last update. |
| `email` | character varying(255) | | Player's email address. |
| `phone` | character varying(255) | | Player's phone number. |

### `events` Table
Stores information about scheduled games or practices.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | integer | Primary Key | Unique identifier for the event. |
| `name` | character varying(255) | Not Null | Name of the event (e.g., "Friday Skate"). |
| `description`| text | | Optional details about the event. |
| `event_date`| date | Not Null | The date of the event. |
| `event_time`| time without time zone | | The start time of the event. |
| `location` | character varying(255) | | The location of the event. |
| `is_active` | boolean | Default: `true` | Soft delete flag. |
| `group_id` | integer | Foreign Key (`groups.id`) | Links the event to a group. |
| `created_at`| timestamp with time zone | Default: `CURRENT_TIMESTAMP` | Timestamp of when the event was created. |
| `updated_at`| timestamp with time zone | Default: `CURRENT_TIMESTAMP` | Timestamp of the last update. |
| `saved_teams_data`| text | | JSON string of saved team rosters for the event. |
| `teamsnap_event_id` | character varying(255) | | optinal link to a teamsnap event. |

### `attendance` Table
Tracks player attendance for each event. A record is created for each player when a new event is made.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | integer | Primary Key | Unique identifier for the attendance record. |
| `player_id` | integer | Not Null, Foreign Key (`players.id`) | Links to the player. |
| `event_id` | integer | Not Null, Foreign Key (`events.id`) | Links to the event. |
| `is_attending`| boolean | Not Null, Default: `false` | Whether the player is attending the event. |
| `response_date`| timestamp with time zone | Default: `CURRENT_TIMESTAMP` | When the attendance was last updated. |
| `notes` | text | | Optional notes from the player about their status.|

## Project Structure

A brief overview of the key directories and files in RosterGen.

```
/
├── components.json          # shadcn/ui component configuration
├── docs/                    # Documentation files
│   ├── future-features.md   # Planned features and enhancements
│   └── user-stories.md      # User stories and requirements
├── jest.config.js           # Jest testing configuration
├── jest.setup.js            # Jest setup and test environment configuration
├── lib/                     # Root-level database utilities
│   └── db.ts                # Database connection setup
├── src/
│   ├── app/                 # Next.js App Router directory
│   │   ├── api/             # API routes for backend functionality
│   │   │   ├── __tests__/   # API route tests
│   │   │   │   └── api-utils.test.ts
│   │   │   ├── attendance/  # API for managing player attendance
│   │   │   │   └── route.ts
│   │   │   ├── events/      # API for event creation and management
│   │   │   │   └── teams/   # API for saving/loading teams to/from events
│   │   │   │       └── route.ts
│   │   │   ├── groups/      # API for group and roster management
│   │   │   │   ├── aliases/ # API for updating team alias names
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── players/     # API for player CRUD operations
│   │   │   │   ├── bulk/    # API for bulk player operations
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   ├── stats/       # API for generating player/team stats
│   │   │   │   └── route.ts
│   │   │   ├── teams/       # API for team generation
│   │   │   │   └── route.ts
│   │   ├── teams/           # Team management pages
│   │   │   └── [eventId]/
│   │   ├── globals.css      # Global stylesheets
│   │   ├── layout.tsx       # Root layout component for the application
│   │   └── page.tsx         # Main landing page component
│   │
│   ├── components/          # Reusable React components
│   │   ├── __tests__/       # Component tests
│   │   │   ├── ActionHeader.test.tsx
│   │   │   ├── AttendanceTable.test.tsx
│   │   │   ├── ErrorAlert.test.tsx
│   │   │   ├── PlayerPagination.test.tsx
│   │   │   ├── PlayersView.test.tsx
│   │   │   └── tsconfig.json
│   │   ├── dialogs/         # Dialog/modal components for user interactions
│   │   │   ├── AddPlayerDialog.tsx
│   │   │   ├── CreateEventDialog.tsx
│   │   │   ├── CreateGroupDialog.tsx
│   │   │   ├── DuplicateEventDialog.tsx
│   │   │   ├── PlayerRankTourneyDialog.tsx
│   │   │   └── UploadCsvDialog.tsx
│   │   ├── ui/              # Core UI components from shadcn/ui
│   │   │   ├── Button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── toast.tsx
│   │   ├── ActionHeader.tsx       # Header component with primary action buttons
│   │   ├── AttendanceControls.tsx # Controls for attendance management
│   │   ├── AttendanceTable.tsx    # Table component for attendance display
│   │   ├── ErrorAlert.tsx         # Error alert component
│   │   ├── ErrorBoundary.tsx      # Error boundary for error handling
│   │   ├── EventCard.tsx          # Individual event card component
│   │   ├── EventsList.tsx         # List of events component
│   │   ├── EventsView.tsx         # Main view for events management
│   │   ├── PlayerActionBar.tsx    # Action bar for player operations
│   │   ├── PlayerEmptyState.tsx   # Empty state when no players exist
│   │   ├── PlayerFilters.tsx      # Player filtering and search component
│   │   ├── PlayerPagination.tsx   # Pagination component for player list
│   │   ├── PlayersView.tsx        # Main view for player roster management
│   │   ├── PlayerTable.tsx        # Table component for player display
│   │   └── TeamsView.tsx          # Component to display generated teams
│   │
│   ├── hooks/               # Custom React hooks for shared logic
│   │   ├── __tests__/       # Hook tests
│   │   │   ├── usePlayerFilters.test.ts
│   │   │   └── usePlayerPagination.test.ts
│   │   ├── useAsyncOperation.ts     # Hook for async operations with loading states
│   │   ├── useAttendanceManagement.ts # Hook for attendance operations
│   │   ├── useConfirmDialog.ts      # Hook for confirmation dialogs
│   │   ├── useErrorHandler.ts       # Hook for error handling
│   │   ├── useEventManagement.ts    # Hook for event state management
│   │   ├── useEventsAndAttendance.ts # Hook for events and attendance coordination
│   │   ├── useGroupManager.ts       # Hook for managing active group state
│   │   ├── useGroupState.ts         # Hook for group state management
│   │   ├── usePlayerEditing.ts      # Hook for player editing operations
│   │   ├── usePlayerFilters.ts      # Hook for player filtering and sorting
│   │   ├── usePlayerManagement.ts   # Hook for player management operations
│   │   ├── usePlayerPagination.ts   # Hook for player pagination
│   │   └── useTournament.ts         # Hook for tournament functionality
│   │
│   ├── lib/                 # Utility functions and core logic
│   │   ├── __tests__/       # Library tests
│   │   │   ├── database-operations.test.ts
│   │   │   ├── simple-utils.test.ts
│   │   │   ├── teamGenerator.test.ts
│   │   │   └── utils.test.ts
│   │   ├── api-utils.ts     # API utility functions and error handling
│   │   ├── db.ts            # Database connection and query functions
│   │   ├── teamGenerator.ts # Core logic for balancing and generating teams
│   │   ├── tournamentEngine.ts # Tournament system for player ranking
│   │   └── utils.ts         # General utility functions
│   │
│   └── types/               # TypeScript type definitions
│       ├── declarations.d.ts # Ambient module declarations
│       └── PlayerTypes.ts    # Core types for Players, Events, etc.
│
├── next.config.js           # Next.js configuration file
├── package.json             # Project dependencies and scripts
├── package-lock.json        # Locked dependency versions
├── postcss.config.js        # PostCSS configuration for Tailwind
├── tailwind.config.js       # Tailwind CSS configuration file
└── tsconfig.json            # TypeScript configuration file

```

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 20.x or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Vercel Account](https://vercel.com/signup)
-   [Vercel CLI](https://vercel.com/docs/cli)

### Database Setup

This project uses Vercel Postgres. You will need to create a Postgres database on Vercel and link it to your local project.

1.  **Install the Vercel CLI**:
    ```bash
    npm i -g vercel
    ```

2.  **Login to Vercel**:
    ```bash
    vercel login
    ```

3.  **Link the project to Vercel**:
    From the root of the project directory, run:
    ```bash
    vercel link
    ```
    Follow the prompts to link the project.

4.  **Set up the database**:
    You can create a new Vercel Postgres database through the Vercel dashboard.

5.  **Pull environment variables**:
    Once the database is created and linked, pull the environment variables to your local machine. This will create a `.env.development.local` file with the necessary database connection strings.
    ```bash
    vercel env pull .env.development.local
    ```

### TeamSnap Integration Setup

This project includes a TeamSnap integration for syncing attendance data. The authentication flow is complete, and data fetching is in progress.

1.  **TeamSnap API Credentials**:
    To enable the integration, you must register an application with TeamSnap and add the following environment variables to your `.env.local` file and your Vercel project:
    ```bash
    # TeamSnap OAuth Configuration
    TEAMSNAP_CLIENT_ID=your_client_id_here
    TEAMSNAP_CLIENT_SECRET=your_client_secret_here
    ```

2.  **Authorized Redirect URIs**:
    In your TeamSnap application settings, you must add the following Redirect URIs:
    -   **Production**: `https://roster-gen.vercel.app/api/teamsnap/callback`
    -   **Local Development**: `http://127.0.0.1:3000/api/teamsnap/callback` (or your local port)

3.  **How it Works**:
    -   The application uses a secure OAuth2 flow to connect to a user's TeamSnap account.
    -   The redirect URI for production is hardcoded to ensure consistency across Vercel's preview and production deployments.
    -   For local development, the redirect URI is configured via the `TEAMSNAP_REDIRECT_URI` environment variable.

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-github-username/RosterGen.git
    cd RosterGen
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server**:
    ```bash
    npm run dev
    ```

2.  Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

The application should now be running locally and connected to your Vercel Postgres database.

## Testing

This project uses [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit and component testing.

Test files are located within a `__tests__` directory inside the component's folder (e.g., `src/components/__tests__/ActionHeader.test.tsx`).

To run the test suite, use the following command:

```bash
npm test
```

This will run all test files and provide a summary of the results. 