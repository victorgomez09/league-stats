import { TRPCError } from "@trpc/server";
import { cachedChampions, getChampions, kda } from "./champions-api";
import { DataDragonSummonerSpell, DataDragonItem, DataDragonRuneTree, Account, Summoner, RankedInfo, Match, MatchParticipant, Champion, ChampionsResponse, Mastery, GameNormal, GameArena, Game } from "./types";
import { RiotGameSchema, RiotGameType } from "./types/riot.type";
import { validateGameType } from "./validators/game-type.validator";
import { augmentsData } from "./data/arguments";
import { RuneGroup, RunePerk } from './types/riot.type'
import z from "zod";

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const PLATFORM_URL = 'https://euw1.api.riotgames.com';
const REGIONAL_URL = 'https://europe.api.riotgames.com';

export type SummonerSpellsData = Record<string, DataDragonSummonerSpell>;
export type ItemsData = Record<string, DataDragonItem>;
export type RunesData = DataDragonRuneTree[];

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 50;

type RuneGroupType = z.infer<typeof RuneGroup>
type RunePerkType = z.infer<typeof RunePerk>

const runeGroups: Record<RuneGroupType, string | null> = {
  0: null, // empty state - arena game mode
  8100: '7200_domination',
  8000: '7201_precision',
  8200: '7202_sorcery',
  8300: '7203_whimsy',
  8400: '7204_resolve',
}

const runePerks: Record<RunePerkType, string | null> = {
  0: null, // empty state - arena game mode
  8005: 'presstheattack',
  8008: 'lethaltempo', //'temp'
  8010: 'conqueror',
  8009: null,
  8014: null,
  8017: null,
  8021: 'fleetfootwork',
  8105: null,
  8106: null,
  8112: 'electrocute',
  8120: null,
  8124: 'predator',
  8128: 'darkharvest',
  8126: null,
  8134: null,
  8135: null,
  8136: null,
  8138: null,
  8139: null,
  8143: null,
  8210: null,
  8214: 'summonaery',
  8224: null,
  8226: null,
  8229: 'arcanecomet',
  8230: 'phaserush',
  8232: null,
  8233: null,
  8234: null,
  8236: null,
  8237: null,
  8242: null,
  8275: null,
  8299: null,
  8304: null,
  8306: null,
  8313: null,
  8316: null,
  8321: null,
  8345: null,
  8347: null,
  8351: 'glacialaugment',
  8352: null,
  8360: 'unsealedspellbook',
  8369: 'firststrike',
  8401: null,
  8410: null,
  8429: null,
  8437: 'graspoftheundying',
  8439: 'veteranaftershock',
  8444: null,
  8446: null,
  8451: null,
  8453: null,
  8463: null,
  8465: 'guardian',
  8473: null,
  9101: null,
  9103: null,
  9104: null,
  9105: null,
  9111: null,
  9923: 'hailofblades',
}

export function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'PLAYER_NOT_FOUND': 'Player not found. Please check if the name/Riot ID is correct.',
    'API_KEY_EXPIRED': 'API key issue. Please check if your Personal API key is active.',
    'API_KEY_INVALID': 'API key is invalid. Please check your configuration.',
    'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a few seconds and try again.',
    'SUMMONER_DATA_INCOMPLETE': 'Incomplete summoner data. Please try again or contact support.',
    'PUUID_DECRYPTION_ERROR': 'PUUID decryption issue. Some data may not be available.',
  };

  if (errorCode.startsWith('API_ERROR_')) {
    const statusCode = errorCode.replace('API_ERROR_', '');
    return `Riot API error (${statusCode}). Please try again later.`;
  }

  return errorMessages[errorCode] || 'Unknown error. Please try again.';
}

