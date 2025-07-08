# RosterGen User Stories

This document outlines the user stories for the RosterGen application, covering player management, event scheduling, and team generation.

## Group Management

-   [x] **US01: Load Group:** As a user, I want to enter a group code and click a "Load" button so that I can retrieve a previously saved roster of players.
-   [x] **US02: Create/Save Group:** As a user, I want to be able to save the current list of players under a new or existing group code so that I can persist my changes for future use.
-   [x] **US03: Clear Workspace:** As a user, I want to click a "Clear" button to remove the current group code and all players from the view so that I can start fresh.
-   [x] **US04: Delete Group:** As a user, I want to delete an entire set of players associated with a group code so that I can permanently remove rosters I no longer need.

## Player Management (Within a Group)

-   [x] **US05: Add Single Player:** As a user, I want to open a form to add a single new player with their name, skill level (1-7), and position to the current group so that I can easily make small additions to my roster.
-   [x] **US06: Edit Single Player:** As a user, I want to edit the details of a single player directly in the player list and save those changes immediately so that I can make quick corrections.
-   [x] **US07: Delete Single Player:** As a user, I want to delete a single player from the roster so that I can remove individuals who are no longer part of the group.
-   [x] **US08: Bulk Edit Players:** As a user, I want to select multiple players and edit their details in bulk so that I can efficiently update roster information.
-   [x] **US09: Player Filtering and Sorting:** As a user, I want to filter players by position and skill level, and sort them by various criteria so that I can quickly find specific players.

## CSV Import

-   [x] **US10: Upload CSV:** As a user with a group code loaded, I want to upload a CSV file to populate the player list so that I can quickly import a large number of players.
-   [x] **US11: CSV Import Group Association:** As a user uploading a CSV, I want the imported players to be automatically associated with the currently active group code.

## Event & Attendance Management

-   [x] **EV01: Create Event:** As a user, I want to create a new event with a name, date, and other details, so I can schedule a game or practice.
-   [x] **EV02: View Events List:** As a user, I want to see a list of all upcoming and past events for my group.
-   [x] **EV03: Select Event:** As a user, I want to select an event from the list to view its specific attendance details.
-   [x] **EV04: Delete Event:** As a user, I want to delete an event, which will also remove all associated attendance records.
-   [x] **EV05: Individual Attendance Toggle:** As a user viewing an event, I want to toggle a player's attendance status ("Attending" / "Not Attending") with a single click, so I can quickly update the list.
-   [x] **EV06: Smart Attendance Defaults:** As a user creating a new event, I want the system to automatically default each player's attendance to their attendance status from the most recent previous event, so I don't have to manually set attendance for regular attendees every time.
-   [x] **EV07: Duplicate Event:** As a user, I want to click a duplicate icon on an event card to quickly create a copy of that event with a new name and date, so I can easily schedule recurring events.
-   [x] **EV08: New Player Future Attendance:** As a user, when I add a new player to the roster, I want that player to automatically be added to the attendance records for all future events in the group, so I don't have to manually add them to each upcoming event.
-   [x] **EV09: Attendance Pagination:** As a user viewing attendance for events with many players, I want to navigate through pages of players so I can efficiently view all attendance information.

## Feedback & State Management

-   [x] **UI01: Visual Feedback on Actions:** As a user, I want to see clear visual feedback (e.g., loading spinners, success messages, error alerts) after performing actions like saving, loading, or deleting, so that I understand the system's status.
-   [x] **UI02: Smooth UI Updates:** As a user updating attendance, I want the UI to update instantly without the whole page reloading or losing my scroll position.
-   [x] **UI03: Empty State Guidance:** As a new user, when no group is loaded, I want to see a clear message guiding me on how to get started.

## Team Generation (For an Event)

-   [x] **TG01: Generate Balanced Teams:** As a user viewing an event, I want to click a "Generate Teams" button that uses only the players marked as *attending that specific event* to create two balanced teams.
-   [x] **TG02: View Team Rosters and Stats:** As a user, after generating teams, I want to see the generated team rosters and view statistics for each team (e.g., average skill, player counts).
-   [x] **TG03: Regenerate Teams:** As a user on the "Teams" view, I want a "Regenerate" button that re-runs the team generation algorithm for the same event to get a new set of balanced teams.
-   [x] **TG04: Customize Team Names:** As a user, I want to be able to edit the names of the generated teams that persist across all events in the group.
-   [x] **TG05: Save Teams to Event:** As a user, I want to save the generated teams to a specific event so I can preserve the team composition for future reference.
-   [x] **TG06: Load Saved Teams:** As a user, I want to load previously saved teams from an event so I can quickly restore team compositions.
-   [x] **TG07: Delete Saved Teams:** As a user, I want to delete saved teams from an event so I can remove team compositions that are no longer needed.
-   [x] **TG08: Empty State for Teams View:** As a user who navigates to the "Teams" view before generating teams, I want to see a message guiding me to generate them from the attendance list.

## Player Ranking System

-   [x] **PR01: Tournament Setup:** As a user, I want to start a ranking tournament for my players so I can establish accurate skill levels through head-to-head comparisons.
-   [x] **PR02: Player Matchups:** As a user in a ranking tournament, I want to see strategic player matchups and choose the better player in each comparison.
-   [x] **PR03: Tournament Progress:** As a user during a tournament, I want to see my progress with a progress bar and completion counter so I know how many comparisons remain.
-   [x] **PR04: Elo-Based Rankings:** As a user, I want the tournament to use Elo-based algorithms to produce accurate skill rankings based on head-to-head results.
-   [x] **PR05: View Rankings:** As a user, I want to view the final tournament rankings in a paginated table with ranks and skill levels.
-   [x] **PR06: Apply Rankings:** As a user, I want to apply the tournament results directly to my roster so the new skill levels are saved to each player.
-   [x] **PR07: Reset Tournament:** As a user, I want to reset and start a new tournament if I want to re-rank players with different matchups. 