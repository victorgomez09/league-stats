"use client"

import { RegionGroups } from "@/lib/ezreal/constants"
import { trpc } from "@/trpc/client"

type SummonerViewProps = {
    summonerName: string
    tag: string
}

export default function SummonerView({ summonerName, tag }: SummonerViewProps) {

    const { data: account } = trpc.summoner.getAccount.useQuery({ summonerName, tag, server: RegionGroups.EUROPE }, { enabled: !!summonerName });

    return <div>{JSON.stringify(account)}</div>
}