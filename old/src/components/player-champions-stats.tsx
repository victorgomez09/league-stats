"use client";

import { getProfileIconUrl, getRankedEmblemUrl } from "@/lib/_old.riot-server-api";
import { ChampionStat, Match, RankedInfo, Summoner } from "@/lib/types";
import { Trophy } from "lucide-react";
import Image from 'next/image';
import { Badge } from "./ui/badge";
import { Card, CardHeader, CardContent, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

interface ChampionStatsProps {
    championStats: ChampionStat[];
}

export default function PlayerChampionsStats({ championStats }: ChampionStatsProps) {
    console.log('championStats', championStats)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Last 10 champions</CardTitle>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid grid-cols-4">
                    <div className="flex flex-col gap-2">
                        {championStats.map((cs, index) => {
                            return (
                                <span key={index}>{cs.championName}</span>
                            )
                        })}
                    </div>

                    <div className="flex flex-col gap-2">
                        <span>Kill Participation</span>
                        {championStats.map((cs, index) => {
                            return (
                                <div key={index} className="flex flex-col items-center">
                                    <span>{cs.killParticipation}%</span>
                                    <Progress value={cs.killParticipation} className="border" />
                                </div>
                            )
                        })}
                    </div>
                </div>
                {/* <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <Image
                            src={getProfileIconUrl(summoner.profileIconId)}
                            alt="Profile Icon"
                            className="w-20 h-20 rounded-full"
                            width={64}
                            height={64}
                        />
                    </div>
                    <h2 className="text-xl font-bold mb-1">{summoner.name}</h2>
                    <Badge color="primary" variant="default" className="mb-4">
                        Level {summoner.summonerLevel}
                    </Badge>

                    {getSoloQueueData() && (
                        <div className="mt-6">
                            <h3 className="font-semibold mb-3 flex items-center gap-2 justify-center">
                                <Trophy className="w-4 h-4" />
                                Solo/Duo Queue
                            </h3>
                            {(() => {
                                const soloQ = getSoloQueueData()!;
                                const winRate = Math.round((soloQ.wins / (soloQ.wins + soloQ.losses)) * 100);

                                return (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-4 justify-center">
                                            <div className="flex-shrink-0">
                                                <Image
                                                    src={getRankedEmblemUrl(soloQ.tier)}
                                                    alt={`${soloQ.tier} ${soloQ.rank}`}
                                                    className="w-16 h-16 object-contain"
                                                    width={64}
                                                    height={64}
                                                />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold text-lg">
                                                    {soloQ.tier} {soloQ.rank}
                                                </div>
                                                <div className="text-sm text-default-500">
                                                    {soloQ.leaguePoints} LP
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Wins: {soloQ.wins}</span>
                                                <span>Losses: {soloQ.losses}</span>
                                            </div>
                                            <Progress value={winRate} color="primary" className="border" />
                                            <div className="text-center text-sm">
                                                {winRate}% win rate
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )} 
            </div>*/}
            </CardContent>
        </Card >
    );
}