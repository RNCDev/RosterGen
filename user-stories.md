# RosterGen User Stories

This document outlines the user stories for the Players page refactor.

## Group Management

-   **US01: Load Group:** As a user, I want to enter a group code and click a "Load" button so that I can retrieve a previously saved roster of players.
-   **US02: Create/Save Group:** As a user, I want to be able to save the current list of players under a new or existing group code so that I can persist my changes for future use.
-   **US03: Clear Workspace:** As a user, I want to click a "Clear" button to remove the current group code and all players from the view so that I can start fresh.
-   **US04: Delete Group:** As a user, I want to delete an entire set of players associated with a group code so that I can permanently remove rosters I no longer need.
-   **US05: Unsaved Changes Warning:** As a user, if I have made changes to the players list, I want to be warned before loading a new group, clearing the workspace, or closing the page, so that I don't accidentally lose my work.

## Player Management

-   **US06: Add Single Player:** As a user, I want to open a form to add a single new player with their name, skill level, and position to the current group so that I can easily make small additions to my roster.
-   **US07: Edit Single Player:** As a user, I want to edit the details of a single player directly in the player list and save those changes immediately so that I can make quick corrections.
-   **US08: Bulk Edit Players:** As a user, I want to enter a "Bulk Edit" mode where I can change details for multiple players at once and then save all changes with a single "Save" button, so that I can efficiently update my entire roster.
-   **US09: Cancel Bulk Edit:** As a user, when in "Bulk Edit" mode, I want a "Cancel" button to discard all my changes and revert to the last saved state, so that I can easily undo mistakes.
-   **US10: Delete Single Player:** As a user, I want to delete a single player from the roster so that I can remove individuals who are no longer part of the group.
-   **US10a: Sort Players:** As a user, I want to be able to sort the player list by name, skill, position, or attendance status, so that I can easily analyze my roster.
-   **US10b: Filter Players:** As a user with a large roster, I want to be able to filter my player list to show only forwards, only defensemen, or only attending players, so that I can quickly focus on a subset of my roster.

## CSV Import

-   **US11: Upload CSV:** As a user with a group code loaded, I want to upload a CSV file to populate the player list so that I can quickly import a large number of players.
-   **US12: CSV Preview & Validation:** As a user uploading a CSV, I want to see a preview of the parsed data and be notified of any errors (e.g., missing columns, invalid data) before the import is finalized, so that I can ensure the data is correct.
-   **US13: CSV Import Group Association:** As a user uploading a CSV, I want the imported players to be automatically associated with the currently active group code. If the group already has players, I want to be asked to confirm that I want to overwrite them, so I don't lose data accidentally.

## Feedback & State Management

-   **US14: Visual Feedback on Actions:** As a user, I want to see clear visual feedback (e.g., loading spinners, success messages, error alerts) after performing actions like saving, loading, or deleting, so that I understand the system's status.
-   **US14a: Indicate Dirty State:** As a user, I want the UI to clearly indicate when I have unsaved changes (e.g., by enabling or highlighting the "Save" button), so that I always know the status of my work.
-   **US15: Empty State Guidance:** As a new user, when no group is loaded, I want to see a clear message guiding me on how to get started (e.g., "Enter a group code to load a roster or start by adding players"). 

## Team Generation & Viewing

-   **US16: Navigate to Teams View:** As a user, I want to be able to switch between the "Players" and "Teams" tabs to manage my roster and view generated teams.
-   **US17: Generate Balanced Teams:** As a user on the "Players" tab, I want to click a "Generate Teams" button that uses only the players marked as *attending* to create two balanced teams based on skill level and position (forward/defense).
-   **US18: View Team Rosters and Stats:** As a user on the "Teams" tab, I want to see the generated teams, including the player breakdown for forwards and defense, and view statistics for each team (e.g., average skill, total skill, player counts).
-   **US19: Regenerate Teams:** As a user on the "Teams" tab, I want a "Regenerate" button that re-runs the team generation algorithm to get a new set of balanced teams.
-   **US20: Customize Team Names:** As a user, I want to be able to edit the names of the generated teams (e.g., from "Red" and "White" to custom names).
-   **US21: Capture Teams as Image:** As a user on the "Teams" tab, I want a button to capture the team rosters as an image and copy it to my clipboard for easy sharing.
-   **US22: Empty State for Teams View:** As a user who navigates to the "Teams" tab before generating teams, I want to see a message guiding me to the "Players" tab to generate them. 