async function makeRiotRequest(url: string) {
  if (!RIOT_API_KEY) {
    throw new Error('Riot API key not configured');
  }

  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }

  lastRequestTime = Date.now();


  try {
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    });


    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('PLAYER_NOT_FOUND');
      }
      if (response.status === 403) {
        throw new Error('API_KEY_EXPIRED');
      }
      if (response.status === 401) {
        throw new Error('API_KEY_INVALID');
      }
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.status?.message?.includes('Exception decrypting')) {
          throw new Error('PUUID_DECRYPTION_ERROR');
        }
        throw new Error('BAD_REQUEST');
      }
      if (response.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      }
      throw new Error(`API_ERROR_${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Connection error with Riot API');
    }
    throw error;
  }
}

export async function getAccountByRiotId(gameName: string, tagLine: string): Promise<Account> {
  const encodedGameName = encodeURIComponent(gameName);
  const encodedTagLine = encodeURIComponent(tagLine);
  const url = `${REGIONAL_URL}/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`;
  return makeRiotRequest(url);
}

export async function getSummonerByName(summonerName: string): Promise<Summoner> {
  const encodedName = encodeURIComponent(summonerName);
  const url = `${PLATFORM_URL}/lol/summoner/v4/summoners/by-name/${encodedName}`;
  return makeRiotRequest(url);
}

export async function getSummonerByPuuid(puuid: string, gameName?: string): Promise<Summoner | null> {

  try {
    const url = `${PLATFORM_URL}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    console.log('url', url)
    const data = await makeRiotRequest(url);


    return {
      puuid: data.puuid || puuid,
      id: data.id || null,
      accountId: data.accountId || null,
      name: gameName || data.name || "Name obtained via Riot ID",
      profileIconId: data.profileIconId || 0,
      revisionDate: data.revisionDate || Date.now(),
      summonerLevel: data.summonerLevel || 0
    };
  } catch {

    return {
      puuid: puuid,
      id: null,
      accountId: null,
      name: gameName || "Name obtained via Riot ID",
      profileIconId: 0,
      revisionDate: Date.now(),
      summonerLevel: 0
    };
  }
}

export async function getRankedInfo(summonerId: string | null): Promise<RankedInfo[]> {
  if (!summonerId) {
    return [];
  }

  const url = `${PLATFORM_URL}/lol/league/v4/entries/by-summoner/${summonerId}`;
  return makeRiotRequest(url);
}

export async function getRankedInfoByPuuid(puuid: string): Promise<RankedInfo[]> {
  const url = `${PLATFORM_URL}/lol/league/v4/entries/by-puuid/${puuid}`;
  return makeRiotRequest(url);
}

export async function getMatchHistory(puuid: string, count: number = 5, start: number = 0): Promise<string[]> {
  const url = `${REGIONAL_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
  return makeRiotRequest(url);
}

export async function getMatchHistoryDetails(puuid: string, count: number = 10, start: number = 0): Promise<(GameNormal | GameArena)[]> {
  try {
    const url = `${REGIONAL_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}`;
    const gamesIds: string[] = await makeRiotRequest(url);
    console.log('games', gamesIds)
    const games: RiotGameType[] = []
    gamesIds.forEach(async gameId => {
      games.push(await getMatchDetails(gameId))
    })

    const filteredGames = games.filter(game => game.info.queueId !== 1810 && game.info.queueId !== 1820)
    const result = z.array(RiotGameSchema).safeParse(filteredGames)

    if (!result.success) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: `Error parsing game data: ${JSON.stringify(result.error.errors)}` })
    }

    return result.data.map(game => formatGame(game, puuid))
  } catch (error) {
    console.log('error', error)
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Problem with Riot Games game endpoint' })
  }
}

export async function getMatchDetails(matchId: string): Promise<RiotGameType> {
  const url = `${REGIONAL_URL}/lol/match/v5/matches/${matchId}`;
  return makeRiotRequest(url);
}

export function getProfileIconUrl(iconId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${iconId}.png`;
}

