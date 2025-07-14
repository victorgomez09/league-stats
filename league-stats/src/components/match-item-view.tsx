"use client";

import { DragonItemDto, ItemsDto } from "@/app/models/item";
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { trpc } from "@/trpc/client";
import { Spinner } from "./ui/spinner";

interface ItemsDisplayProps {
  itemId: number
  item: DragonItemDto
}

export default function MatchItemView({ itemId, item }: ItemsDisplayProps) {
  const { data: itemPicture, isLoading: itemPictureLoading } = trpc.item.getItemPicture.useQuery({ itemId: itemId }, { enabled: !!itemId });

  if (itemPictureLoading) return <Spinner />

  const getItemInfo = (itemId: number): {
    name: string;
    description: string;
    stats: string[];
    cost: string;
  } => {
    if (item) {
      const cleanDescription = item.plaintext || item.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');

      const stats: string[] = [];
      if (item.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          if (value && typeof value === 'number') {
            let statName = stat;
            const statTranslations: { [key: string]: string } = {
              'FlatHPPoolMod': 'Health',
              'FlatMPPoolMod': 'Mana',
              'FlatArmorMod': 'Armor',
              'FlatSpellBlockMod': 'Magic Resist',
              'FlatPhysicalDamageMod': 'Attack Damage',
              'FlatMagicDamageMod': 'Power Ability',
              'PercentAttackSpeedMod': 'Attack Speed',
              'PercentMovementSpeedMod': 'Movement Speed',
              'FlatCritChanceMod': 'Critical Chance',
              'PercentLifeStealMod': 'Life Steal'
            };

            statName = statTranslations[stat] || stat;
            const formattedValue = stat.includes('Percent') ? `${(value * 100).toFixed(0)}%` : value.toString();
            stats.push(`${formattedValue} ${statName}`);
          }
        });
      }

      const cost = item.gold?.total ? `${item.gold.total} (${item.gold.base})` : '';

      return {
        name: item.name,
        description: cleanDescription,
        stats,
        cost
      };
    }

    return {
      name: 'Unknown Item',
      description: 'Data not available',
      stats: [],
      cost: ''
    };
  };

  return (
    <div className="grid grid-cols-3 gap-0.5">
      <div className="w-6 h-6 bg-default-100 rounded border overflow-hidden">
        {itemId > 0 ? (
          <TooltipProvider>
            <Tooltip
            >
              <TooltipTrigger asChild>
                <Image
                  src={itemPicture!}
                  alt={`Item ${itemId}`}
                  className="w-full h-full object-cover cursor-help"
                  width={24}
                  height={24}
                />
              </TooltipTrigger>
            </Tooltip>

            <TooltipContent>
              <div className="max-w-xs p-2">
                {(() => {
                  const itemInfo = getItemInfo(itemId);
                  return (
                    <>
                      <div className="font-semibold text-primary mb-2">{itemInfo.name}</div>
                      <div className="text-xs text-default-600 mb-2">
                        {itemInfo.description}
                      </div>
                      {itemInfo.stats.length > 0 && (
                        <div className="mb-2">
                          {itemInfo.stats.map((stat, statIndex) => (
                            <div key={statIndex} className="text-xs text-foreground">
                              {stat}
                            </div>
                          ))}
                        </div>
                      )}
                      {itemInfo.cost && (
                        <div className="text-xs text-warning">
                          Custo: {itemInfo.cost}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </TooltipContent>
          </TooltipProvider>
        ) : null}
      </div>

      <div className="w-6 h-6 bg-default-100 rounded border overflow-hidden col-start-2 col-end-3">
        {/* <Tooltip
            content={
              <div className="max-w-xs p-2">
                {(() => {
                  const itemInfo = getItemInfo(items[6]);
                  return (
                    <>
                      <div className="font-semibold text-primary mb-2">{itemInfo.name}</div>
                      <div className="text-xs text-default-600 mb-2">
                        {itemInfo.description}
                      </div>
                      {itemInfo.stats.length > 0 && (
                        <div className="mb-2">
                          {itemInfo.stats.map((stat, statIndex) => (
                            <div key={statIndex} className="text-xs text-foreground">
                              {stat}
                            </div>
                          ))}
                        </div>
                      )}
                      {itemInfo.cost && (
                        <div className="text-xs text-warning">
                          Custo: {itemInfo.cost}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            }
          >
            <Image
              src={getItemImageUrl(items[6])}
              alt={`Trinket ${items[6]}`}
              className="w-full h-full object-cover cursor-help"
              width={24}
              height={24}
            />
          </Tooltip> */}
      </div>
    </div>
  );
}