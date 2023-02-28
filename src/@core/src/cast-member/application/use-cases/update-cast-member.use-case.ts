import { UseCase as DefaultUseCase } from "../../../@seedwork/application/use-case";
import { EntityValidationError } from "../../../@seedwork/domain";
import { CastMemberRepository } from "../../domain/repository/cast-member.repository";
import {
  CastMemberType,
  Types,
} from "../../domain/value-objects/cast-member-type.vo";
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from "../dto/cast-member-output";

export namespace UpdateCastMemberUseCase {
  export type Input = {
    id: string;
    name: string;
    type: Types;
  };

  export type Output = CastMemberOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private repository: CastMemberRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.repository.findById(input.id);

      const [type, errorCastMemberType] = CastMemberType.create(input.type);

      try {
        entity.update(input.name, type);
        await this.repository.update(entity);

        return CastMemberOutputMapper.toOutput(entity);
      } catch (error) {
        this.handleError(error, errorCastMemberType);
      }
    }

    private handleError(error: Error, errorCastMemberType: Error | undefined) {
      if (error instanceof EntityValidationError) {
        error.setFromError("type", errorCastMemberType);
      }

      throw error;
    }
  }
}
