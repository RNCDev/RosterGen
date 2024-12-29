export type Player = {
    id: number;
    first_name: string;
    last_name: string;
    skill: number;
    is_defense: boolean;
    is_attending: boolean;
};

export type Team = {
    forwards: Player[];
    defensemen: Player[];
};

export type Teams = {
    red: Team;
    white: Team;
};

// components/PlayersView.js props
export type PlayersViewProps = {
    players: Player[];
    loading: boolean;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeletePlayer?: (id: number) => Promise<void>;  // Updated to Promise<void>
    onTeamsGenerated?: (teams: Teams) => void;
    onUpdatePlayer?: (player: Player) => Promise<void>;
};

// components/TeamsView.js props
export type TeamsViewProps = {
    teams: Teams;
    hasPlayers: boolean;
};

// components/EditableRow.js props
export type EditableRowProps = {
    player: Player;
    onSave: (updatedPlayer: Player) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
};

// components/Sidebar.js props
export type SidebarProps = {
    activeTab: 'players' | 'roster';
    setActiveTab: (tab: 'players' | 'roster') => void;
};

// components/ErrorAlert.js props
export type ErrorAlertProps = {
    message: string | null;
};

// components/TeamGenerator.js props
export type TeamGeneratorProps = {
    players: Player[];
    onTeamsGenerated: (teams: Teams) => void;
};