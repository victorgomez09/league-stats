"use client";

import {
  getChampionSquareUrl
} from "@/lib/_old.riot-server-api";
import { MatchV5DTOs } from "@/lib/ezreal/models-dto";
import { getSpellImageUrl, RunesDto, SpellsDto } from "@/lib/riot.api";
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ChampionInfoProps {
  player: MatchV5DTOs.ParticipantDto;
  spells: SpellsDto;
  runes: RunesDto;
}

export default function ChampionInfo({ player, spells, runes }: ChampionInfoProps) {
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
              slotType = 'Runa Principal';
            } else if (slotIndex === 1 || slotIndex === 2) {
              slotType = 'Runa Maior';
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

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative cursor-help flex-shrink-0 overflow-hidden rounded">
              <Image
                src={getChampionSquareUrl(player.championName)}
                alt={player.championName}
                className="w-12 h-12 object-cover"
                width={48}
                height={48}
                style={{ aspectRatio: '1/1' }}
              />
              <div className="absolute bottom-0.5 left-0.5 bg-black/70 text-white text-xs font-medium leading-none px-1 py-0.5 rounded text-center min-w-[16px] z-10">
                {player.champLevel || 1}
              </div>
            </div>
          </TooltipTrigger>

          <TooltipContent>{`${player.championName} - Level ${player.champLevel || 1}`}</TooltipContent>
        </Tooltip>


        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-5 h-5 flex-shrink-0">
                <Image
                  src={getSpellImageUrl(player.summoner1Id)}
                  alt="Spell 1"
                  className="w-5 h-5 rounded cursor-help object-cover"
                  width={20}
                  height={20}
                  style={{ aspectRatio: '1/1' }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>{getSpellName(player.summoner1Id)}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-5 h-5 flex-shrink-0">
                <Image
                  src={getSpellImageUrl(player.summoner2Id)}
                  alt="Spell 2"
                  className="w-5 h-5 rounded cursor-help object-cover"
                  width={20}
                  height={20}
                  style={{ aspectRatio: '1/1' }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>{getSpellName(player.summoner2Id)}</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-col gap-0.5">
          {/* {(() => {
            const primaryRuneId = getPrimaryRune(player);
            const secondaryStyleId = getSecondaryRuneStyle(player);

            return (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-5 h-5 bg-black/20 rounded cursor-help flex items-center justify-center">
                      {primaryRuneId ? (
                        <RuneImage
                          runeId={primaryRuneId}
                          alt="Primary Rune"
                          className="w-4 h-4 object-contain"
                          width={16}
                          height={16}
                        />
                      ) : (
                        <div className="w-4 h-4 bg-default-300 rounded"></div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs p-3">
                      {(() => {
                        const runeInfo = getRuneInfoLocal(primaryRuneId);
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

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-5 h-5 bg-black/20 rounded cursor-help flex items-center justify-center">
                      {secondaryStyleId ? (
                        <Image
                          src={getRuneStyleImageUrl(secondaryStyleId)}
                          alt="Secondary Rune Tree"
                          className="w-4 h-4 object-contain"
                          width={16}
                          height={16}
                        />
                      ) : (
                        <div className="w-4 h-4 bg-default-300 rounded"></div>
                      )}
                    </div>
                  </TooltipTrigger>

                  <TooltipContent>
                    <div className="max-w-xs p-2">
                      <div className="font-semibold text-primary mb-1">
                        Secondary Tree
                      </div>
                      <div className="text-xs text-default-600">
                        {getRuneStyleName(secondaryStyleId)}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </>
            );
          })()} */}
        </div>
      </div>
    </TooltipProvider>
  );
}