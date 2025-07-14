import z from "zod"
import { createTRPCRouter, publicProcedure, cacheMiddleware, loggerMiddleware } from "../trpc"
import { TRPCError } from "@trpc/server";
import { DragonItemDto } from "@/app/models/item";
import { logger } from "@/server/utils/logger";

let cachedVersion: string | null = null;

export const itemRouter = createTRPCRouter({
    getItems: publicProcedure
        // .use(cacheMiddleware)
        .use(loggerMiddleware)
        .input(z.object({
            server: z.string()
        }))
        .query(async ({ input }) => {
            const now = Date.now();

            try {
                const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');

                if (!response.ok) {
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Error getting latest version' })
                }

                const versions = await response.json();
                cachedVersion = versions[0];
            } catch {
                cachedVersion = '14.24.1';
            }

            try {
                const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${cachedVersion}/data/${input.server}/item.json`);

                if (!response.ok) {
                    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch items' });
                }

                const data = await response.json() as DragonItemDto[];
                console.log('DATA', data)

                return data;
            } catch (error) {
                logger.error(error)
                return [];
            }
        }),
    getItemPicture: publicProcedure
        .use(loggerMiddleware)
        .input(z.object({
            itemId: z.number()
        }))
        .query(async ({ input }) => {
            if (input.itemId === 0) return '';
            const now = Date.now();

            try {
                const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');

                if (!response.ok) {
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Error getting latest version' })
                }

                const versions = await response.json();
                cachedVersion = versions[0];
            } catch {
                cachedVersion = '14.24.1';
            }

            return `https://ddragon.leagueoflegends.com/cdn/${cachedVersion}/img/item/${input.itemId}.png`;
        }),
})