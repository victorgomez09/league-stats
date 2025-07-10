import { createTRPCRouter } from "@/server/api/trpc";
import { playerRouter } from "./routers/player.router";
import { championRouter } from "./routers/champion.router";
import { userRouter } from "./routers/user.router";
import { summonerRouter } from "./routers/summoner.router";

export const appRouter = createTRPCRouter({
  player: playerRouter,
  champion: championRouter,
  user: userRouter,
  summoner: summonerRouter
});

export type AppRouter = typeof appRouter;

export const createCaller = appRouter.createCaller;