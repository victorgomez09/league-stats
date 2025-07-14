"use client"

import { RegionGroups } from "@/lib/ezreal/constants"
import { trpc } from "@/trpc/client"
import { Spinner } from "./ui/spinner"
import PlayerProfile from "./summoner-profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import SummonerMatchView from "./summoner-match-view"
import SummonerStats from "./summoner-stats"
import { SummonerTopChamions } from "./summoner-top-champions"

type SummonerViewProps = {
    summonerName: string
    tag: string
}

export default function SummonerView({ summonerName, tag }: SummonerViewProps) {
    const { data: account, isLoading: accountLoading } = trpc.summoner.getAccount.useQuery({ summonerName, tag, server: RegionGroups.EUROPE }, { enabled: !!summonerName });
    const { data: summoner, isLoading: summonerLoading } = trpc.summoner.getSummoner.useQuery({ summonerName, tag, server: RegionGroups.EUROPE }, { enabled: !!summonerName });
    const { data: ranked, isLoading: rankedLoading } = trpc.summoner.getSummonerRankedInfo.useQuery({ puuid: summoner?.puuid || "" }, { enabled: !!summoner?.puuid });
    const { data: matches, isLoading: matchesLoading } = trpc.summoner.getSummonerMatches.useQuery({ summonerName, tag, server: RegionGroups.EUROPE }, { enabled: !!summonerName });
    const { data: spells, isLoading: spellsLoading } = trpc.spell.getSpells.useQuery();
    const { data: runes, isLoading: runesLoading } = trpc.rune.getRunes.useQuery();
    const { data: items, isLoading: itemsLoading } = trpc.item.getItems.useQuery({ server: RegionGroups.EUROPE });

    if (accountLoading || summonerLoading || rankedLoading || matchesLoading || spellsLoading || runesLoading || itemsLoading) return <Spinner />

    const stats = matches!.reduce((acc, match) => {
        const player = match.info.participants.find(p => p.puuid === summoner?.puuid);
        if (!player) return acc;

        const gameDurationMinutes = match.info.gameDuration / 60;
        const cs = (player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0);
        const csPerMin = cs / gameDurationMinutes;

        acc.totalGames++;
        if (player.win) acc.wins++;
        acc.totalKills += player.kills;
        acc.totalDeaths += player.deaths;
        acc.totalAssists += player.assists;
        acc.totalCS += cs;
        acc.totalCSPerMin += csPerMin;
        acc.totalDamage += player.totalDamageDealtToChampions;
        acc.totalGold += player.goldEarned;
        acc.totalGameDuration += gameDurationMinutes;

        if (!acc.championStats[player.championName]) {
            acc.championStats[player.championName] = {
                games: 0,
                wins: 0,
                kills: 0,
                deaths: 0,
                assists: 0,
            };
        }
        const champStats = acc.championStats[player.championName];
        champStats.games++;
        if (player.win) champStats.wins++;
        champStats.kills += player.kills;
        champStats.deaths += player.deaths;
        champStats.assists += player.assists;

        return acc;
    }, {
        totalGames: 0,
        wins: 0,
        totalKills: 0,
        totalDeaths: 0,
        totalAssists: 0,
        totalCS: 0,
        totalCSPerMin: 0,
        totalDamage: 0,
        totalGold: 0,
        totalGameDuration: 0,
        championStats: {} as Record<string, {
            games: number;
            wins: number;
            kills: number;
            deaths: number;
            assists: number;
        }>
    });


    return (
        <div className="flex flex-col items-center justify-center gap-4 w-full h-full">
            <SummonerStats matches={matches!} playerPuuid={summoner?.puuid!} stats={stats} />

            <div className="grid grid-cols-6 gap-4 w-full h-full">
                <div className="col-span-2 flex flex-col gap-4">
                    <PlayerProfile account={account!} summoner={summoner!} ranked={ranked!} />
                    <SummonerTopChamions stats={stats} />
                </div>

                <div className="col-span-4 h-full">
                    <Card>
                        <CardHeader>
                            <CardTitle>Match History</CardTitle>
                            <CardDescription>Summoner match history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2">
                                {matches?.map((match, index) => (
                                    <SummonerMatchView key={index} match={match} summoner={summoner!} spells={spells} runes={runes!} items={items!} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}