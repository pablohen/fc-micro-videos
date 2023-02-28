import { UseCase as DefaultUseCase } from "../../../@seedwork/application/use-case";
import { CastMemberRepository } from "../../domain/repository/cast-member.repository";
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from "../dto/cast-member-output";

export namespace GetCastMemberUseCase {
  export type Input = {
    id: string;
  };

  export type Output = CastMemberOutput;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private repository: CastMemberRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      const entity = await this.repository.findById(input.id);

      return CastMemberOutputMapper.toOutput(entity);
    }
  }
}