export function getRankedEmblemUrl(tier: string): string {
  const formattedTier = tier.toLowerCase();

  const tierUrls: { [key: string]: string } = {
    'iron': 'https://static.bigbrain.gg/assets/lol/ranks/s13/iron.png',
    'bronze': 'https://static.bigbrain.gg/assets/lol/ranks/s13/bronze.png',
    'silver': 'https://static.bigbrain.gg/assets/lol/ranks/s13/silver.png',
    'gold': 'https://static.bigbrain.gg/assets/lol/ranks/s13/gold.png',
    'platinum': 'https://static.bigbrain.gg/assets/lol/ranks/s13/platinum.png',
    'emerald': 'https://static.bigbrain.gg/assets/lol/ranks/s13/emerald.png',
    'diamond': 'https://static.bigbrain.gg/assets/lol/ranks/s13/diamond.png',
    'master': 'https://static.bigbrain.gg/assets/lol/ranks/s13/master.png',
    'grandmaster': 'https://static.bigbrain.gg/assets/lol/ranks/s13/grandmaster.png',
    'challenger': 'https://static.bigbrain.gg/assets/lol/ranks/s13/challenger.png'
  };

  return tierUrls[formattedTier] || tierUrls['iron'];
}

export function formatGameDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

export function calculateKDA(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) {
    return 'Perfect';
  }
  return ((kills + assists) / deaths).toFixed(2);
}

export function getItemImageUrl(itemId: number): string {
  if (itemId === 0) return '';
  return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/item/${itemId}.png`;
}

export function getSummonerSpellImageUrl(spellId: number): string {
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

export const getSummonerMastery = async (puuid: string, masteriesLimit: number = 10) => {
  const url = `${PLATFORM_URL}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`;
  // return makeRiotRequest(url);
  const allMasteries = await makeRiotRequest(url);

  // This response cointains all (+140) champions, so we take the {masteriesLimit} first ones
  console.log(`Found ${allMasteries.length} masteries, returning ${masteriesLimit}`)

  // Slice result if exceeds the limit
  if ((masteriesLimit ?? 0) < allMasteries.length) {
    allMasteries.length = masteriesLimit
  }

  await getChampions()
  // return allMasteries.map(async (mastery: Mastery) => ({
  //   name: String(await getChampions()[mastery.championId]),
  //   image: `https://ddragon.leagueoflegends.com/cdn/${cachedVersion}/img/champion/${await getChampions()[mastery.championId]}.png`,
  //   level: mastery.championLevel,
  //   points: mastery.championPoints,
  // }))
  // https://${server}.api.riotgames.com/
}

