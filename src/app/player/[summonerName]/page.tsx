import Navbar from "@/components/Navbar";
import PlayerNotFound from "@/components/PlayerNotFound";
import PlayerPageClient from "./player-page-client";
import {
  getSummonerByName,
  getAccountByRiotId,
  getSummonerByPuuid,
  getRankedInfoByPuuid,
  getMatchHistory,
  getMatchDetails,
  getSummonerSpellsData,
  getItemsData,
  getRunesData,
  getErrorMessage,
  type SummonerSpellsData,
  type ItemsData,
  type RunesData,
  getSummonerMastery
} from "@/lib/riot-server-api";
import { Mastery, Match, RankedInfo, Summoner } from "@/lib/types";
import { getStatsByChamp } from "@/lib/champions-api";

interface PlayerPageProps {
  params: Promise<{
    summonerName: string;
  }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const resolvedParams = await params;
  const summonerName = decodeURIComponent(resolvedParams.summonerName);

  let summoner: Summoner | null = null;
  let rankedData: RankedInfo[] = [];
  let matches: Match[] = [];
  let error: string | null = null;
  let spellsData: SummonerSpellsData = {};
  let itemsData: ItemsData = {};
  let runesData: RunesData = [];
  let masteries: Mastery[] = [];
  let championStats: any = null;

  try {
    if (summonerName.includes('#')) {
      const [gameName, tagLine] = summonerName.split('#');
      const account = await getAccountByRiotId(gameName, tagLine);
      summoner = await getSummonerByPuuid(account.puuid, account.gameName);
      console.log('summoner', summoner)
      console.log('masteries', await getSummonerMastery(account.puuid))
      // masteries = await getSummonerMastery(account.puuid)
    } else {
      summoner = await getSummonerByName(summonerName);
    }

    if (!summoner) {
      throw new Error('PLAYER_NOT_FOUND');
    }

    try {
      rankedData = await getRankedInfoByPuuid(summoner.puuid);
    } catch {
    }

    const matchIds = await getMatchHistory(summoner.puuid, 10);

    const matchPromises = matchIds.map(id => getMatchDetails(id));
    matches = await Promise.all(matchPromises);

    const [spells, items, runes] = await Promise.all([
      getSummonerSpellsData(),
      getItemsData(),
      getRunesData(),
    ]);
    spellsData = spells;
    itemsData = items;
    runesData = runes;

    championStats = await getStatsByChamp(summoner, matches)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
    error = getErrorMessage(errorMessage);
  }


  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <PlayerNotFound error={error} />
      </div>
    );
  }

  if (!summoner) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <PlayerNotFound title="Unexpected error" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <PlayerPageClient
        summoner={summoner}
        rankedData={rankedData}
        initialMatches={matches}
        spellsData={spellsData}
        itemsData={itemsData}
        runesData={runesData}
        championStats={championStats}
      />
    </div>
  );
}