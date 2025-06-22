# RosterGen: A Modern Hockey Event & Roster Manager

This is a Next.js application designed to help organize hockey games and manage rosters. It allows users to create groups of players, schedule events, track attendance, and automatically generate balanced teams. The application is built with a focus on a reactive and efficient user experience.

![Hockey Roster Manager Screenshot](https://i.imgur.com/xVd2OOf.png)

## Core Features

-   **Group Management**: Organize players into distinct groups using a unique group code. Load, create, and manage your group's roster.
-   **Player Management**: Add, edit, and delete players from your group. Set their skill level and preferred position (forward/defense).
-   **CSV Import**: Quickly populate your roster by uploading a CSV file of players.
-   **Event Scheduling**: Create and manage events (games, practices, etc.) with specific dates, times, and locations.
-   **Advanced Attendance Tracking**:
    -   View attendance status for each player for a selected event.
    -   Toggle individual player attendance with an instant UI update (no page reloads!).
    -   **New! Bulk Edit Mode**: Efficiently update attendance for multiple players at once using a simple checkbox interface.
    -   **Smart Attendance Defaults**: When creating a new event, player attendance automatically defaults to their attendance status from the most recent previous event, saving time for groups with consistent attendance patterns.
-   **Automatic Team Generation**: Generate balanced teams for an event based on the skill level and position of attending players.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Database**: [Vercel Postgres](https://vercel.com/storage/postgres)
-   **Deployment**: [Vercel](https://vercel.com/)

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── attendance/
│   │   ├── events/
│   │   ├── groups/
│   │   ├── players/
│   │   └── teams/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/
│   ├── dialogs/
│   ├── ActionHeader.tsx
│   ├── AppHeader.tsx
│   ├── EventsView.tsx
│   ├── PlayersView.tsx
│   └── TeamsView.tsx
│
├── hooks/
│   └── useGroupManager.ts
│
├── lib/
│   ├── db.ts
│   ├── teamGenerator.ts
│   └── utils.ts
│
└── types/
    └── PlayerTypes.ts
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

6.  **Database Schema**:
    You will need to create the `players`, `events`, and `attendance` tables in your database. You can use the following SQL commands:

    ```sql
    -- Stores all player information and their default settings
    CREATE TABLE players (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        skill INTEGER NOT NULL,
        is_defense BOOLEAN NOT NULL,
        is_attending BOOLEAN NOT NULL DEFAULT true, -- Default status, not event-specific
        group_code VARCHAR(255) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Stores event-specific information
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
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Junction table to track player attendance for each event
    CREATE TABLE attendance (
        id SERIAL PRIMARY KEY,
        player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
        event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        is_attending BOOLEAN NOT NULL,
        response_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        UNIQUE(player_id, event_id) -- Ensures one attendance record per player per event
    );
    ```

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