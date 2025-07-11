import { summonerRouter } from "./routers/summoner.router";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    summoner: summonerRouter,
});

export type AppRouter = typeof appRouter;