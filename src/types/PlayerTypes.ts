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

export type PlayersViewProps = {
    players: Player[];
    loading: boolean;
    groupCode: string;
    onGroupCodeChange: (groupCode: string) => void;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeletePlayer?: (id: number) => Promise<void>;
    onTeamsGenerated?: (teams: Teams) => void;
    onUpdatePlayer?: (player: Player) => Promise<void>;
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

export type SidebarProps = {
    activeTab: 'players' | 'roster';
    setActiveTab: (tab: 'players' | 'roster') => void;
    groupCode: string;
    onGroupCodeChange: (groupCode: string) => void;
};

export type ErrorAlertProps = {
    message: string | null;
};

export type TeamGeneratorProps = {
    players: Player[];
    groupCode: string;
    onTeamsGenerated: (teams: Teams) => void;
};

export type GroupSelectorProps = {
    currentGroup: string;
    onGroupChange: (groupCode: string) => void;
};