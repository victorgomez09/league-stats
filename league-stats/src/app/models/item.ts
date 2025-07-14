export interface DragonItemDto {
    name: string;
    description: string;
    plaintext?: string;
    image: {
        full: string;
        sprite: string;
        group: string;
        x: number;
        y: number;
        w: number;
        h: number;
    };
    gold: {
        base: number;
        purchasable: boolean;
        total: number;
        sell: number;
    };
    stats?: Record<string, number>;
}

export type ItemsDto = Record<string, DragonItemDto>;