import { BaseApi } from '../../../base/base'
import { RegionGroups, Regions } from '../../../constants'
import { BaseApiGames } from '../../../base/base.const'

export class BaseApiTft extends BaseApi<RegionGroups | Regions> {
  protected readonly game: BaseApiGames = BaseApiGames.TFT
}
