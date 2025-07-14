import { championRouter } from "./routers/champion";
import { itemRouter } from "./routers/item";
import { runeRouter } from "./routers/rune";
import { spellRouter } from "./routers/spell";
import { summonerRouter } from "./routers/summoner";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    summoner: summonerRouter,
    champion: championRouter,
    spell: spellRouter,
    rune: runeRouter,
    item: itemRouter
});

export type AppRouter = typeof appRouter;