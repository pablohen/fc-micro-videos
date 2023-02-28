import { UseCase as DefaultUseCase } from "../../../@seedwork/application/use-case";
import { EntityValidationError } from "../../../@seedwork/domain";
import { CastMember } from "../../../cast-member/domain/entities/cast-member";
import { CastMemberRepository } from "../../../cast-member/domain/repository/cast-member.repository";
import {
  CastMemberType,
  Types,
} from "../../../cast-member/domain/value-objects/cast-member-type.vo";
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from "../dto/cast-member-output";

export namespace CreateCastMemberUseCase {
  export type Input = {
    name: string;
    type: Types;
  };

  export type Output = CastMemberOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private repository: CastMemberRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const [type, errorCastMemberType] = CastMemberType.create(input.type);

      try {
        const entity = new CastMember({
          ...input,
          type,
        });
        await this.repository.insert(entity);
        return CastMemberOutputMapper.toOutput(entity);
      } catch (e) {
        this.handleError(e, errorCastMemberType);
      }
    }

    private handleError(e: Error, errorCastMemberType: Error | undefined) {
      if (e instanceof EntityValidationError) {
        e.setFromError("type", errorCastMemberType);
      }

      throw e;
    }
  }
}
