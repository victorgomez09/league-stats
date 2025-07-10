import { LolApi, RiotApi } from "@/lib/ezreal";
import { RegionGroups, Regions } from "@/lib/ezreal/constants";
import { MatchV5DTOs } from "@/lib/ezreal/models-dto";
import {
  createTRPCRouter,
  publicProcedure
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export const summonerRouter = createTRPCRouter({
  getAccount: publicProcedure
    .input(z.object({
      summonerName: z.string(),
      tag: z.string(),
      server: z.enum([RegionGroups.ASIA, RegionGroups.AMERICAS, RegionGroups.EUROPE])
    }))
    .query(async ({ input }) => {
      const api = new RiotApi(RIOT_API_KEY)
      // Recommended to use the nearest routing value to your server: americas, asia, europe
      return (await api.Account.getByRiotId(input.summonerName, input.tag, input.server)).response
    }),

  getSummoner: publicProcedure
    .input(z.object({
      summonerName: z.string(), tag: z.string(), server: z.enum([RegionGroups.ASIA, RegionGroups.AMERICAS, RegionGroups.EUROPE]), puuid: z.string().optional()
    }))
    .query(async ({ input }) => {
      try {
        const api = new LolApi({ key: RIOT_API_KEY })
        if (input.puuid) {
          return await api.Summoner.getByPUUID(input.puuid, Regions.EU_WEST);
        }

        const riotApi = new RiotApi(RIOT_API_KEY)
        const account = (await riotApi.Account.getByRiotId(input.summonerName, input.tag, input.server)).response

        return await api.Summoner.getByPUUID(account.puuid, Regions.EU_WEST)
      } catch (error) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: error })
      }
    }),

  getSummonerMatches: publicProcedure
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
          const riotApi = new RiotApi(RIOT_API_KEY)
          const account = (await riotApi.Account.getByRiotId(input.summonerName, input.tag, input.server)).response
          const summoner = (await api.Summoner.getByPUUID(account.puuid, Regions.EU_WEST)).response
          const matchlist = (await api.MatchV5.list(summoner.puuid, input.server, { count: 10 })).response

          for await (const match of matchlist) {
            matches.push((await api.MatchV5.get(match, input.server)).response)
          }
        }

        return matches
      } catch (error) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: error })
      }
    }),

  getSummonerRankedInfo: publicProcedure
    .input(z.object({
      puuid: z.string(),
    }))
    .query(async ({ input }) => {
      const api = new LolApi({ key: RIOT_API_KEY })

      return api.League.byPUUID(input.puuid, Regions.EU_WEST)
    }),

  getSummonerMastery: publicProcedure
    .input(z.object({
      puuid: z.string(),
    }))
    .query(async ({ input }) => {
      const api = new LolApi({ key: RIOT_API_KEY })

      return await api.Champion.masteryByPUUID(input.puuid, Regions.EU_WEST)
    }),
});