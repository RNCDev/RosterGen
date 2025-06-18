# App Refactor Plan

This document tracks the major refactoring of the RosterGen application.

## Goals

-   Rebuild the core application logic using a more robust state management pattern (`useGroupManager` hook).
-   Re-implement UI components to be more modular and reusable.
-   Ensure all user stories are met with the new architecture.

## Component Strategy

-   **Old Components:** Rename existing components (e.g., `PlayersView.tsx` to `PlayersView-old.tsx`) to serve as a reference.
-   **New Components:** Create new components from scratch, following the new architecture.
-   **UI Library:** Introduce a `src/app/components/ui` directory for generic, reusable components like `Dialog.tsx` and `Button.tsx`.

## Refactor Checklist

-   [x] **State Management:** Create the central `useGroupManager.ts` hook.
-   [x] **Header Component:** Rebuild `Header.tsx` to use the new hook and provide clear "Save/Saved" status.
-   [x] **PlayersView Component:** Implement the full `PlayersView.tsx` including:
    -   [x] Action bar for adding players and uploading CSV.
    -   [x] Player list with sorting and filtering.
    -   [x] Empty and loading states.
-   [x] **EditableRow Component:** Create a new `EditableRow.tsx` to handle inline and bulk editing seamlessly.
-   [x] **Dialogs:** Re-implement `AddPlayerDialog.tsx` and `UploadCsvDialog.tsx` to work with the new state management.
-   [x] **API Endpoints:** Refactor all backend API routes (`/api/players`, `/api/groups`) to be robust, use transactions, and align with the new front-end logic.

## Completion

All planned refactoring tasks are complete. The application should now be fully functional and align with the defined user stories.
