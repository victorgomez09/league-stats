import { z } from 'zod'

/**
 * Rune Group - the category of runes selected in each branch
 */
export const RuneGroup = z.union([
    z.literal(0), // none
    z.literal(8000), // domination
    z.literal(8100), // precision
    z.literal(8200), // sorcery
    z.literal(8300), // whimsy
    z.literal(8400), // resolve
])

/**
 * Rune Perk - the runes available to select
 */
export const RunePerk = z.union([
    z.literal(0), // none
    z.literal(8005),
    z.literal(8008),
    z.literal(8009),
    z.literal(8010),
    z.literal(8014),
    z.literal(8017),
    z.literal(8021),
    z.literal(8105),
    z.literal(8106),
    z.literal(8112),
    z.literal(8120),
    z.literal(8124),
    z.literal(8128),
    z.literal(8126),
    z.literal(8134),
    z.literal(8135),
    z.literal(8136),
    z.literal(8138),
    z.literal(8139),
    z.literal(8143),
    z.literal(8210),
    z.literal(8214),
    z.literal(8224),
    z.literal(8226),
    z.literal(8229),
    z.literal(8230),
    z.literal(8232),
    z.literal(8233),
    z.literal(8234),
    z.literal(8236),
    z.literal(8237),
    z.literal(8242),
    z.literal(8275),
    z.literal(8299),
    z.literal(8304),
    z.literal(8306),
    z.literal(8313),
    z.literal(8316),
    z.literal(8321),
    z.literal(8345),
    z.literal(8347),
    z.literal(8351),
    z.literal(8352),
    z.literal(8360),
    z.literal(8369),
    z.literal(8401),
    z.literal(8410),
    z.literal(8429),
    z.literal(8437),
    z.literal(8439),
    z.literal(8444),
    z.literal(8446),
    z.literal(8451),
    z.literal(8453),
    z.literal(8463),
    z.literal(8465),
    z.literal(8473),
    z.literal(9101),
    z.literal(9103),
    z.literal(9104),
    z.literal(9105),
    z.literal(9111),
    z.literal(9923),
])

/**
 * The rune selected
 */
export const RuneSelection = z.object({
    perk: RunePerk,
    var1: z.number(),
    var2: z.number(),
    var3: z.number(),
})

