"use client";

import { MatchV5DTOs, SummonerV4DTO } from "@/lib/ezreal/models-dto";
import {
  formatGameDuration,
  type ItemsData,
  type RunesData,
  type SummonerSpellsData
} from "@/lib/_old.riot-server-api";
import { RiotParticipantType } from "@/lib/types/riot.type";
import { Card, CardContent } from "./ui/card";
import { RunesDto, SpellsDto } from "@/lib/riot.api";
import ChampionInfo from "./ChampionInfo";

interface MatchCardProps {
  match: MatchV5DTOs.MatchDto;
  summoner: SummonerV4DTO;
  spells: SpellsDto;
  runes: RunesDto;
  // itemsData: ItemsData;
}

export default function MatchCard({ match, summoner, spells, runes }: MatchCardProps) {
  const playerData = match.info.participants.find(p => p.puuid === summoner.puuid);

  if (!playerData) return null;

  const items = [
    playerData.item0,
    playerData.item1,
    playerData.item2,
    playerData.item3,
    playerData.item4,
    playerData.item5,
    playerData.item6
  ];

  const roleMap: Record<string, string> = {
    'TOP': 'Top',
    'JUNGLE': 'Jungle',
    'MIDDLE': 'Mid',
    'CARRY': 'ADC',
    'SUPPORT': 'Support'
  };
  const displayRole = roleMap[playerData.role] || playerData.lane || 'N/A';

  return (
    <Card className={`border-l-2 ${playerData.win ? 'border-success' : 'border-destructive'} overflow-hidden bg-background`}>
      <CardContent className="p-2 overflow-hidden">
        <div className="flex items-center gap-1 md:gap-2 min-w-0">

          <div className="w-20 md:w-20 flex-shrink-0 text-center">
            <div className="text-xs font-medium text-default-600">
              {match.info.gameMode === 'CLASSIC' ? 'Ranked Solo' : match.info.gameMode}
            </div>
            <div className={`text-xs font-semibold ${playerData.win ? 'text-success' : 'text-destructive'}`}>
              {playerData.win ? 'VICTORY' : 'DEFEAT'}
            </div>
            <div className="text-xs text-default-500">
              {formatGameDuration(match.info.gameDuration)}
            </div>
            <div className="text-xs text-primary-600 font-medium">
              {match.info.gameMode === 'ARAM' ? '-' : displayRole}
            </div>
          </div>

          <ChampionInfo
            player={playerData}
            spells={spells}
            runes={runes}
          />

          <div className="flex flex-col w-16 md:w-14 text-center">
            <div className="text-sm font-semibold">
              {playerData.kills} / <span className="text-warning">{playerData.deaths}</span> / {playerData.assists}
            </div>
            <div className="text-xs text-default-500">
              {((playerData.kills + playerData.assists) / playerData.deaths).toFixed(2)} KDA
            </div>
          </div>

          <div className="hidden md:block flex-shrink-0 w-14 text-center">
            <div className="text-sm font-medium">
              {playerData.totalMinionsKilled}
            </div>
            <div className="text-xs text-default-500">{(playerData.totalMinionsKilled / (match.info.gameDuration / 60)).toFixed(2)} CS/min</div>
          </div>

          {/*<div className="hidden lg:block flex-shrink-0 w-14 text-center">
            <div className="text-sm font-medium text-orange-600">
              {damageFormatted}
            </div>
            <div className="text-xs text-default-500">Damage</div>
          </div>

          <div className="hidden lg:block flex-shrink-0 w-14 text-center">
            <div className="text-sm font-medium text-yellow-600">
              {goldFormatted}
            </div>
            <div className="text-xs text-default-500">Gold</div>
          </div>

          <div className="flex-shrink-0">
            <ItemsDisplay
              items={items}
              itemsData={itemsData}
            />
          </div>

          <div className="hidden lg:block flex-shrink-0 min-w-[200px]">
            <TeamsList
              participants={match.info.participants}
              currentPlayerPuuid={summoner.puuid}
            />
          </div> */}

        </div>
      </CardContent>
    </Card>
  );
}