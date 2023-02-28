import { CreateCastMemberUseCase } from '@fc/micro-videos/cast-member/application';
import { Types } from '@fc/micro-videos/cast-member/domain';
import { IsIn, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateCastMemberDto implements CreateCastMemberUseCase.Input {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn([Types.ACTOR, Types.DIRECTOR])
  @IsInt()
  @IsNotEmpty()
  type: Types;
}
