"use client";

import {
  type ItemsData,
  type RunesData,
  type SummonerSpellsData
} from "@/lib/riot-server-api";
import { Match, Summoner } from "@/lib/types";
import { Target } from "lucide-react";
import MatchCard from "./MatchCard";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface MatchHistoryProps {
  matches: Match[];
  summoner: Summoner;
  spellsData: SummonerSpellsData;
  itemsData: ItemsData;
  runesData: RunesData;
}

export default function MatchHistory({ matches, summoner, spellsData, itemsData, runesData }: MatchHistoryProps) {
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
                spellsData={spellsData}
                itemsData={itemsData}
                runesData={runesData}
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