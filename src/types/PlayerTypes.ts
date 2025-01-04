// types/PlayerTypes.ts
// Base interfaces for database and frontend
export interface PlayerDB {
    id: number;
    first_name: string;
    last_name: string;
    skill: number;
    is_defense: boolean;
    is_attending: boolean;
    group_code: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface PlayerInput {
    firstName: string;
    lastName: string;
    skill: number;
    isDefense: boolean;
    isAttending: boolean;
    groupCode: string;
}

// Type aliases for clarity
export type Player = PlayerDB; // Use the database format in components
export type Team = {
    forwards: Player[];
    defensemen: Player[];
};

export type Teams = {
    red: Team;
    white: Team;
};

// Transformation functions
export const toDatabase = (player: PlayerInput): Omit<PlayerDB, 'id' | 'created_at' | 'updated_at'> => ({
    first_name: player.firstName,
    last_name: player.lastName,
    skill: player.skill,
    is_defense: player.isDefense,
    is_attending: player.isAttending,
    group_code: player.groupCode
});

export const fromDatabase = (player: PlayerDB): PlayerInput => ({
    firstName: player.first_name,
    lastName: player.last_name,
    skill: player.skill,
    isDefense: player.is_defense,
    isAttending: player.is_attending,
    groupCode: player.group_code
});

// Component Props
export type PlayersViewProps = {
    players: Player[];
    loading: boolean;
    groupCode: string;
    onUpdatePlayer?: (player: Player) => Promise<void>;
    handleDeletePlayer?: (id: number) => Promise<void>;
};

export type TeamsViewProps = {
    teams: Teams;
    hasPlayers: boolean;
    groupCode: string;
};

export type EditableRowProps = {
    player: Player;
    onSave: (updatedPlayer: Player) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
};

export type HeaderProps = {
    activeTab: 'players' | 'roster';
    setActiveTab: (tab: 'players' | 'roster') => void;
    groupCode: string;
    onGroupCodeChange: (groupCode: string) => void;
    onRetrieveGroupCode: () => Promise<void>;
    onSaveGroupCode: () => Promise<void>;
    onCancelGroupCode: () => void;
    onDeleteGroup: () => Promise<void>;
};

export type ActionBarProps = {
    onAddPlayer: () => void;
    onUploadClick: () => void;
    onGenerateTeams?: () => void;
    showGenerateTeams?: boolean;
    disabled?: boolean;
};

export type DialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
};

export type ErrorAlertProps = {
    message: string | null;
};