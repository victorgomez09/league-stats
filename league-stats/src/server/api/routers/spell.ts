import z from "zod"
import { createTRPCRouter, publicProcedure, cacheMiddleware, loggerMiddleware } from "../trpc"
import { TRPCError } from "@trpc/server";

const CACHE_DURATION = 1000 * 60 * 60;
let cachedVersion: string | null = null;
let versionCacheTime: number = 0;

const DDragon_BASE_URL = 'https://ddragon.leagueoflegends.com/cdn';

export const spellRouter = createTRPCRouter({
    getSpells: publicProcedure
        .use(cacheMiddleware)
        .use(loggerMiddleware)
        .query(async () => {
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
            } catch {
                cachedVersion = '14.24.1';
            }

            try {
                const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${cachedVersion}/data/en_US/summoner.json`);

                if (!response.ok) {
                    throw new Error('Failed to fetch summoner spells');
                }

                const data = await response.json();

                return data.data;
            } catch (error) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: String(error) })
            }
        }),

    getSpellPicture: publicProcedure
        .use(loggerMiddleware)
        .input(z.object({
            spellId: z.number()
        }))
        .query(async ({ input }) => {
            return `${DDragon_BASE_URL}/${cachedVersion || '14.24.1'}/img/spell/${input.spellId}`;
        }),
})