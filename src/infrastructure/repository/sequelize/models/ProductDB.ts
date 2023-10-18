import Size from '@domain/model/Size';
import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';

export type ProductAttributes = {
  id: string,
  name: string,
  size: Size,
  isHazardous: boolean,
}

export type ProductDAO = Model<ProductAttributes>;
export type ProductDB = ModelStatic<ProductDAO>;

export default (dbConnection: Sequelize) => dbConnection.define('Product', {
  id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(64),
    allowNull: false,
  },
  size: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  isHazardous: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  }
}, {
  freezeTableName: true,
  timestamps: false,
});
