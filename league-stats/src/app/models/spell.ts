export interface DragonSpellDto {
    id: string;
    name: string;
    description: string;
    key: string;
    image: {
        full: string;
        sprite: string;
        group: string;
        x: number;
        y: number;
        w: number;
        h: number;
    };
}

export type SpellsDto = Record<string, DragonSpellDto>;