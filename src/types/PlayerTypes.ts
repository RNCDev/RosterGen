// types/PlayerTypes.js
export type Player = {
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
type PlayersViewProps = {
    players: Player[];
    loading: boolean;
    generateTeams: () => void;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

// components/TeamsView.js props
type TeamsViewProps = {
    teams: Teams;
    generateTeams: () => void;
    hasPlayers: boolean;
};

// components/Sidebar.js props
type SidebarProps = {
    activeTab: 'players' | 'roster';
    setActiveTab: (tab: 'players' | 'roster') => void;
};

// components/ErrorAlert.js props
type ErrorAlertProps = {
    message: string | null;
};