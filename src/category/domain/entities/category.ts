import { Entity } from "../../../@seedwork/domain/entity/entity";
import { UniqueEntityId } from "../../../@seedwork/domain/value-objects/unique-entity-id.vo";
import { ValidatorRules } from "../../../@seedwork/validators/validator-rules";

export interface Props {
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
}

type Update = Pick<Required<Props>, "name" | "description">;

export class Category extends Entity<Props> {
  constructor(public readonly props: Props, id?: UniqueEntityId) {
    Category.validate(props);

    super(props, id);
    this.props.description = this.props.description ?? null;
    this.props.is_active = this.props.is_active ?? true;
    this.props.created_at = this.props.created_at ?? new Date();
  }

  get name() {
    return this.props.name;
  }

  private set name(value: string) {
    this.props.name = value;
  }

  get description() {
    return this.props.description;
  }

  private set description(value: string) {
    this.props.description = value ?? null;
  }

  get is_active() {
    return this.props.is_active;
  }

  private set is_active(value: boolean) {
    this.props.is_active = value ?? true;
  }

  get created_at() {
    return this.props.created_at;
  }

  update({ name, description }: Update) {
    Category.validate({
      name,
      description,
    });

    this.name = name;
    this.description = description;
  }

  static validate(props: Omit<Props, "created_at">) {
    ValidatorRules.values(props.name, "name")
      .required()
      .string()
      .maxLength(255);
    ValidatorRules.values(props.description, "description").string();
    ValidatorRules.values(props.is_active, "is_active").boolean();
  }

  activate() {
    this.props.is_active = true;
  }

  deactivate() {
    this.props.is_active = false;
  }
}