export function getChampionSquareUrl(championName: string): string {
  return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${championName}.png`;
}

export function formatCS(minions: number, neutralMinions: number): string {
  return `${minions + neutralMinions} CS`;
}

export function formatGold(gold: number): string {
  if (gold >= 1000) {
    return `${(gold / 1000).toFixed(1)}k`;
  }
  return gold.toString();
}

export function getRuneImageUrl(runeId: number): string {
  const primaryCdn = 'https://static.bigbrain.gg/assets/lol/riot_static/15.11.1/img/small-perk-images';

  const runeMap: { [key: number]: string } = {
    8005: 'Styles/Precision/PressTheAttack/PressTheAttack.png',
    8008: 'Styles/Precision/PressTheAttack/PressTheAttack.png',
    8021: 'Styles/Precision/FleetFootwork/FleetFootwork.png',
    8010: 'Styles/Precision/Conqueror/Conqueror.png',
    8112: 'Styles/Domination/Electrocute/Electrocute.png',
    8124: 'Styles/Domination/Predator/Predator.png',
    8128: 'Styles/Domination/DarkHarvest/DarkHarvest.png',
    9923: 'Styles/Domination/HailOfBlades/HailOfBlades.png',
    8214: 'Styles/Sorcery/SummonAery/SummonAery.png',
    8229: 'Styles/Sorcery/ArcaneComet/ArcaneComet.png',
    8230: 'Styles/Sorcery/PhaseRush/PhaseRush.png',
    8437: 'Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
    8439: 'Styles/Resolve/Aftershock/Aftershock.png',
    8465: 'Styles/Resolve/Guardian/Guardian.png',
    8351: 'Styles/Inspiration/GlacialAugment/GlacialAugment.png',
    8360: 'Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
    8369: 'Styles/Inspiration/FirstStrike/FirstStrike.png'
  };

  const runePath = runeMap[runeId];
  if (runePath) {
    return `${primaryCdn}/${runePath}`;
  }

  return `${primaryCdn}/Styles/Precision/PressTheAttack/PressTheAttack.png`;
}

export function getRuneImageUrlWithFallback(runeId: number): { primary: string; fallback: string } {
  const primaryCdn = 'https://static.bigbrain.gg/assets/lol/riot_static/15.13.1/img/small-perk-images';
  const fallbackCdn = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images';

  const runeMap: { [key: number]: string } = {
    8005: 'Styles/Precision/PressTheAttack/PressTheAttack.png',
    8008: 'Styles/Precision/LethalTempo/LethalTempo.png', // Tentativa com nome original
    8021: 'Styles/Precision/FleetFootwork/FleetFootwork.png',
    8010: 'Styles/Precision/Conqueror/Conqueror.png',
    8112: 'Styles/Domination/Electrocute/Electrocute.png',
    8124: 'Styles/Domination/Predator/Predator.png',
    8128: 'Styles/Domination/DarkHarvest/DarkHarvest.png',
    9923: 'Styles/Domination/HailOfBlades/HailOfBlades.png',
    8214: 'Styles/Sorcery/SummonAery/SummonAery.png',
    8229: 'Styles/Sorcery/ArcaneComet/ArcaneComet.png',
    8230: 'Styles/Sorcery/PhaseRush/PhaseRush.png',
    8437: 'Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
    8439: 'Styles/Resolve/Aftershock/Aftershock.png',
    8465: 'Styles/Resolve/Guardian/Guardian.png',
    8351: 'Styles/Inspiration/GlacialAugment/GlacialAugment.png',
    8360: 'Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
    8369: 'Styles/Inspiration/FirstStrike/FirstStrike.png'
  };

  const fallbackRuneMap: { [key: number]: string } = {
    8005: 'styles/precision/presstheattack/presstheattack.png',
    8008: 'styles/precision/presstheattack/presstheattack.png',
    8021: 'styles/precision/fleetfootwork/fleetfootwork.png',
    8010: 'styles/precision/conqueror/conqueror.png',
    8112: 'styles/domination/electrocute/electrocute.png',
    8124: 'styles/domination/predator/predator.png',
    8128: 'styles/domination/darkharvest/darkharvest.png',
    9923: 'styles/domination/hailofblades/hailofblades.png',
    8214: 'styles/sorcery/summonaery/summonaery.png',
    8229: 'styles/sorcery/arcanecomet/arcanecomet.png',
    8230: 'styles/sorcery/phaserush/phaserush.png',
    8437: 'styles/resolve/graspoftheundying/graspoftheundying.png',
    8439: 'styles/resolve/aftershock/aftershock.png',
    8465: 'styles/resolve/guardian/guardian.png',
    8351: 'styles/inspiration/glacialaugment/glacialaugment.png',
    8360: 'styles/inspiration/unsealedspellbook/unsealedspellbook.png',
    8369: 'styles/inspiration/firststrike/firststrike.png'
  };

  const runePath = runeMap[runeId];
  const fallbackPath = fallbackRuneMap[runeId];
  const defaultPath = 'Styles/Precision/PressTheAttack/PressTheAttack.png';
  const defaultFallbackPath = 'styles/precision/presstheattack/presstheattack.png';

  return {
    primary: `${primaryCdn}/${runePath || defaultPath}`,
    fallback: `${fallbackCdn}/${fallbackPath || defaultFallbackPath}`
  };
}

export function getRuneStyleImageUrl(styleId: number): string {
  const styleMap: { [key: number]: string } = {
    8000: 'Styles/7201_Precision.png',
    8100: 'Styles/7200_Domination.png',
    8200: 'Styles/7202_Sorcery.png',
    8300: 'Styles/7203_Whimsy.png',
    8400: 'Styles/7204_Resolve.png'
  };

  const stylePath = styleMap[styleId];
  if (stylePath) {
    return `https://static.bigbrain.gg/assets/lol/riot_static/15.11.1/img/perk-images/${stylePath}`;
  }

  return `https://static.bigbrain.gg/assets/lol/riot_static/15.11.1/img/perk-images/Styles/7201_Precision.png`;
}

