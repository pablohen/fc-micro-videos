import { CastMember } from "../../../cast-member/domain/entities/cast-member";
import { Types } from "../../../cast-member/domain/value-objects/cast-member-type.vo";

export type CastMemberOutput = {
  id: string;
  name: string;
  type: Types;
  created_at: Date;
};

export class CastMemberOutputMapper {
  static toOutput(entity: CastMember): CastMemberOutput {
    return entity.toJSON();
  }
}
