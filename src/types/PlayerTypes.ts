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
    first_name: string;
    last_name: string;
    skill: number;
    is_defense: boolean;
    is_attending: boolean;
    group_code: string;
}

export interface FormPlayer {
    firstName: string;
    lastName: string;
    skill: number;
    defense: boolean;
    attending: boolean;
    groupCode: string;
}

// Type aliases for clarity
export type Player = PlayerDB; // Use the database format in components
export type Team = {
    forwards: Player[];
    defensemen: Player[];
    group_code?: string;
};

export type Teams = {
    red: Team;
    white: Team;
};

// Transformation functions
export const toDatabase = (formData: FormPlayer): PlayerInput => ({
    first_name: formData.firstName,
    last_name: formData.lastName,
    skill: formData.skill,
    is_defense: formData.defense,
    is_attending: formData.attending,
    group_code: formData.groupCode
});

export const fromDatabase = (player: PlayerDB): FormPlayer => ({
    firstName: player.first_name,
    lastName: player.last_name,
    skill: player.skill,
    defense: player.is_defense,
    attending: player.is_attending,
    groupCode: player.group_code
});