export async function getRuneInfo(runeId: number): Promise<{ name: string; description: string }> {
  try {
    const runes = await getRunesData();

    for (const tree of runes) {
      for (const slot of tree.slots || []) {
        for (const rune of slot.runes || []) {
          if (rune.id === runeId) {
            const cleanDescription = rune.longDesc?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') ||
              rune.shortDesc?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') ||
              'No description available';

            return {
              name: rune.name,
              description: cleanDescription
            };
          }
        }
      }
    }

    return { name: 'Unknown Rune', description: 'No information available' };
  } catch {
    return { name: 'Unknown Rune', description: 'No information available' };
  }
}

export function getRuneStyleName(styleId: number): string {
  const styleNames: { [key: number]: string } = {
    8000: 'Precision',
    8100: 'Domination',
    8200: 'Sorcery',
    8300: 'Inspiration',
    8400: 'Resolve'
  };

  return styleNames[styleId] || 'Unknown Style';
}

export function getPrimaryRune(participant: MatchParticipant): number {
  return participant.perks?.styles?.[0]?.selections?.[0]?.perk || 0;
}

export function getSecondaryRuneStyle(participant: MatchParticipant): number {
  return participant.perks?.styles?.[1]?.style || 0;
}

export function getSecondaryRune(participant: MatchParticipant): number {
  return participant.perks?.styles?.[1]?.selections?.[0]?.perk || 0;
}

const CACHE_DURATION = 1000 * 60 * 60;
let cachedSummonerSpells: SummonerSpellsData | null = null;
let cachedItems: ItemsData | null = null;
let cachedRunes: RunesData | null = null;
let cachedVersion: string | null = null;
let spellsCacheTime: number = 0;
let itemsCacheTime: number = 0;
let runesCacheTime: number = 0;
let versionCacheTime: number = 0;

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

export async function getSummonerSpellsData(): Promise<SummonerSpellsData> {
  const now = Date.now();

  if (cachedSummonerSpells && (now - spellsCacheTime) < CACHE_DURATION) {
    return cachedSummonerSpells;
  }

  try {
    const version = await getLatestVersion();
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`);

    if (!response.ok) {
      throw new Error('Failed to fetch summoner spells');
    }

    const data = await response.json();
    cachedSummonerSpells = data.data;
    spellsCacheTime = now;

    return cachedSummonerSpells;
  } catch {
    return {};
  }
}

export async function getItemsData(): Promise<ItemsData> {
  const now = Date.now();

  if (cachedItems && (now - itemsCacheTime) < CACHE_DURATION) {
    return cachedItems;
  }

  try {
    const version = await getLatestVersion();
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`);

    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }

    const data = await response.json();
    cachedItems = data.data;
    itemsCacheTime = now;

    return cachedItems;
  } catch {
    return {};
  }
}

