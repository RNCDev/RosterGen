# Hockey Roster Manager

This is a Next.js application designed to help manage hockey rosters. It allows users to create groups of players, manage player details, and automatically generate balanced teams.

![Hockey Roster Manager Screenshot](https://i.imgur.com/xVd2OOf.png)

## Features

-   **Player Management**: Add, edit, and delete players.
-   **CSV Import**: Bulk add players by uploading a CSV file.
-   **Team Generation**: Automatically generate balanced teams based on player skill levels and positions.
-   **Group Management**: Organize players into groups using a unique group code.
-   **Attendance Tracking**: Mark players as attending or not attending.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Database**: [Vercel Postgres](https://vercel.com/storage/postgres)
-   **CSV Parsing**: [Papa Parse](https://www.papaparse.com/)
-   **Deployment**: [Vercel](https://vercel.com/)

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
    You will need to create the `players` table in your database. You can use the following SQL command:

    ```sql
    CREATE TABLE players (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        skill INTEGER NOT NULL,
        is_defense BOOLEAN NOT NULL,
        is_attending BOOLEAN NOT NULL DEFAULT true,
        group_code VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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