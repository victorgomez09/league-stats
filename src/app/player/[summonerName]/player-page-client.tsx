"use client";

import MatchHistory from "@/components/MatchHistory";
import PlayerProfile from "@/components/player-profile";
import PlayerStats from "@/components/PlayerStats";
import { Button } from "@/components/ui/button";
import { MatchV5DTOs, SummonerLeagueDto, SummonerV4DTO } from "@/lib/ezreal/models-dto";
import { AccountDto } from "@/lib/ezreal/models-dto/account";
import { RunesDto, SpellsDto } from "@/lib/riot.api";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PlayerPageClientProps {
  summoner: SummonerV4DTO;
  account: AccountDto
  ranked: SummonerLeagueDto[];
  initialMatches: MatchV5DTOs.MatchDto[];
  spells: SpellsDto;
  runes: RunesDto;
  // itemsData: ItemsData;
  // championStats: ChampionStat[]
}

export default function PlayerPageClient({
  summoner,
  account,
  ranked,
  initialMatches,
  spells,
  runes
  // itemsData,
  // championStats
}: PlayerPageClientProps) {
  const [allMatches, setAllMatches] = useState<MatchV5DTOs.MatchDto[]>(initialMatches);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    const nextOffset = allMatches.length;

    try {

      const response = await fetch(
        `/api/matches?puuid=${summoner.puuid}&count=10&start=${nextOffset}`
      );

      if (!response.ok) {
        throw new Error('Failed to load matches');
      }

      const newMatches: MatchV5DTOs.MatchDto[] = await response.json();

      if (newMatches && newMatches.length > 0) {
        setAllMatches(prev => [...prev, ...newMatches]);
      }
    } catch {
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/player"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to search
        </Link>
      </div>

      <PlayerStats matches={allMatches} playerPuuid={summoner.puuid} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <PlayerProfile summoner={summoner} account={account}
            ranked={ranked}
          />
          {/* <PlayerChampionsStats championStats={championStats} /> */}
        </div>

        <div className="lg:col-span-2">
          <MatchHistory
            matches={allMatches}
            summoner={summoner}
            spells={spells}
            runes={runes}
          // itemsData={itemsData}
          />

          <div className="mt-4 text-center">
            <Button
              onClick={handleLoadMore}
              isLoading={isLoadingMore}
              color="primary"
              variant="outline"
            >
              {!isLoadingMore && <Loader2 className="w-4 h-4" />}
              {isLoadingMore ? "Loading..." : "Load more matches"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}