export async function getSummonerSpellName(spellId: number): Promise<string> {
  try {
    const spells = await getSummonerSpellsData();

    for (const spellKey in spells) {
      const spell = spells[spellKey];
      if (spell.key === spellId.toString()) {
        return spell.name;
      }
    }

    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

export async function getRunesData(): Promise<RunesData> {
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

export async function getItemInfo(itemId: number): Promise<{ name: string; description: string }> {
  try {
    const items = await getItemsData();
    const item = items[itemId.toString()];

    if (item) {
      const cleanDescription = item.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');

      return {
        name: item.name,
        description: cleanDescription
      };
    }

    return { name: 'Unknown Item', description: 'Information not available' };
  } catch {
    return { name: 'Unknown Item', description: 'Information not available' };
  }
}

/**
    * ## Format Game
    * Format the raw data of a game to our custom schema
    * @param rawGame The raw data of the game as Riot returns
    * @returns The info parsed
    */
export function formatGame(rawGame: RiotGameType, puuid: string): GameNormal | GameArena {
  const idx = rawGame.metadata.participants.indexOf(puuid)
  const participant = rawGame.info.participants[idx]
  const [initialTeamMate, lastTeamMate] = idx > 4 ? [5, 9] : [0, 4]
  const perks = participant?.perks.styles[0]

  if (!participant || !perks) {
    this.LOGGER.error(`Error formatting game: ${rawGame.metadata.matchId}`)
    throw new TRPCError({ code: "BAD_REQUEST", message: 'Problem with Riot Games game endpoint' })
  }

  const teamKills: number = rawGame.info.participants
    .slice(initialTeamMate, lastTeamMate + 1)
    .map(p => p.kills)
    .reduce((acc, val) => acc + val)

  const base_game: Game = {
    matchId: rawGame.metadata.matchId,
    win: participant.win,
    participantNumber: idx,
    gameCreation: rawGame.info.gameCreation,
    gameDuration: rawGame.info.gameDuration,
    gameMode: validateGameType(rawGame.info.queueId),
    teamPosition: participant.teamPosition,
    isEarlySurrender: participant.gameEndedInEarlySurrender,
    visionScore: participant.visionScore,
    champLevel: participant.champLevel,
    championName: participant.championName,
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    doubleKills: participant.doubleKills,
    tripleKills: participant.tripleKills,
    quadraKills: participant.quadraKills,
    pentaKills: participant.pentaKills,
    kda: kda(participant.kills, participant.deaths, participant.assists),
    cs: participant.neutralMinionsKilled + participant.totalMinionsKilled,
    gold: participant.goldEarned,
    ward: participant.item6 || 2052,
    killParticipation: (participant.kills + participant.assists) / teamKills,
    damageDealt: participant.totalDamageDealtToChampions,
    damageTaken: participant.totalDamageTaken,
    items: [participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5],
    participants: rawGame.info.participants.map(participant => ({
      summonerName: participant.summonerName,
      championName: participant.championName,
      riotIdGameName: participant.riotIdGameName ?? participant.summonerName,
      riotIdTagLine: String(participant.riotIdTagline),
    })),
  }

  if (rawGame.info.queueId === 1700) {
    // RETURN ARENA GAME
    return {
      ...base_game,
      augments: [participant.playerAugment1, participant.playerAugment2, participant.playerAugment3, participant.playerAugment4]
        .filter(Boolean) //Remove 0s
        .map(id => {
          const augment = augmentsData[id ?? 0]

          if (!augment) {
            this.LOGGER.error(`Missing AugmentID ${id} in augmentsData`)
            throw new TRPCError({ code: 'BAD_REQUEST', message: 'Problem with Riot Games game endpoint' })
          }
          return augment
        }),
      placement: participant.placement ?? 0,
      subteamPlacement: participant.subteamPlacement ?? 0,
    }
  }

  // RETURN NORMAL (NO ARENA) GAME
  return {
    ...base_game,
    spells: [participant.summoner1Id, participant.summoner2Id],
    perks: {
      primary: runePerkUrl(participant.perks.styles[0]!.style, participant.perks.styles[0]!.selections[0]!.perk),
      secondary: runeGroupUrl(participant.perks.styles[1]!.style),
    },
  }
}

/**
 * @param runeGroupId The rune group ID
 * @returns The image URL for the Rune Group
 */
export const runeGroupUrl = (runeGroupId: RuneGroupType): string | null =>
  !runeGroups[runeGroupId]
    ? null
    : `https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/${runeGroups[runeGroupId]}.png`

/**
 * @param runeId The rune group ID
 * @param perkId The rune perk ID
 * @returns The image URL for the Rune Perk
 */
export function runePerkUrl(runeGroupId: RuneGroupType, runePerkId: RunePerkType): string | null {
  // The Rune Group needs this parse
  const group = runeGroups[runeGroupId]
  const perk = runePerks[runePerkId]

  // Arena mode -> no runes -> no image
  if (!group || !perk) {
    return null
  }

  const runeGroup = runeGroupId === 8300 ? 'inspiration' : group.split('_')[1]

  // There is a special case for Lethal Tempo
  const exception = runePerkId === 8008 ? 'temp' : ''

  return `https://raw.communitydragon.org/pbe/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/${runeGroup}/${perk}/${perk}${exception}.png`

  //return `https://ddragon.canisback.com/img/perk-images/Styles/${runeGroup}/${perk}/${perk}${exception}.png`??
}