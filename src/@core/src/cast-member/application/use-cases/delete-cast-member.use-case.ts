import { UseCase as DefaultUseCase } from "../../../@seedwork/application/use-case";
import { CastMemberRepository } from "../../domain/repository/cast-member.repository";

export namespace DeleteCastMemberUseCase {
  export type Input = {
    id: string;
  };

  export type Output = void;

  export class UseCase implements DefaultUseCase<Input, Output> {
    constructor(private repository: CastMemberRepository.Repository) {}

    async execute(input: Input): Promise<Output> {
      await this.repository.delete(input.id);
    }
  }
}
