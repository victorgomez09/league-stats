"use client";

import {
  type ItemsData,
  type RunesData,
  type SummonerSpellsData
} from "@/lib/_old.riot-server-api";
import { Match, Summoner } from "@/lib/types";
import { Target } from "lucide-react";
import MatchCard from "./MatchCard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RiotGameType } from "@/lib/types/riot.type";
import { MatchV5DTOs, SummonerV4DTO } from "@/lib/ezreal/models-dto";
import { RunesDto, SpellsDto } from "@/lib/riot.api";

interface MatchHistoryProps {
  matches: MatchV5DTOs.MatchDto[];
  summoner: SummonerV4DTO;
  spells: SpellsDto;
  runes: RunesDto;
  // itemsData: ItemsData;
}

export default function MatchHistory({ matches, summoner, spells, runes }: MatchHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Match History
        </CardTitle>
      </CardHeader>

      <CardContent>
        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match) => (
              <MatchCard
                key={match.metadata.matchId}
                match={match}
                summoner={summoner}
                spells={spells}
                runes={runes}
              // itemsData={itemsData}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-default-500">Nenhuma partida encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}