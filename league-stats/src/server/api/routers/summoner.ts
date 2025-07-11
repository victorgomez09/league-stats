import { LolApi, RiotApi } from "@/lib/ezreal";
import { RegionGroups, Regions } from "@/lib/ezreal/constants";
import { MatchV5DTOs } from "@/lib/ezreal/models-dto";
import {
  cacheMiddleware,
  createTRPCRouter,
  loggerMiddleware,
  publicProcedure
} from "@/server/api/trpc";
import { logger } from "@/server/utils/logger";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export const summonerRouter = createTRPCRouter({
  getAccount: publicProcedure
    .use(cacheMiddleware)
    .use(loggerMiddleware)
    .input(z.object({
      summonerName: z.string(),
      tag: z.string(),
      server: z.enum([RegionGroups.ASIA, RegionGroups.AMERICAS, RegionGroups.EUROPE])
    }))
    .query(async ({ input }) => {
      const api = new RiotApi({ key: RIOT_API_KEY })
      // Recommended to use the nearest routing value to your server: americas, asia, europe
      return (await api.Account.getByRiotId(input.summonerName, input.tag, input.server)).response
    }),

  getSummoner: publicProcedure
    .use(cacheMiddleware)
    .use(loggerMiddleware)
    .input(z.object({
      summonerName: z.string(), tag: z.string(), server: z.enum([RegionGroups.ASIA, RegionGroups.AMERICAS, RegionGroups.EUROPE]), puuid: z.string().optional()
    }))
    .query(async ({ input }) => {
      try {
        const api = new LolApi({ key: RIOT_API_KEY })
        if (input.puuid) {
          return (await api.Summoner.getByPUUID(input.puuid, Regions.EU_WEST)).response;
        }

        const riotApi = new RiotApi({ key: RIOT_API_KEY })
        const account = (await riotApi.Account.getByRiotId(input.summonerName, input.tag, input.server)).response

        return (await api.Summoner.getByPUUID(account.puuid, Regions.EU_WEST)).response
      } catch (error) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: String(error) })
      }
    }),

  getSummonerMatches: publicProcedure
    .use(cacheMiddleware)
    .use(loggerMiddleware)
    .input(z.object({
      summonerName: z.string(), tag: z.string(), server: z.enum([RegionGroups.ASIA, RegionGroups.AMERICAS, RegionGroups.EUROPE]), puuid: z.string().optional()
    }))
    .query(async ({ input }) => {
      try {
        const matches: MatchV5DTOs.MatchDto[] = []
        const api = new LolApi({ key: RIOT_API_KEY })

        if (input.puuid) {
          const matchlist = (await api.MatchV5.list(input.puuid, input.server, { count: 10 })).response

          for await (const match of matchlist) {
            matches.push((await api.MatchV5.get(match, input.server)).response)
          }
        } else {
          const riotApi = new RiotApi({ key: RIOT_API_KEY })
          const account = (await riotApi.Account.getByRiotId(input.summonerName, input.tag, input.server)).response
          const summoner = (await api.Summoner.getByPUUID(account.puuid, Regions.EU_WEST)).response
          const matchlist = (await api.MatchV5.list(summoner.puuid, input.server, { count: 10 })).response

          for await (const match of matchlist) {
            matches.push((await api.MatchV5.get(match, input.server)).response)
          }
        }

        return matches
      } catch (error) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: String(error) })
      }
    }),

  getSummonerRankedInfo: publicProcedure
    .use(cacheMiddleware)
    .use(loggerMiddleware)
    .input(z.object({
      puuid: z.string(),
    }))
    .query(async ({ input }) => {
      const api = new LolApi({ key: RIOT_API_KEY })

      return (await api.League.byPUUID(input.puuid, Regions.EU_WEST)).response
    }),

  getSummonerMastery: publicProcedure
    .use(cacheMiddleware)
    .use(loggerMiddleware)
    .input(z.object({
      puuid: z.string(),
    }))
    .query(async ({ input }) => {
      const api = new LolApi({ key: RIOT_API_KEY })

      return await api.Champion.masteryByPUUID(input.puuid, Regions.EU_WEST)
    }),

  getSummonerProfilePicture: publicProcedure
    .use(cacheMiddleware)
    .use(loggerMiddleware)
    .input(z.object({
      profileIconId: z.number()
    }))
    .query(async ({ input }) => {
      return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/profileicon/${input.profileIconId}.png`;
    }),

  getSummonerRankedPicture: publicProcedure
    .use(cacheMiddleware)
    .use(loggerMiddleware)
    .input(z.object({
      tier: z.string()
    }))
    .query(async ({ input }) => {
      const formattedTier = input.tier.toLowerCase();

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
    })
});