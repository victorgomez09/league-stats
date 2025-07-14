"use client"

import ChampionImage from "./champion-image";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "./ui/card";

type SummonerTopChamionsProps = {
    stats: {
        totalGames: number;
        wins: number;
        totalKills: number;
        totalDeaths: number;
        totalAssists: number;
        totalCS: number;
        totalCSPerMin: number;
        totalDamage: number;
        totalGold: number;
        totalGameDuration: number;
        championStats: Record<string, {
            games: number;
            wins: number;
            kills: number;
            deaths: number;
            assists: number;
        }>;
    }
}

export function SummonerTopChamions({ stats }: SummonerTopChamionsProps) {
    const topChampions = Object.entries(stats.championStats)
        .sort((a, b) => b[1].games - a[1].games)
        .slice(0, 10);

    const calculateKdaColor = (kda: number) => {
        if (kda > 5) return 'text-primary'
        else if (kda < 5 && kda > 3) return 'text-accent-foreground'
        else return 'text-default'
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Champion Stats</CardTitle>
                <CardDescription>Champion stats in the las 10 games</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
                {topChampions.map(([champName, champStats]) => {
                    const champWinRate = (champStats.wins / champStats.games) * 100;
                    const champKDA = champStats.deaths > 0
                        ? (champStats.kills + champStats.assists) / champStats.deaths
                        : champStats.kills + champStats.assists;

                    return (
                        <Card key={champName} className="bg-background !p-2">
                            <CardContent className="grid grid-cols-3 items-center gap-2 !p-2">
                                <div className="flex items-center gap-1">
                                    <ChampionImage championName={champName} size={8} />
                                    <span className="text-sm font-semibold">{champName}</span>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <span className={`font-semibold ${calculateKdaColor(champKDA)}`}>{champKDA.toFixed(2)} KDA</span>
                                    <div className="flex items-center gap-1">
                                        <span>{champStats.kills}</span>
                                        <span>/</span>
                                        <span>{champStats.deaths}</span>
                                        <span>/</span>
                                        <span>{champStats.assists}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className={`font-semibold ${champWinRate >= 50 && "text-primary"}`}>
                                        {champWinRate.toFixed(0)}% WR
                                    </span>
                                    <span className="text-neutral-500">{champStats.games} games</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </CardContent>
        </Card>
    )
}