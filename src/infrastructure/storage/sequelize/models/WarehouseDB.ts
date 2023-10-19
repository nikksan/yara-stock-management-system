import Size from '@domain/model/Size';
import { InventoryItem } from '@domain/model/Warehouse';
import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';

export type WarehouseAttributes = {
  id: string,
  name: string,
  size: Size,
  inventory: Array<Omit<InventoryItem, 'importedAt'> & {
    importedAt: string,
  }>,
}

export type WarehouseDAO = Model<WarehouseAttributes>;
export type WarehouseDB = ModelStatic<WarehouseDAO>;

export default (dbConnection: Sequelize) => dbConnection.define('Warehouse', {
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
  inventory: {
    type: DataTypes.JSONB,
    allowNull: false,
  }
}, {
  freezeTableName: true,
  timestamps: false,
});
