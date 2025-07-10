"use client";

import { getItemImageUrl, type ItemsData } from "@/lib/_old.riot-server-api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import Image from "next/image"

interface ItemsDisplayProps {
  items: number[];
  itemsData: ItemsData;
}

export default function ItemsDisplay({ items, itemsData }: ItemsDisplayProps) {
  const getItemInfo = (itemId: number): {
    name: string;
    description: string;
    stats: string[];
    cost: string;
  } => {
    const item = itemsData[itemId.toString()];

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
              'FlatMagicDamageMod': 'Ability Power',
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
      description: 'Information not available',
      stats: [],
      cost: ''
    };
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-3 gap-0.5">
        {items.slice(0, 6).map((itemId, itemIndex) => (
          <div key={itemIndex} className="w-6 h-6 bg-default-100 rounded border overflow-hidden">
            {itemId > 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image
                    src={getItemImageUrl(itemId)}
                    alt={`Item ${itemId}`}
                    className="w-full h-full object-cover cursor-help"
                    width={24}
                    height={24}
                  />
                </TooltipTrigger>

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
                              Cost: {itemInfo.cost}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        ))}

        <div className="w-6 h-6 bg-default-100 rounded border overflow-hidden col-start-2 col-end-3">
          {items[6] > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src={getItemImageUrl(items[6])}
                  alt={`Trinket ${items[6]}`}
                  className="w-full h-full object-cover cursor-help"
                  width={24}
                  height={24}
                />
              </TooltipTrigger>

              <TooltipContent>
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
                            Cost: {itemInfo.cost}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}