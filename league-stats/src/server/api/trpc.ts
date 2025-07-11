import { initTRPC } from '@trpc/server';
import superjson from "superjson";
import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Redis client
const redisClient = createClient({
    password: 'league-stats'
});
await redisClient.connect();

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
    /**
     * @see https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
});

// cache middleware https://app.studyraid.com/en/read/11153/345929/caching-strategies-with-trpc
export const cacheMiddleware = t.middleware(async ({ ctx, next, path }) => {
    const cacheKey = `trpc:${path}`;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
        logger.debug(`Getting data from cache: ${cacheKey}`)
        return JSON.parse(cachedData);
    }

    const result = await next();
    logger.debug(`Setting ${cacheKey} in cache`)
    await redisClient.set(cacheKey, JSON.stringify(result), { EX: 3600 }); // Cache for 60 minutes

    return result;
});

// logging middleware
export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
    logger.info(`Request: ${type} ${path}`);
    const start = Date.now();
    const result = await next();
    const durationMs = Date.now() - start;
    logger.info(`Response: ${type} ${path} - ${durationMs}ms`);

    return result;
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

// export const protectedProcedure = publicProcedure.use((opts) => {
//     const { session } = opts.ctx;

//     if (!session?.user) {
//         throw new TRPCError({
//             code: 'UNAUTHORIZED',
//         });
//     }

//     return opts.next({ ctx: { session } });
// });

// export const createAction = experimental_createServerActionHandler(t, {
//     async createContext() {
//         const session = await auth();

//         return {
//             session,
//             headers: {
//                 // Pass the cookie header to the API
//                 cookies: (await headers()).get('cookie') ?? '',
//             },
//         };
//     },
// });