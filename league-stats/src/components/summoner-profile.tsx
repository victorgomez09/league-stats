"use client";

import { Trophy } from "lucide-react";
import Image from 'next/image';
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { SummonerLeagueDto, SummonerV4DTO } from "@/lib/ezreal/models-dto";
import { AccountDto } from "@/lib/ezreal/models-dto/account";
import { trpc } from "@/trpc/client";
import { Spinner } from "./ui/spinner";

interface PlayerProfileProps {
    summoner: SummonerV4DTO;
    account: AccountDto;
    ranked: SummonerLeagueDto[];
}

export default function PlayerProfile({ summoner, account, ranked }: PlayerProfileProps) {
    const { data: profilePicture, isLoading: profilePictureLoading } = trpc.summoner.getSummonerProfilePicture.useQuery({ profileIconId: summoner.profileIconId }, { enabled: !!summoner.profileIconId })
    const { data: rankedPicture, isLoading: rankedPictureLoading } = trpc.summoner.getSummonerRankedPicture.useQuery({ tier: ranked.find(r => r.queueType === "RANKED_SOLO_5x5")?.tier || "" }, { enabled: !!ranked })

    const getSoloQueueData = () => {
        return ranked.find(r => r.queueType === "RANKED_SOLO_5x5");
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        {profilePictureLoading ? <Spinner /> : (
                            <Image
                                src={profilePicture!}
                                alt="Profile Icon"
                                className="w-20 h-20 rounded-full"
                                width={64}
                                height={64}
                            />
                        )}
                    </div>
                    <h2 className="text-xl font-bold mb-1">{account.gameName}</h2>
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
                                                {rankedPictureLoading ? <Spinner /> :
                                                    <Image
                                                        src={rankedPicture!}
                                                        alt={`${soloQ.tier} ${soloQ.rank}`}
                                                        className="w-16 h-16 object-contain"
                                                        width={64}
                                                        height={64}
                                                    />}

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
                </div>
            </CardContent>
        </Card>
    );
}