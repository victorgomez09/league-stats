"use client"

import { trpc } from "@/trpc/client"
import Image from "next/image"
import { Spinner } from "./ui/spinner"

export type ChampionImageProps = {
    championName: string
    size: number
}

export default function ChampionImage({ championName, size }: ChampionImageProps) {
    const { data: championPicture, isLoading: championPictureLoading } = trpc.champion.getChampionPicture.useQuery({ championName: championName || "" }, { enabled: !!championName })

    if (championPictureLoading) return <Spinner />

    return (
        <Image
            src={championPicture!}
            alt={championName}
            className={`size-${size}`}
            width={48}
            height={48}
            style={{ aspectRatio: '1/1' }}
        />
    )
}