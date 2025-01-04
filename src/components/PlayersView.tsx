import { PlayerDB } from '@/types/PlayerTypes';

interface PlayersViewProps {
    players: PlayerDB[];
    loading: boolean;
    groupCode: string;
    onUpdatePlayer: (player: PlayerDB) => Promise<void>;
    handleDeletePlayer?: (id: number) => Promise<void>;
}

export default function PlayersView({
    players,
    loading,
    groupCode,
    onUpdatePlayer,
    handleDeletePlayer
}: PlayersViewProps) {
    const handleSave = async (updatedPlayer: PlayerDB) => {
        if (onUpdatePlayer) {
            await onUpdatePlayer(updatedPlayer);
        }
    };

    // ... rest of the component
} 