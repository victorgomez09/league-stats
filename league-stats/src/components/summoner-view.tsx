"use client"

import { RegionGroups } from "@/lib/ezreal/constants"
import { trpc } from "@/trpc/client"
import { Spinner } from "./ui/spinner"
import PlayerProfile from "./summoner-profile"
import { Card, CardContent } from "./ui/card"
import SummonerMatchView from "./summoner-match-view"

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

    if (accountLoading || summonerLoading || rankedLoading || matchesLoading || spellsLoading || runesLoading) return <Spinner />

    return (
        <div className="grid grid-cols-6 gap-4 w-full h-full">
            <div className="col-span-2">
                <PlayerProfile account={account!} summoner={summoner!} ranked={ranked!} />
            </div>

            <div className="col-span-4 h-full">
                <Card>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            {matches?.map((match, index) => (
                                <SummonerMatchView key={index} match={match} summoner={summoner!} spells={spells} runes={runes!} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}