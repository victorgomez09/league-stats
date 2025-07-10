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

export type SpellsDto = Record<string, DragonSpellDto>;
export type ItemsDto = Record<string, DragonItemDto>;
export type RunesDto = DragonRuneTreeDto[];

const CACHE_DURATION = 1000 * 60 * 60;
let cachedSpells: SpellsDto | null = null;
let cachedRunes: RunesDto | null = null;
// let cachedItems: ItemsData | null = null;
let cachedVersion: string | null = null;
let spellsCacheTime: number = 0;
let runesCacheTime: number = 0;
// let itemsCacheTime: number = 0;
let versionCacheTime: number = 0;
const imageUrlCache = new Map<string, string>();

export async function getLatestVersion(): Promise<string> {
    const now = Date.now();

    if (cachedVersion && (now - versionCacheTime) < CACHE_DURATION) {
        return cachedVersion;
    }

    try {
        const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');

        if (!response.ok) {
            throw new Error('Failed to fetch versions');
        }

        const versions = await response.json();
        cachedVersion = versions[0];
        versionCacheTime = now;

        return cachedVersion;
    } catch {
        return '14.24.1';
    }
}

export async function getSpells(): Promise<SpellsDto> {
    const now = Date.now();

    if (cachedSpells && (now - spellsCacheTime) < CACHE_DURATION) {
        return cachedSpells;
    }

    try {
        const version = await getLatestVersion();
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`);

        if (!response.ok) {
            throw new Error('Failed to fetch summoner spells');
        }

        const data = await response.json();
        cachedSpells = data.data;
        spellsCacheTime = now;

        return cachedSpells;
    } catch {
        return {};
    }
}

export async function getRunes(): Promise<RunesDto> {
    const now = Date.now();

    if (cachedRunes && (now - runesCacheTime) < CACHE_DURATION) {
        return cachedRunes;
    }

    try {
        const version = await getLatestVersion();
        const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`);

        if (!response.ok) {
            throw new Error('Failed to fetch runes');
        }

        const data = await response.json();
        cachedRunes = data;
        runesCacheTime = now;

        return cachedRunes;
    } catch {
        return [];
    }
}

export async function getChampionImageUrl(imageName: string): Promise<string> {
    if (imageUrlCache.has(imageName)) {
        return imageUrlCache.get(imageName)!;
    }

    const version = await getLatestVersion();
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${imageName}`;
    imageUrlCache.set(imageName, url);

    return url;
}

export function getSpellImageUrl(spellId: number): string {
    const spellNames: { [key: number]: string } = {
        1: 'SummonerBoost',
        3: 'SummonerExhaust',
        4: 'SummonerFlash',
        6: 'SummonerHaste',
        7: 'SummonerHeal',
        11: 'SummonerSmite',
        12: 'SummonerTeleport',
        13: 'SummonerMana',
        14: 'SummonerDot',
        21: 'SummonerBarrier',
        32: 'SummonerSnowball'
    };

    const spellName = spellNames[spellId] || 'SummonerFlash';
    return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/spell/${spellName}.png`;
}