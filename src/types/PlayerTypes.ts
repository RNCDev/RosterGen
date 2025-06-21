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
    is_active: boolean;
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

// Event types
export interface EventDB {
    id: number;
    name: string;
    description?: string;
    event_date: Date;
    event_time?: string;
    location?: string;
    group_code: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface EventInput {
    name: string;
    description?: string;
    event_date: Date;
    event_time?: string;
    location?: string;
    group_code: string;
    is_active?: boolean;
}

export interface EventForm {
    name: string;
    description: string;
    date: string; // YYYY-MM-DD format
    time: string; // HH:MM format
    location: string;
}

// Attendance types
export interface AttendanceDB {
    id: number;
    player_id: number;
    event_id: number;
    is_attending: boolean;
    response_date: Date;
    notes?: string;
}

export interface AttendanceInput {
    player_id: number;
    event_id: number;
    is_attending: boolean;
    notes?: string;
}

// Combined types for UI
export interface PlayerWithAttendance extends PlayerDB {
    attendance?: AttendanceDB;
    is_attending_event?: boolean; // Computed field for specific event
}

export interface EventWithStats extends EventDB {
    total_players: number;
    attending_count: number;
    not_attending_count: number;
    no_response_count: number;
    attendance_rate: number;
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
    event_id?: number; // New field for event-specific teams
    generated_at?: Date; // New field
};

// Team generation types (updated)
export interface EventTeamGeneration {
    event_id: number;
    teams: Teams;
    generated_at: Date;
}

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

// Event transformation functions
export const eventToForm = (event: EventDB): EventForm => ({
    name: event.name,
    description: event.description || '',
    date: event.event_date.toISOString().split('T')[0],
    time: event.event_time || '',
    location: event.location || ''
});

export const formToEventInput = (formData: EventForm, groupCode: string): EventInput => ({
    name: formData.name,
    description: formData.description || undefined,
    event_date: new Date(formData.date),
    event_time: formData.time || undefined,
    location: formData.location || undefined,
    group_code: groupCode,
    is_active: true
});