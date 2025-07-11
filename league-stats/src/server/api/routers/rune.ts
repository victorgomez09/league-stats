import z from "zod"
import { createTRPCRouter, publicProcedure, cacheMiddleware, loggerMiddleware } from "../trpc"
import { TRPCError } from "@trpc/server";
import { RunesDto } from "@/app/models/rune";

let cachedVersion: string | null = null;
let versionCacheTime: number = 0;

export const runeRouter = createTRPCRouter({
    getRunes: publicProcedure
        .use(cacheMiddleware)
        .use(loggerMiddleware)
        .query(async () => {
            const now = Date.now();

            try {
                const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');

                if (!response.ok) {
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Error getting latest version' })
                }

                const versions = await response.json();
                cachedVersion = versions[0];
                versionCacheTime = now;
            } catch {
                cachedVersion = '14.24.1';
            }

            try {
                const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${cachedVersion || '14.24.1'}/data/en_US/runesReforged.json`);

                if (!response.ok) {
                    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Error getting runes data' })
                }

                return await response.json() as RunesDto;
            } catch (error) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: String(error) })
            }
        }),

    getRunePicture: publicProcedure
        .use(loggerMiddleware)
        .input(z.object({
            runeId: z.number()
        }))
        .query(async ({ input }) => {
            const primaryCdn = 'https://static.bigbrain.gg/assets/lol/riot_static/15.13.1/img/small-perk-images';
            const fallbackCdn = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images';

            const runeMap: { [key: number]: string } = {
                8005: 'Styles/Precision/PressTheAttack/PressTheAttack.png',
                8008: 'Styles/Precision/LethalTempo/LethalTempo.png', // Tentativa com nome original
                8021: 'Styles/Precision/FleetFootwork/FleetFootwork.png',
                8010: 'Styles/Precision/Conqueror/Conqueror.png',
                8112: 'Styles/Domination/Electrocute/Electrocute.png',
                8124: 'Styles/Domination/Predator/Predator.png',
                8128: 'Styles/Domination/DarkHarvest/DarkHarvest.png',
                9923: 'Styles/Domination/HailOfBlades/HailOfBlades.png',
                8214: 'Styles/Sorcery/SummonAery/SummonAery.png',
                8229: 'Styles/Sorcery/ArcaneComet/ArcaneComet.png',
                8230: 'Styles/Sorcery/PhaseRush/PhaseRush.png',
                8437: 'Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
                8439: 'Styles/Resolve/Aftershock/Aftershock.png',
                8465: 'Styles/Resolve/Guardian/Guardian.png',
                8351: 'Styles/Inspiration/GlacialAugment/GlacialAugment.png',
                8360: 'Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
                8369: 'Styles/Inspiration/FirstStrike/FirstStrike.png'
            };

            const fallbackRuneMap: { [key: number]: string } = {
                8005: 'styles/precision/presstheattack/presstheattack.png',
                8008: 'styles/precision/presstheattack/presstheattack.png',
                8021: 'styles/precision/fleetfootwork/fleetfootwork.png',
                8010: 'styles/precision/conqueror/conqueror.png',
                8112: 'styles/domination/electrocute/electrocute.png',
                8124: 'styles/domination/predator/predator.png',
                8128: 'styles/domination/darkharvest/darkharvest.png',
                9923: 'styles/domination/hailofblades/hailofblades.png',
                8214: 'styles/sorcery/summonaery/summonaery.png',
                8229: 'styles/sorcery/arcanecomet/arcanecomet.png',
                8230: 'styles/sorcery/phaserush/phaserush.png',
                8437: 'styles/resolve/graspoftheundying/graspoftheundying.png',
                8439: 'styles/resolve/aftershock/aftershock.png',
                8465: 'styles/resolve/guardian/guardian.png',
                8351: 'styles/inspiration/glacialaugment/glacialaugment.png',
                8360: 'styles/inspiration/unsealedspellbook/unsealedspellbook.png',
                8369: 'styles/inspiration/firststrike/firststrike.png'
            };

            const runePath = runeMap[input.runeId];
            const fallbackPath = fallbackRuneMap[input.runeId];
            const defaultPath = 'Styles/Precision/PressTheAttack/PressTheAttack.png';
            const defaultFallbackPath = 'styles/precision/presstheattack/presstheattack.png';

            console.log(`${primaryCdn}/${runePath || defaultPath}`)
            return {
                primary: `${primaryCdn}/${runePath || defaultPath}`,
                fallback: `${fallbackCdn}/${fallbackPath || defaultFallbackPath}`
            };
        }),
})