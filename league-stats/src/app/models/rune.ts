export interface DragonRuneDto {
    id: number;
    key: string;
    icon: string;
    name: string;
    shortDesc: string;
    longDesc: string;
}

export interface DragonRuneSlotDto {
    runes: DragonRuneDto[];
}

export interface DragonRuneTreeDto {
    id: number;
    key: string;
    icon: string;
    name: string;
    slots: DragonRuneSlotDto[];
}

export type RunesDto = DragonRuneTreeDto[];