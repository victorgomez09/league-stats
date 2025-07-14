"use client"

import { MatchV5DTOs, SummonerV4DTO } from "@/lib/ezreal/models-dto";
import { Card, CardContent } from "./ui/card";
import { Spinner } from "./ui/spinner";
import Image from "next/image"
import { trpc } from "@/trpc/client";
import { SpellsDto } from "@/app/models/spell";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { RunesDto } from "@/app/models/rune";
import { DragonItemDto } from "@/app/models/item";
import MatchItemView from "./match-item-view";

interface SummonerMatchViewProps {
    match: MatchV5DTOs.MatchDto;
    summoner: SummonerV4DTO;
    spells: SpellsDto;
    runes: RunesDto;
    items: DragonItemDto[];
}

export default function SummonerMatchView({ match, summoner, spells, runes, items }: SummonerMatchViewProps) {
    const playerData = match.info.participants.find(p => p.puuid === summoner.puuid);
    const { data: championPicture, isLoading: championPictureLoading } = trpc.champion.getChampionPicture.useQuery({ championName: playerData?.championName || "" }, { enabled: !!playerData?.championName })
    const { data: spell1Picture, isLoading: spell1PictureLoading } = trpc.spell.getSpellPicture.useQuery({ spellId: playerData?.summoner1Id || 0 }, { enabled: !!playerData?.summoner1Id })
    const { data: spell2Picture, isLoading: spell2PictureLoading } = trpc.spell.getSpellPicture.useQuery({ spellId: playerData?.summoner2Id || 0 }, { enabled: !!playerData?.summoner2Id })
    const { data: rune1Picture, isLoading: rune1PictureLoading } = trpc.rune.getRunePicture.useQuery({ runeId: playerData?.perks?.styles?.[0]?.selections[0].perk || 0 }, { enabled: !!playerData?.perks })
    const { data: rune2Picture, isLoading: rune2PictureLoading } = trpc.rune.getRunePicture.useQuery({ runeId: playerData?.perks?.styles?.[1]?.selections[0].perk || 0 }, { enabled: !!playerData?.perks })

    if (!playerData || championPictureLoading || spell1PictureLoading || spell2PictureLoading || rune1PictureLoading || rune2PictureLoading) return <Spinner />

    console.log('playerData?.perks?.styles?', playerData?.perks?.styles)

    const formatGameDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes}:${remainingSeconds}`;
    }

    const playerItems = [
        playerData.item0,
        playerData.item1,
        playerData.item2,
        playerData.item3,
        playerData.item4,
        playerData.item5,
        playerData.item6
    ];

    // const calculateDaysPassed = (
    //     startTimestampStr: number,
    // ): number => {
    //     const startDate: Date = new Date(startTimestampStr);
    //     const endDate: Date = new Date();
    //     const startTimeMs: number = startDate.getTime();
    //     const endTimeMs: number = endDate.getTime();
    //     const differenceMs: number = endTimeMs - startTimeMs;
    //     const msInDay: number = 1000 * 60 * 60 * 24;
    //     const daysPassedFloat: number = differenceMs / msInDay;

    //     return Math.floor(daysPassedFloat);
    // }

    const getSpellName = (spellId: number): string => {
        for (const spellKey in spells) {
            const spell = spells[spellKey];
            if (spell.key === spellId.toString()) {
                return spell.name;
            }
        }
        return 'Unknown';
    };

    const getRuneInfoLocal = (runeId: number): {
        name: string;
        description: string;
        treeName: string;
        slotType: string;
        shortDesc: string;
    } => {
        for (const tree of runes) {
            for (let slotIndex = 0; slotIndex < tree.slots.length; slotIndex++) {
                const slot = tree.slots[slotIndex];
                for (const rune of slot.runes) {
                    if (rune.id === runeId) {
                        const cleanDescription = rune.longDesc?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') ||
                            rune.shortDesc?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') ||
                            'Description not available';

                        const cleanShortDesc = rune.shortDesc?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ') || '';

                        let slotType = '';
                        if (slotIndex === 0) {
                            slotType = 'Principal rune';
                        } else if (slotIndex === 1 || slotIndex === 2) {
                            slotType = 'Main rune';
                        } else {
                            slotType = 'Runa Menor';
                        }

                        return {
                            name: rune.name,
                            description: cleanDescription,
                            treeName: tree.name,
                            slotType: slotType,
                            shortDesc: cleanShortDesc
                        };
                    }
                }
            }
        }

        return {
            name: 'Unknown Rune',
            description: 'Information not available',
            treeName: 'Unknown Tree',
            slotType: 'Unknown Type',
            shortDesc: ''
        };
    };

    const getRuneStyleName = (styleId: number): string => {
        const styleNames: { [key: number]: string } = {
            8000: 'Precision',
            8100: 'Domination',
            8200: 'Sorcery',
            8300: 'Inspiration',
            8400: 'Resolve'
        };

        return styleNames[styleId] || 'Unknown Style';
    }

    const calculateKDA = () => {
        return ((playerData.kills + playerData.assists) / playerData.deaths).toFixed(2)
    }

    return (
        <Card className="bg-background w-full">
            <CardContent>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between w-full">
                        <span className={`text-base font-semibold ${playerData.win ? 'text-success' : 'text-destructive'}`}>
                            {playerData.win ? 'VICTORY' : 'DEFEAT'}
                        </span>

                        <div className="flex items-center gap-3 text-sm">
                            <span className="uppercase">{match.info.gameMode === 'CLASSIC' ? 'Ranked' : match.info.gameMode}</span>
                            <span>{formatGameDuration(match.info.gameDuration)}</span>
                            {/* <span>{calculateDaysPassed(match.info.gameStartTimestamp)} day ago</span> */}
                        </div>
                    </div>

                    <div className="grid grid-cols-6 items-center">
                        {/* CHAMPION INFO */}
                        <div className="flex gap-1">
                            {/* PICTURE AND LEVEL */}
                            <div className="relative overflow-hidden rounded">
                                <Image
                                    src={championPicture!}
                                    alt={playerData.championName}
                                    className="w-12 h-12"
                                    width={48}
                                    height={48}
                                    style={{ aspectRatio: '1/1' }}
                                />
                                <div className="absolute bottom-0.5 left-6.5 bg-black/70 text-white text-xs font-medium leading-none px-1 py-0.5 rounded text-center min-w-[16px] z-10">
                                    {playerData.champLevel || 1}
                                </div>
                            </div>

                            {/* SPELLS */}
                            <div className="flex flex-col gap-1">
                                <Image
                                    src={spell1Picture!}
                                    alt="Spell 1"
                                    className="w-5 h-5 rounded cursor-help object-cover"
                                    width={20}
                                    height={20}
                                    style={{ aspectRatio: '1/1' }}
                                />
                                <Image
                                    src={spell2Picture!}
                                    alt="Spell 2"
                                    className="w-5 h-5 rounded cursor-help object-cover"
                                    width={20}
                                    height={20}
                                    style={{ aspectRatio: '1/1' }}
                                />
                            </div>

                            {/* RUNES */}
                            <div className="flex flex-col gap-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Image
                                                src={rune1Picture?.primary!}
                                                alt="Primary Rune"
                                                className="size-6 object-contain bg-card"
                                                width={32}
                                                height={32}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="max-w-xs p-3">
                                                {(() => {
                                                    const runeInfo = getRuneInfoLocal(playerData?.perks?.styles?.[0]?.selections?.[0]?.perk || 0);
                                                    return (
                                                        <>
                                                            <div className="font-semibold text-primary mb-2">{runeInfo.name}</div>

                                                            <div className="flex items-center gap-2 mb-2">
                                                                <div className="text-xs text-default-600 bg-default-100 px-2 py-1 rounded">
                                                                    {runeInfo.slotType}
                                                                </div>
                                                                <div className="text-xs text-default-600 bg-default-100 px-2 py-1 rounded">
                                                                    {runeInfo.treeName}
                                                                </div>
                                                            </div>

                                                            {runeInfo.shortDesc && (
                                                                <div className="text-xs text-foreground font-medium mb-2 p-2 bg-default-50 rounded">
                                                                    {runeInfo.shortDesc}
                                                                </div>
                                                            )}

                                                            <div className="text-xs text-default-700 leading-relaxed">
                                                                {runeInfo.description}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Image
                                                src={rune2Picture?.primary!}
                                                alt="Secondary Rune Tree"
                                                className="size-6 object-contain bg-card"
                                                width={64}
                                                height={64}
                                            />
                                        </TooltipTrigger>

                                        <TooltipContent>
                                            <div className="max-w-xs p-2">
                                                <div className="font-semibold text-primary mb-1">
                                                    Secondary Tree
                                                </div>
                                                <div className="text-xs text-default-600">
                                                    {getRuneStyleName(playerData?.perks?.styles?.[1]?.style || 0)}
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        {/* KDA */}
                        <div className="flex flex-col gap-1 text-center">
                            <div className="flex items-center font-semibold">
                                <span>{playerData.kills}{' '}/{' '}</span>
                                <span className="text-destructive">{playerData.deaths}</span>
                                <span>{' '}/{' '}{playerData.assists}</span>
                            </div>

                            <div className="flex items-center gap-1 text-neutral-400">
                                <span className="font-semibold">
                                    {calculateKDA()}
                                </span>
                                <span>KDA</span>
                            </div>

                            {/* MINIONS */}
                            <div className="flex items-center gap-1 text-neutral-400">
                                <span className="font-semibold">
                                    {playerData.totalMinionsKilled}
                                </span>
                                <span>CS</span>
                                <span>{(playerData.totalMinionsKilled / (match.info.gameDuration / 60)).toFixed(1)}</span>
                            </div>

                            {match.info.gameMode === 'CLASSIC' && (
                                <div className="flex items-center gap-1 text-neutral-400">
                                    <span className="font-semibold">
                                        {playerData.visionScore}
                                    </span>
                                    <span>Vision</span>
                                </div>
                            )}
                        </div>

                        {/* ITEMS */}
                        <div className="grid grid-cols-6 gap-1">
                            {JSON.stringify(items)}
                            {/* {playerItems.slice(0, 6).map((itemId, index) => {
                                return (
                                    <MatchItemView key={index} itemId={itemId} item={items[itemId]} />
                                )
                            })} */}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}