import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";

export type CategoryModelProps = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
};

@Table({ tableName: "categories", timestamps: false })
export class CategoryModel extends Model<CategoryModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  name: string;

  @Column({ type: DataType.TEXT })
  description: string | null;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  is_active: boolean;

  @Column({ allowNull: false, type: DataType.DATE })
  created_at: Date;
}
