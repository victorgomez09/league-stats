"use client";

import { MatchV5DTOs } from "@/lib/ezreal/models-dto";
import { Progress } from "@radix-ui/react-progress";
import { Target, Coins, Swords } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "./ui/card";

interface SummonerStatsProps {
    matches: MatchV5DTOs.MatchDto[];
    playerPuuid: string;
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

export default function SummonerStats({ matches, playerPuuid, stats }: SummonerStatsProps) {
    const winRate = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;
    const avgKills = stats.totalGames > 0 ? stats.totalKills / stats.totalGames : 0;
    const avgDeaths = stats.totalGames > 0 ? stats.totalDeaths / stats.totalGames : 0;
    const avgAssists = stats.totalGames > 0 ? stats.totalAssists / stats.totalGames : 0;
    const avgKDA = stats.totalDeaths > 0
        ? (stats.totalKills + stats.totalAssists) / stats.totalDeaths
        : stats.totalKills + stats.totalAssists;
    const avgCSPerMin = stats.totalGames > 0 ? stats.totalCSPerMin / stats.totalGames : 0;
    const avgDamage = stats.totalGames > 0 ? stats.totalDamage / stats.totalGames : 0;
    const avgGold = stats.totalGames > 0 ? stats.totalGold / stats.totalGames : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {/* Win Rate Card */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <div className="flex items-center justify-between">
                            <span>Win Rate</span>
                            <Target className="size-4 text-primary" />
                        </div>
                    </CardTitle>
                    <CardDescription>Win rate in the last 10 games</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="text-2xl font-bold text-primary">
                        {winRate.toFixed(1)}%
                    </div>
                    <Progress
                        value={winRate}
                        color={winRate >= 50 ? "success" : "danger"}
                        className="mb-2"
                    />
                    <div className="text-xs text-neutral-400 font-semibold">
                        {stats.wins} Wins - {stats.totalGames - stats.wins} Defeats
                    </div>
                </CardContent>
            </Card>

            {/* KDA Card */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <div className="flex items-center justify-between">
                            <span>Average KDA</span>
                            <Swords className="size-4 text-primary" />
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Average KDA in the last 10 games
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="text-2xl font-bold mb-2">
                        {avgKDA.toFixed(2)}
                    </div>
                    <div className="text-sm text-neutral-400 font-semibold">
                        {avgKills.toFixed(1)} / <span className="text-primary">{avgDeaths.toFixed(1)}</span> / {avgAssists.toFixed(1)}
                    </div>
                    <div className="text-xs text-neutral-400 font-semibold mt-1">
                        Per match
                    </div>
                </CardContent>
            </Card>

            {/* CS/min Card */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        <div className="flex items-center justify-between">
                            <span>CS/min</span>
                            <Coins className="w-4 h-4 text-primary" />
                        </div>
                    </CardTitle>
                    <CardDescription>
                        CS per minute in the last 10 games
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="text-2xl font-bold mb-2">
                        {avgCSPerMin.toFixed(1)}
                    </div>
                    <div className="text-sm text-neutral-400 font-semibold">
                        {(avgGold / 1000).toFixed(1)}k gold/match
                    </div>
                    <div className="text-xs text-neutral-400 font-semibold mt-1">
                        {(avgDamage / 1000).toFixed(1)}k damage/match
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}