export const RiotParticipantSchema = z.object({
    allInPings: z.number(),
    assistMePings: z.number(),
    assists: z.number(),
    baitPings: z.number().optional(),
    baronKills: z.number(),
    basicPings: z.number(),
    bountyLevel: z.number(),
    champExperience: z.number(),
    champLevel: z.number(),
    championId: z.number(),
    championName: z.string(),
    championTransform: z.number(),
    commandPings: z.number(),
    consumablesPurchased: z.number(),
    damageDealtToBuildings: z.number(),
    damageDealtToObjectives: z.number(),
    damageDealtToTurrets: z.number(),
    damageSelfMitigated: z.number(),
    dangerPings: z.number(),
    deaths: z.number(),
    detectorWardsPlaced: z.number(),
    doubleKills: z.number(),
    dragonKills: z.number(),
    eligibleForProgression: z.boolean(),
    enemyMissingPings: z.number(),
    enemyVisionPings: z.number(),
    firstBloodAssist: z.boolean(),
    firstBloodKill: z.boolean(),
    firstTowerAssist: z.boolean(),
    firstTowerKill: z.boolean(),
    gameEndedInEarlySurrender: z.boolean(),
    gameEndedInSurrender: z.boolean(),
    getBackPings: z.number(),
    goldEarned: z.number(),
    goldSpent: z.number(),
    holdPings: z.number(),
    individualPosition: z.string(),
    inhibitorKills: z.number(),
    inhibitorTakedowns: z.number(),
    inhibitorsLost: z.number(),
    item0: z.number(),
    item1: z.number(),
    item2: z.number(),
    item3: z.number(),
    item4: z.number(),
    item5: z.number(),
    item6: z.number(),
    itemsPurchased: z.number(),
    killingSprees: z.number(),
    kills: z.number(),
    kda: z.number(),
    lane: z.string(),
    largestCriticalStrike: z.number(),
    largestKillingSpree: z.number(),
    largestMultiKill: z.number(),
    longestTimeSpentLiving: z.number(),
    magicDamageDealt: z.number(),
    magicDamageDealtToChampions: z.number(),
    magicDamageTaken: z.number(),
    needVisionPings: z.number(),
    neutralMinionsKilled: z.number(),
    nexusKills: z.number(),
    nexusLost: z.number(),
    nexusTakedowns: z.number(),
    objectivesStolen: z.number(),
    objectivesStolenAssists: z.number(),
    onMyWayPings: z.number(),
    participantId: z.number(),
    pentaKills: z.number(),
    physicalDamageDealt: z.number(),
    physicalDamageDealtToChampions: z.number(),
    physicalDamageTaken: z.number(),
    placement: z.number().optional(),
    // Arena specific - old games don't have this
    playerAugment1: z.number().optional(),
    playerAugment2: z.number().optional(),
    playerAugment3: z.number().optional(),
    playerAugment4: z.number().optional(),
    playerSubteamId: z.number().optional(),
    subteamPlacement: z.number().optional(),
    // - end Arena specific
    profileIcon: z.number(),
    pushPings: z.number(),
    puuid: z.string(),
    quadraKills: z.number(),
    riotIdGameName: z.string().optional(),
    riotIdTagline: z.string().optional(),
    role: z.string(),
    sightWardsBoughtInGame: z.number(),
    spell1Casts: z.number(),
    spell2Casts: z.number(),
    spell3Casts: z.number(),
    spell4Casts: z.number(),
    summoner1Casts: z.number(),
    summoner1Id: z.number(),
    summoner2Casts: z.number(),
    summoner2Id: z.number(),
    summonerId: z.string(),
    summonerLevel: z.number(),
    summonerName: z.string(),
    teamEarlySurrendered: z.boolean(),
    teamId: z.number(),
    teamPosition: z.string(),
    timeCCingOthers: z.number(),
    timePlayed: z.number(),
    // New props mot present in old games
    totalAllyJungleMinionsKilled: z.number().optional(),
    totalEnemyJungleMinionsKilled: z.number().optional(),
    totalDamageDealt: z.number(),
    totalDamageDealtToChampions: z.number(),
    totalDamageShieldedOnTeammates: z.number(),
    totalDamageTaken: z.number(),
    totalHeal: z.number(),
    totalHealsOnTeammates: z.number(),
    totalMinionsKilled: z.number(),
    totalTimeCCDealt: z.number(),
    totalTimeSpentDead: z.number(),
    totalUnitsHealed: z.number(),
    tripleKills: z.number(),
    trueDamageDealt: z.number(),
    trueDamageDealtToChampions: z.number(),
    trueDamageTaken: z.number(),
    turretKills: z.number(),
    turretTakedowns: z.number(),
    turretsLost: z.number(),
    unrealKills: z.number(),
    visionClearedPings: z.number(),
    visionScore: z.number(),
    visionWardsBoughtInGame: z.number(),
    wardsKilled: z.number(),
    wardsPlaced: z.number(),
    win: z.boolean(),
    perks: z.object({
        statPerks: z.object({
            defense: z.number(),
            flex: z.number(),
            offense: z.number(),
        }),
        styles: z.tuple([
            z.object({
                description: z.literal('primaryStyle'),
                selections: z.tuple([RuneSelection, RuneSelection, RuneSelection, RuneSelection]),
                style: RuneGroup,
            }),
            z.object({
                description: z.literal('subStyle'),
                selections: z.tuple([RuneSelection, RuneSelection]),
                style: RuneGroup,
            }),
        ]),
    }),
})

const RiotObjectiveSchema = z.object({
    first: z.boolean(),
    kills: z.number(),
})

const RiotTeamSchema = z.object({
    bans: z.array(
        z.object({
            championId: z.number(),
            pickTurn: z.number(),
        }),
    ),
    objectives: z.object({
        baron: RiotObjectiveSchema,
        champion: RiotObjectiveSchema,
        dragon: RiotObjectiveSchema,
        inhibitor: RiotObjectiveSchema,
        riftHerald: RiotObjectiveSchema,
        tower: RiotObjectiveSchema,
    }),
    teamId: z.union([z.literal(100), z.literal(200), z.literal(0)]),
    win: z.boolean(),
})

export const RiotGameSchema = z.object({
    metadata: z.object({
        dataVersion: z.string(),
        matchId: z.string(),
        participants: z.array(z.string()),
    }),
    info: z.object({
        gameCreation: z.number(),
        gameDuration: z.number(),
        gameEndTimestamp: z.number(),
        gameId: z.number(),
        gameMode: z.string(),
        gameName: z.string(),
        gameStartTimestamp: z.number(),
        gameType: z.string(),
        gameVersion: z.string(),
        mapId: z.number(),
        participants: z.array(RiotParticipantSchema),
        platformId: z.string(),
        queueId: z.number(),
        teams: z.tuple([RiotTeamSchema, RiotTeamSchema]),
    }),
})

export type RiotGameType = z.infer<typeof RiotGameSchema>

export type RiotParticipantType = z.infer<typeof RiotParticipantSchema>

export class RiotAugment {
    description: string
    displayName: string
    enabled: boolean
    iconLarge: string
    iconSmall: string
    id: number
    name: string
    rarity: number
    tooltip: string
    spellDataValues: Record<string, number>
}