import { calculateKDA } from './_old.riot-server-api';
import { ChampionsResponse, ChampionDetailResponse, Champion, ChampionDetail, Match, Summoner } from './types';
import { RiotGameType } from './types/riot.type';

const DDragon_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn';
const VERSIONS_API = 'https://ddragon.leagueoflegends.com/api/versions.json';

export let cachedVersion: string | null = null;
let versionCacheTime: number = 0;
export let cachedChampions: Champion[] | null = null;
let championsCacheTime: number = 0;
const imageUrlCache = new Map<string, string>();
const CACHE_DURATION = 3600000;

async function getLatestVersion(): Promise<string> {
  const now = Date.now();

  if (cachedVersion && (now - versionCacheTime) < CACHE_DURATION) {
    return cachedVersion;
  }

  try {
    const response = await fetch(VERSIONS_API, {
      ...(typeof window === 'undefined' ? { next: { revalidate: 3600 } } : {})
    });

    if (!response.ok) {
      throw new Error('Failed to fetch versions');
    }

    const versions: string[] = await response.json();
    const latestVersion = versions[0];

    cachedVersion = latestVersion;
    versionCacheTime = now;

    return latestVersion;
  } catch {
    return '14.24.1';
  }
}

export async function getChampions(): Promise<Champion[]> {
  const now = Date.now();

  if (cachedChampions && (now - championsCacheTime) < CACHE_DURATION) {
    return cachedChampions;
  }

  try {
    console.log(`${DDragon_BASE_URL}/15.13.1/data/en_US/champion.json`)
    const version = await getLatestVersion();
    const response = await fetch(
      `${DDragon_BASE_URL}/${version}/data/en_US/champion.json`,
      {
        ...(typeof window === 'undefined' ? { next: { revalidate: 3600 } } : {})
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch champions');
    }

    const data: ChampionsResponse = await response.json();
    const champions = Object.values(data.data);

    cachedChampions = champions;
    championsCacheTime = now;

    return champions;
  } catch {
    return cachedChampions || [];
  }
}

export async function getChampionById(id: string): Promise<ChampionDetail | null> {
  try {
    const version = await getLatestVersion();
    const response = await fetch(
      `${DDragon_BASE_URL}/${version}/data/en_US/champion/${id}.json`,
      {
        ...(typeof window === 'undefined' ? { next: { revalidate: 3600 } } : {})
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch champion ${id}`);
    }

    const data: ChampionDetailResponse = await response.json();
    return data.data[id] || null;
  } catch {
    return null;
  }
}

export async function getChampionByKey(key: string): Promise<ChampionDetail | null> {
  try {
    const champions = await getChampions();
    const champion = champions.find(c => c.key === key);

    if (!champion) {
      return null;
    }

    return await getChampionById(champion.id);
  } catch {
    return null;
  }
}

export async function getChampionImageUrl(imageName: string): Promise<string> {
  if (imageUrlCache.has(imageName)) {
    return imageUrlCache.get(imageName)!;
  }

  const version = await getLatestVersion();
  const url = `${DDragon_BASE_URL}/${version}/img/champion/${imageName}`;
  imageUrlCache.set(imageName, url);
  return url;
}

export async function getSpellImageUrl(imageName: string): Promise<string> {
  const version = await getLatestVersion();
  return `${DDragon_BASE_URL}/${version}/img/spell/${imageName}`;
}

export async function getPassiveImageUrl(imageName: string): Promise<string> {
  const version = await getLatestVersion();
  return `${DDragon_BASE_URL}/${version}/img/passive/${imageName}`;
}

export function getChampionSplashUrl(championId: string, skinNum: number = 0): string {
  return `${DDragon_BASE_URL}/img/champion/splash/${championId}_${skinNum}.jpg`;
}

export function getChampionLoadingUrl(championId: string, skinNum: number = 0): string {
  return `${DDragon_BASE_URL}/img/champion/loading/${championId}_${skinNum}.jpg`;
}

export async function getCurrentVersion(): Promise<string> {
  return await getLatestVersion();
}

/**
     * ## Builds the champs stats based on the games
     * From the games data, it allows to build the stats for each champ.
     *
     * @param games The games to build the stats from
     * @returns The champs stats
     */
export async function getStatsByChamp(summoner: Summoner, games: RiotGameType[]) {
  // Index to accumulate the stats
  const indexByName: Record<string, any> = {}

  // Calculate the average of two properties based on the number of games
  const avg = (a: number, b: number, num_of_games: number) => parseFloat(((a * num_of_games + b) / (num_of_games + 1)).toFixed(2))

  // Iterate all games
  for (const game of games) {
    let totalKills: number = 0;
    game.info.participants.slice(0, 5).map((g) => totalKills = totalKills + g.kills)
    const playerData = game.info.participants.find(p => p.puuid === summoner.puuid);
    const key = playerData.championName
    const perMin = (x: number) => Number(((x * 60) / game.info.gameDuration).toFixed(1))
    const champ = indexByName[key]

    // 1. Champ not indexed yet -> create it
    if (!champ) {
      indexByName[key] = {
        championName: key,
        games: 1,
        wins: playerData.win ? 1 : 0,
        kda: calculateKDA(playerData.kills, playerData.deaths, playerData.assists),
        goldMin: perMin(playerData.goldEarned),
        csMin: perMin((playerData.totalMinionsKilled || 0) + (playerData.neutralMinionsKilled || 0)),
        kills: playerData.kills,
        totalKills: totalKills,
        killParticipation: Number((((playerData.kills + playerData.assists) / totalKills) * 100).toFixed(2)),
      }
      continue
    }

    // 2. Champ already indexed -> update it
    champ.kda = avg(champ.kda, Number(calculateKDA(playerData.kills, playerData.deaths, playerData.assists)), champ.games)
    champ.wins += playerData.win ? 1 : 0
    champ.goldMin = avg(champ.goldMin, perMin(playerData.goldEarned), champ.games)
    champ.csMin = avg(champ.csMin, perMin((playerData.totalMinionsKilled || 0) + (playerData.neutralMinionsKilled || 0)), champ.games)
    // champ.visionMin = avg(champ.visionMin, perMin(game.visionScore), champ.games)
    // champ.killParticipation = avg(champ.killParticipation, game.killParticipation, champ.games)
    // champ.damageDealt = avg(champ.damageDealt, game.damageDealt, champ.games)
    // champ.damageTaken = avg(champ.damageTaken, game.damageTaken, champ.games)
    champ.kills = playerData.kills
    champ.totalKills = totalKills
    champ.killParticipation = Number((((playerData.kills + playerData.assists) / totalKills) * 100).toFixed(2))

    // This needs to be done after the kda calculation, because it depends on it
    champ.games += 1
  }

  // Then, convert the index to an array
  return Object.entries(indexByName)
    .map(([key, stats]) => stats)
    .sort((a, b) => b.games - a.games)
}

/**
 * ## Calculates the kda
 * (kills + assists) / deaths
 *
 * @param kills The number of kills
 * @param deaths The number of deaths
 * @param assists The number of assists
 * @returns The kda value
 */
export function kda(kills: number, deaths: number, assists: number) {
  return parseFloat((deaths ? (kills + assists) / deaths : kills + assists).toFixed(2))
}