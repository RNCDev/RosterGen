# Future Feature Recommendations

This document outlines potential feature enhancements for the Hockey Roster Manager application, ranging from essential additions to "nice-to-have" improvements that could significantly increase its value and user engagement.

## 1. Dedicated Goalie Support (High Impact)

This is the most critical missing piece for a fully functional hockey roster app. Goalies are a special position, and teams are built around them.

*   **How it would work:**
    *   Add an `is_goalie` boolean property to the `Player` type in `src/types/PlayerTypes.ts`.
    *   Update the UI to visually distinguish goalies (e.g., with a unique icon or color-coded tag).
    *   Modify the player management forms to include an "Is Goalie?" checkbox.
    *   Enhance the team generation logic in `src/lib/teamGenerator.ts` to ensure that if two attending goalies are selected, one is assigned to each team as the first priority.

*   **Benefit:** This brings the application in line with the fundamental rules of hockey, making team generation more realistic and useful.

## 2. Game History & Basic Stats (High Impact)

Currently, generated teams are ephemeral. Creating a record of past games would add significant long-term value.

*   **How it would work:**
    *   Create a `games` table in the database to store game data, including the rosters for each team and the final score.
    *   After generating teams, a "Start Game" button could save the current rosters and create a new game entry.
    *   A new UI page could display a list of past games, showing the teams and scores.

*   **Benefit:** This creates a historical record for the group, allowing users to look back at past matchups and outcomes. It also lays the groundwork for more advanced player statistics.

## 3. Individual Player Stats (Medium Impact)

Introducing a competitive element can make the app more engaging and fun for users.

*   **How it would work:**
    *   On a "Game Details" page (from the Game History feature), add a simple interface to assign goals to players for that game.
    *   The app could automatically calculate assists (e.g., assigning them to the other one or two forwards on the ice for that team at the time of the goal).
    *   Create a "Leaderboard" page that aggregates and displays the top goal-scorers and point-getters for the group.

*   **Benefit:** Adds a fun, competitive dynamic that encourages user engagement and gives players a reason to keep coming back to the app.

## 4. User Authentication & Multi-Group Administration (Nice-to-Have)

This feature would transform the application from a single-group tool into a multi-tenant platform.

*   **How it would work:**
    *   Integrate a user authentication solution like [NextAuth.js](https://next-auth.js.org/).
    *   Associate groups with a specific user ID, so that users can only see and manage the players in the groups they create.
    *   The concept of a `group_code` could be maintained for players to join a specific group, but the administration would be tied to a user account.

*   **Benefit:** Allows the application to be used by many different hockey groups simultaneously without their data overlapping, turning it into a scalable service. 