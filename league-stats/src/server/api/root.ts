import { router } from "./trpc";
import { summonerRouter } from "./routers/summoner.router";

export const appRouter = router({
    summoner: summonerRouter,
});

export type AppRouter = typeof appRouter;