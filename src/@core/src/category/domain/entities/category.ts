import { Entity } from "../../../@seedwork/domain/entity/entity";
import { EntityValidationError } from "../../../@seedwork/domain/errors/validation-error";
import { UniqueEntityId } from "../../../@seedwork/domain/value-objects/unique-entity-id.vo";
import { CategoryValidatorFactory } from "../validators/category-validator";
import { CategoryFakeBuilder } from "./category-fake-builder";

export interface CategoryProps {
  name: string;
  description?: string;
  is_active?: boolean;
  created_at?: Date;
}

type Update = Pick<Required<CategoryProps>, "name" | "description">;

export type CategoryPropsJson = Required<{ id: string } & CategoryProps>;

export class Category extends Entity<CategoryProps, CategoryPropsJson> {
  constructor(public readonly props: CategoryProps, id?: UniqueEntityId) {
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

  static validate(props: Omit<CategoryProps, "created_at">) {
    const validator = CategoryValidatorFactory.create();
    const isValid = validator.validate(props);

    if (!isValid) {
      throw new EntityValidationError(validator.errors);
    }
  }

  static fake() {
    return CategoryFakeBuilder;
  }

  update({ name, description }: Update) {
    Category.validate({
      name,
      description,
    });

    this.name = name;
    this.description = description;
  }

  activate() {
    this.props.is_active = true;
  }

  deactivate() {
    this.props.is_active = false;
  }

  toJSON(): CategoryPropsJson {
    return {
      id: this.id.toString(),
      name: this.name,
      description: this.description,
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}
