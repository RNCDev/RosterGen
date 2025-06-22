# RosterGen: A Modern Hockey Event & Roster Manager

This is a Next.js application designed to help organize hockey games and manage rosters. It allows users to create groups of players, schedule events, track attendance, and automatically generate balanced teams. The application is built with a focus on a reactive and efficient user experience.

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

A brief overview of the key directories and files in RosterGen.

```
/
├── public/                  # Static assets (images, fonts, etc.)
├── src/
│   ├── app/                 # Next.js App Router directory
│   │   ├── api/             # API routes for backend functionality
│   │   │   ├── attendance/  # API for managing player attendance
│   │   │   ├── events/      # API for event creation and management
│   │   │   ├── groups/      # API for group and roster management
│   │   │   ├── players/     # API for player CRUD operations
│   │   │   ├── stats/       # API for generating player/team stats
│   │   │   └── teams/       # API for team generation
│   │   ├── globals.css    # Global stylesheets
│   │   ├── layout.tsx     # Root layout component for the application
│   │   └── page.tsx       # Main landing page component
│   │
│   ├── components/          # Reusable React components
│   │   ├── dialogs/         # Dialog/modal components for user interactions
│   │   ├── ui/              # Core UI components from shadcn/ui (Button, Dialog, etc.)
│   │   ├── ActionHeader.tsx # Header component with primary action buttons
│   │   ├── EventsView.tsx   # Component to display and manage events
│   │   ├── PlayersView.tsx  # Component to display and manage the player roster
│   │   └── TeamsView.tsx    # Component to display generated teams
│   │
│   ├── hooks/               # Custom React hooks for shared logic
│   │   └── useGroupManager.ts # Hook for managing active group state
│   │
│   ├── lib/                 # Utility functions and core logic
│   │   ├── db.ts            # Database connection and query functions
│   │   ├── teamGenerator.ts # Core logic for balancing and generating teams
│   │   └── utils.ts         # General utility functions
│   │
│   └── types/               # TypeScript type definitions
│       ├── declarations.d.ts # Ambient module declarations
│       └── PlayerTypes.ts    # Core types for Players, Events, etc.
│
├── next.config.js           # Next.js configuration file
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