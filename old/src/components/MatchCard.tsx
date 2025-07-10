"use client";

import { MatchV5DTOs, SummonerV4DTO } from "@/lib/ezreal/models-dto";
import { getChampionSquareUrl, RunesDto, SpellsDto } from "@/lib/riot.api";
import { Spinner } from "@heroui/react";
import Image from 'next/image';
import { Card, CardContent } from "./ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface MatchCardProps {
  match: MatchV5DTOs.MatchDto;
  summoner: SummonerV4DTO;
  spells: SpellsDto;
  runes: RunesDto;
  // itemsData: ItemsData;
}

export default function MatchCard({ match, summoner, spells, runes }: MatchCardProps) {
  const playerData = match.info.participants.find(p => p.puuid === summoner.puuid);

  if (!playerData) return null

  let items = []

  items = [
    playerData.item0,
    playerData.item1,
    playerData.item2,
    playerData.item3,
    playerData.item4,
    playerData.item5,
    playerData.item6
  ];

  const calculateKP = () => {
    let totalTeamKills = 0;
    match.info.participants.splice(0, 5).map(p => {
      totalTeamKills = totalTeamKills + p.kills
    })

    return (((playerData.kills + playerData.assists) / totalTeamKills) * 100).toFixed(0)
  }

  const calculateDPM = () => {
    return (playerData.totalDamageDealtToChampions / (match.info.gameDuration / 60)).toFixed(0)
  }

  const formatGameDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds}`;
  }


  const calculateDaysPassed = (
    startTimestampStr: number,
  ): number => {
    const startDate: Date = new Date(startTimestampStr);
    const endDate: Date = new Date();

    // Get time in milliseconds since epoch (UTC)
    const startTimeMs: number = startDate.getTime();
    const endTimeMs: number = endDate.getTime();

    const differenceMs: number = endTimeMs - startTimeMs;

    // Milliseconds in a day: 1000 ms/s * 60 s/min * 60 min/hr * 24 hr/day
    const msInDay: number = 1000 * 60 * 60 * 24;

    const daysPassedFloat: number = differenceMs / msInDay;

    // Return the full number of days passed (floored)
    return Math.floor(daysPassedFloat);
  }

  // const roleMap: Record<string, string> = {
  //   'TOP': 'Top',
  //   'JUNGLE': 'Jungle',
  //   'MIDDLE': 'Mid',
  //   'CARRY': 'ADC',
  //   'SUPPORT': 'Support'
  // };
  // const displayRole = roleMap[playerData.role] || playerData.lane || 'N/A';

  return (
    <Card className="bg-background w-full h-full">
      <CardContent className="w-full h-full">
        <div className="flex items-center gap-2 w-full h-full">
          <div className="self-start relative overflow-hidden rounded">
            <Image
              src={getChampionSquareUrl(playerData.championName)}
              alt={playerData.championName}
              className="w-12 h-12 object-cover"
              width={48}
              height={48}
              style={{ aspectRatio: '1/1' }}
            />
            <div className="absolute bottom-0.5 left-0.5 bg-black/70 text-white text-xs font-medium leading-none px-1 py-0.5 rounded text-center min-w-[16px] z-10">
              {playerData.champLevel || 1}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full h-full">
            <div className="flex items-center self-start gap-2">
              <span className={`text-base font-semibold ${playerData.win ? 'text-success' : 'text-destructive'}`}>
                {playerData.win ? 'VICTORY' : 'DEFEAT'}
              </span>

              <div className="flex items-center gap-3 text-sm">
                <span className="uppercase">{match.info.gameMode === 'CLASSIC' ? 'Ranked' : match.info.gameMode}</span>
                <span>{formatGameDuration(match.info.gameDuration)}</span>
                <span>{calculateDaysPassed(match.info.gameStartTimestamp)} day ago</span>
              </div>
            </div>
          </div>
          {/* <TooltipProvider>
            <div className="flex items-start gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative cursor-help overflow-hidden rounded">
                    <Image
                      src={getChampionSquareUrl(playerData.championName)}
                      alt={playerData.championName}
                      className="w-12 h-12 object-cover"
                      width={48}
                      height={48}
                      style={{ aspectRatio: '1/1' }}
                    />
                    <div className="absolute bottom-0.5 left-0.5 bg-black/70 text-white text-xs font-medium leading-none px-1 py-0.5 rounded text-center min-w-[16px] z-10">
                      {playerData.champLevel || 1}
                    </div>
                  </div>
                </TooltipTrigger>

                <TooltipContent>{`${playerData.championName} - Level ${playerData.champLevel || 1}`}</TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-2">
                <span className={`text-base font-semibold ${playerData.win ? 'text-success' : 'text-destructive'}`}>
                  {playerData.win ? 'VICTORY' : 'DEFEAT'}
                </span>

                <div className="flex items-center gap-3 text-sm">
                  <span className="uppercase">{match.info.gameMode === 'CLASSIC' ? 'Ranked' : match.info.gameMode}</span>
                  <span>{formatGameDuration(match.info.gameDuration)}</span>
                  <span>{calculateDaysPassed(match.info.gameStartTimestamp)} day ago</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-1">
                <span className="font-semibold">{((playerData.kills + playerData.assists) / playerData.deaths).toFixed(2)} KDA</span>
                <span className="text-sm">{playerData.kills} / {playerData.deaths} / {playerData.assists}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="font-semibold">{(playerData.visionScore / (match.info.gameDuration / 60)).toFixed(2)} Vis/Min</span>
                <span>{calculateKP()}% KP</span>
              </div>
            </div>
          </TooltipProvider> */}
        </div>
      </CardContent>
    </Card>
  )
}

// <Card className={`border-l-2 ${playerData.win ? 'border-success' : 'border-destructive'} overflow-hidden bg-background`}>
//   <CardContent className="p-2 overflow-hidden">
//     <div className="flex items-center gap-1 md:gap-2 min-w-0">

//       <div className="w-20 md:w-20 text-center">
//         <div className="text-xs font-medium text-default-600">
//           {match.info.gameMode === 'CLASSIC' ? 'Ranked Solo' : match.info.gameMode}
//         </div>
//         <div className={`text-xs font-semibold ${playerData.win ? 'text-success' : 'text-destructive'}`}>
//           {playerData.win ? 'VICTORY' : 'DEFEAT'}
//         </div>
//         <div className="text-xs text-default-500">
//           {formatGameDuration(match.info.gameDuration)}
//         </div>
//         <div className="text-xs text-primary-600 font-medium">
//           {match.info.gameMode === 'ARAM' ? '-' : displayRole}
//         </div>
//       </div>

//       <ChampionInfo
//         player={playerData}
//         spells={spells}
//         runes={runes}
//       />

//       <div className="flex flex-col w-16 md:w-14 text-center">
//         <div className="text-sm font-semibold">
//           {playerData.kills} / <span className="text-warning">{playerData.deaths}</span> / {playerData.assists}
//         </div>
//         <div className="text-xs text-default-500">
//           {((playerData.kills + playerData.assists) / playerData.deaths).toFixed(2)} KDA
//         </div>
//       </div>

//       <div className="hidden md:block w-14 text-center">
//         <div className="text-sm font-medium">
//           {playerData.totalMinionsKilled}
//         </div>
//         <div className="text-xs text-default-500">{(playerData.totalMinionsKilled / (match.info.gameDuration / 60)).toFixed(2)} CS/min</div>
//       </div>

//       {/*<div className="hidden lg:block w-14 text-center">
//         <div className="text-sm font-medium text-orange-600">
//           {damageFormatted}
//         </div>
//         <div className="text-xs text-default-500">Damage</div>
//       </div>

//       <div className="hidden lg:block w-14 text-center">
//         <div className="text-sm font-medium text-yellow-600">
//           {goldFormatted}
//         </div>
//         <div className="text-xs text-default-500">Gold</div>
//       </div>

//       <div className=">
//         <ItemsDisplay
//           items={items}
//           itemsData={itemsData}
//         />
//       </div>

//       <div className="hidden lg:block min-w-[200px]">
//         <TeamsList
//           participants={match.info.participants}
//           currentPlayerPuuid={summoner.puuid}
//         />
//       </div> */}

//     </div>
//   </CardContent>
// </Card>