import { Constants, LolApi, RiotApi } from "./ezreal";
import { AccountAPIRegionGroups, Regions } from "./ezreal/constants";
import { MatchV5DTOs, SummonerV4DTO } from "./ezreal/models-dto";
import { AccountDto } from "./ezreal/models-dto/account";

const RIOT_API_KEY = process.env.RIOT_API_KEY;

export async function getAccount(summonerName: string, tag: string, server: AccountAPIRegionGroups) {
    const api = new RiotApi(RIOT_API_KEY)
    // Recommended to use the nearest routing value to your server: americas, asia, europe
    return (await api.Account.getByRiotId(summonerName, tag, server)).response
}

export async function getSummoner(summonerName: string, tag: string, server: AccountAPIRegionGroups, account?: AccountDto) {
    try {
        const api = new LolApi({ key: RIOT_API_KEY })

        return await api.Summoner.getByPUUID(account ? account.puuid : (await getAccount(summonerName, tag, server)).puuid, Regions.EU_WEST)
    } catch (error) {
        console.log(error)
    }
}

export async function getSummonerMatches(summonerName: string, tag: string, server: AccountAPIRegionGroups, summoner?: SummonerV4DTO) {
    try {
        const matches: MatchV5DTOs.MatchDto[] = []
        const api = new LolApi({ key: RIOT_API_KEY })

        const matchlist = (await api.MatchV5.list(summoner ? summoner.puuid : (await getSummoner(summonerName, tag, server)).response.puuid, server, { count: 10 })).response

        for await (const match of matchlist) {
            matches.push((await api.MatchV5.get(match, server)).response)
        }

        return matches
    } catch (error) {
        console.log(error)
    }
}

export async function getSummonerMastery(puuid: string) {
    const api = new LolApi({ key: RIOT_API_KEY })

    return await api.Champion.masteryByPUUID(puuid, Regions.EU_WEST)
}

export async function getSummonerRankedInfo(puuid: string) {
    const api = new LolApi({ key: RIOT_API_KEY })

    return api.League.byPUUID(puuid, Regions.EU_WEST)
//   const url = `${PLATFORM_URL}/lol/league/v4/entries/by-puuid/${puuid}`;
//   return makeRiotRequest(url);
}