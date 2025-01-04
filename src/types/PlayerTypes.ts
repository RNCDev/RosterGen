//PLayerTypes
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

export type ErrorAlertProps = {
    message: string | null;
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