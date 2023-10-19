'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, DataTypes) {
    await queryInterface.createTable('Warehouse', {
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

    await queryInterface.createTable('Product', {
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

    await queryInterface.createTable('Event', {
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
  },

  async down (queryInterface) {
    await queryInterface.dropTable('Event');
    await queryInterface.dropTable('Product');
    await queryInterface.dropTable('Warehouse');
  }
};
