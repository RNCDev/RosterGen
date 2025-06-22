# RosterGen User Stories

This document outlines the user stories for the RosterGen application, covering player management, event scheduling, and team generation.

## Group Management

-   [x] **US01: Load Group:** As a user, I want to enter a group code and click a "Load" button so that I can retrieve a previously saved roster of players.
-   [x] **US02: Create/Save Group:** As a user, I want to be able to save the current list of players under a new or existing group code so that I can persist my changes for future use.
-   [x] **US03: Clear Workspace:** As a user, I want to click a "Clear" button to remove the current group code and all players from the view so that I can start fresh.
-   [x] **US04: Delete Group:** As a user, I want to delete an entire set of players associated with a group code so that I can permanently remove rosters I no longer need.

## Player Management (Within a Group)

-   [x] **US05: Add Single Player:** As a user, I want to open a form to add a single new player with their name, skill level, and position to the current group so that I can easily make small additions to my roster.
-   [x] **US06: Edit Single Player:** As a user, I want to edit the details of a single player directly in the player list and save those changes immediately so that I can make quick corrections.
-   [x] **US07: Delete Single Player:** As a user, I want to delete a single player from the roster so that I can remove individuals who are no longer part of the group.

## CSV Import

-   [x] **US08: Upload CSV:** As a user with a group code loaded, I want to upload a CSV file to populate the player list so that I can quickly import a large number of players.
-   [x] **US09: CSV Import Group Association:** As a user uploading a CSV, I want the imported players to be automatically associated with the currently active group code.

## Event & Attendance Management

-   [x] **EV01: Create Event:** As a user, I want to create a new event with a name, date, and other details, so I can schedule a game or practice.
-   [x] **EV02: View Events List:** As a user, I want to see a list of all upcoming and past events for my group.
-   [x] **EV03: Select Event:** As a user, I want to select an event from the list to view its specific attendance details.
-   [x] **EV04: Delete Event:** As a user, I want to delete an event, which will also remove all associated attendance records.
-   [x] **EV05: Individual Attendance Toggle:** As a user viewing an event, I want to toggle a player's attendance status ("Attending" / "Not Attending") with a single click, so I can quickly update the list.
-   [x] **EV06: Bulk Attendance Edit Mode:** As a user viewing an event, I want to enter a "Bulk Edit" mode so I can efficiently update attendance for multiple players using checkboxes.
-   [x] **EV07: Save Bulk Attendance:** As a user in "Bulk Edit" mode, I want to click "Save Changes" to commit all my updates in a single action.
-   [x] **EV08: Cancel Bulk Attendance:** As a user in "Bulk Edit" mode, I want a "Cancel" button to discard all my attendance changes and exit the mode.
-   [x] **EV09: Smart Attendance Defaults:** As a user creating a new event, I want the system to automatically default each player's attendance to their attendance status from the most recent previous event, so I don't have to manually set attendance for regular attendees every time.

## Feedback & State Management

-   [x] **UI01: Visual Feedback on Actions:** As a user, I want to see clear visual feedback (e.g., loading spinners, success messages, error alerts) after performing actions like saving, loading, or deleting, so that I understand the system's status.
-   [x] **UI02: Smooth UI Updates:** As a user updating attendance, I want the UI to update instantly without the whole page reloading or losing my scroll position.
-   [x] **UI03: Empty State Guidance:** As a new user, when no group is loaded, I want to see a clear message guiding me on how to get started.

## Team Generation (For an Event)

-   [x] **TG01: Generate Balanced Teams:** As a user viewing an event, I want to click a "Generate Teams" button that uses only the players marked as *attending that specific event* to create two balanced teams.
-   [x] **TG02: View Team Rosters and Stats:** As a user, after generating teams, I want to see the generated team rosters and view statistics for each team (e.g., average skill, player counts).
-   [x] **TG03: Regenerate Teams:** As a user on the "Teams" view, I want a "Regenerate" button that re-runs the team generation algorithm for the same event to get a new set of balanced teams.
-   [x] **TG04: Customize Team Names:** As a user, I want to be able to edit the names of the generated teams.
-   [x] **TG05: Empty State for Teams View:** As a user who navigates to the "Teams" view before generating teams, I want to see a message guiding me to generate them from the attendance list. 