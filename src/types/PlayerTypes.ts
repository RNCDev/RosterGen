// types/PlayerTypes.ts
export type Player = {
    id: number;
    first_name: string;
    last_name: string;
    skill: number;
    is_defense: boolean;
    is_attending: boolean;
    group_code: string;
};

export type Team = {
    forwards: Player[];
    defensemen: Player[];
    group_code?: string;
};

export type Teams = {
    red: Team;
    white: Team;
};

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
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
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