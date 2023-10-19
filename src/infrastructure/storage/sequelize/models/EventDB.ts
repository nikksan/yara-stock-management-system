import { Sequelize, DataTypes, Model, ModelStatic } from 'sequelize';

export type EventAttributes = {
  id: string,
  type: string,
  data: Record<string, unknown>,
  createdAt: Date,
}

export type EventDAO = Model<EventAttributes>;
export type EventDB = ModelStatic<EventDAO>;

export default (dbConnection: Sequelize) => dbConnection.define('Event', {
  id: {
    type: DataTypes.STRING(36),
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  type: {
    type: DataTypes.STRING(32),
    allowNull: false,
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  freezeTableName: true,
  timestamps: false,
});
