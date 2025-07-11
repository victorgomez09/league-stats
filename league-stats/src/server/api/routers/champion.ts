import z from "zod"
import { createTRPCRouter, publicProcedure, cacheMiddleware, loggerMiddleware } from "../trpc"

export const championRouter = createTRPCRouter({
    getChampionPicture: publicProcedure
        .use(loggerMiddleware)
        .input(z.object({
            championName: z.string(),
        }))
        .query(async ({ input }) => {
            return `https://ddragon.leagueoflegends.com/cdn/14.24.1/img/champion/${input.championName}.png`
        }),
})