import SummonerView from "@/components/summoner-view"

export default async function Page({
    params,
}: {
    params: Promise<{ summonerTag: string }>
}) {
    const { summonerTag } = await params
    const splitted = decodeURIComponent(summonerTag).split("#")

    return (
        <div className="w-full h-full">
            <SummonerView summonerName={splitted[0]} tag={splitted[1]} />
        </div>
    )
}