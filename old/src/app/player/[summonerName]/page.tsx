import { api } from "@/app/_trpc/client";
import Navbar from "@/components/Navbar";
import { RegionGroups } from "@/lib/ezreal/constants";
import { MatchV5DTOs, SummonerLeagueDto, SummonerV4DTO } from "@/lib/ezreal/models-dto";
import { AccountDto } from "@/lib/ezreal/models-dto/account";
import { RunesDto, SpellsDto } from "@/lib/riot.api";

interface PlayerPageProps {
  params: Promise<{
    summonerName: string;
  }>;
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const resolvedParams = await params;
  const summonerName = decodeURIComponent(resolvedParams.summonerName);

  const { data } = api.summoner.getAccount.useQuery({ summonerName: summonerName.split('#')[0], tag: summonerName.split('#')[1], server: RegionGroups.EUROPE });
  console.log('data', data)

  let account: AccountDto | null = null;
  let summoner: SummonerV4DTO | null = null;
  // let masteries: ChampionMasteryDTO[] | null = null
  let ranked: SummonerLeagueDto[] = [];
  let matches: MatchV5DTOs.MatchDto[] = [];
  let error: string | null = null;
  let spells: SpellsDto = {};
  let runes: RunesDto = [];
  // let itemsData: ItemsData = {};
  // let masteries: Mastery[] = [];
  // let championStats: any = null;

  // try {
  //   if (summonerName.includes('#')) {
  //     const [gameName, tagLine] = summonerName.split('#');

  //     account = await getAccount(gameName, tagLine, RegionGroups.EUROPE)
  //     summoner = (await getSummoner(gameName, tagLine, RegionGroups.EUROPE, account)).response
  //     // masteries = (await getSummonerMastery(account.puuid)).response
  //     ranked = (await getSummonerRankedInfo(account.puuid)).response
  //     matches = await getSummonerMatches(gameName, tagLine, RegionGroups.EUROPE, summoner)
  //     spells = await getSpells();
  //     runes = await getRunes();
  //   } else {
  //     // summoner = await getSummonerByName(summonerName);
  //   }

  // if (!summoner) {
  //   throw new Error('PLAYER_NOT_FOUND');
  // }

  // const [spells, items, runes] = await Promise.all([
  //   getSummonerSpellsData(),
  //   getItemsData(),
  //   getRunesData(),
  // ]);
  // spellsData = spells;
  // itemsData = items;
  // runesData = runes;

  // championStats = await getStatsByChamp(summoner, matches)
  // } catch (err) {
  //   const errorMessage = err instanceof Error ? err.message : "Unkown error";
  //   // error = getErrorMessage(errorMessage);
  //   console.log(errorMessage)
  // }

  // if (error) {
  //   return (
  //     <div className="min-h-screen">
  //       <Navbar />
  //       <PlayerNotFound error={error} />
  //     </div>
  //   );
  // }

  // if (!summoner) {
  //   return (
  //     <div className="min-h-screen">
  //       <Navbar />
  //       <PlayerNotFound title="Unexpected error" />
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* <PlayerPageClient
        summoner={summoner}
        account={account}
        ranked={ranked}
        initialMatches={matches}
        spells={spells}
        runes={runes}
      // itemsData={itemsData}
      // championStats={championStats}
      /> */}
    </div>
  );
}