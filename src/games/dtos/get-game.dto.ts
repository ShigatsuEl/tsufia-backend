import { IsOptional } from 'class-validator';

import { CoreOutput } from '@common/dtos/core.dto';
import { Game } from '@games/entities/game.entity';

export class GetGameInputDto {
  roomId: number;
}

export class GetGameOutputDto extends CoreOutput {
  @IsOptional()
  game?: Game;
}
