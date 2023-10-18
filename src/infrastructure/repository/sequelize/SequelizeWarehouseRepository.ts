import { Op, Sequelize } from "sequelize";
import createModel, { WarehouseAttributes, WarehouseDAO, WarehouseDB } from "./models/WarehouseDB";
import WarehouseRepository from "@domain/repository/WarehouseRepository";
import Warehouse from "@domain/model/Warehouse";
import { PaginationOpts, Paginated } from "@domain/repository/Repository";
import { Id } from "@domain/model/Entity";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import { Logger } from "@infrastructure/logger/Logger";

export default class SequelizeWarehouseRepository implements WarehouseRepository {
  private model: WarehouseDB;
  private logger: Logger;

  constructor(
    dbConnection: Sequelize,
    loggerFactory: LoggerFactory,
  ) {
    this.model = createModel(dbConnection);
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async findByName(name: string): Promise<Warehouse | null> {
    const dao = await this.model.findOne({ where: { name } });
    if (!dao) {
      return null;
    }

    try {
      return this.mapDAOToEntity(dao);
    } catch (err) {
      this.logger.warn(err);
    }

    return null;
  }

  async findAllByProductId(id: Id): Promise<Array<Warehouse>> {
    const daos = await this.model.findAll({
      where: {
        inventory: {
          [Op.contains]: [{ product: { id } }]
        }
      } as any,
    });

    const entities: Array<Warehouse> = [];
    for (const dao of daos) {
      try {
        entities.push(this.mapDAOToEntity(dao));
      } catch (err) {
        this.logger.warn(err);
      }
    }

    return entities;
  }

  async delete(entity: Warehouse): Promise<boolean> {
    const deletedCount = await this.model.destroy({
      where: {
        id: entity.id
      }
    });

    return Boolean(deletedCount);
  }

  async findAll(): Promise<Array<Warehouse>> {
    const daos = await this.model.findAll();

    const entities: Array<Warehouse> = [];
    for (const dao of daos) {
      try {
        entities.push(this.mapDAOToEntity(dao));
      } catch (err) {
        this.logger.warn(err);
      }
    }

    return entities;
  }

  async findAndCountByCriteria(opts: PaginationOpts): Promise<Paginated<Warehouse>> {
    const { count: total, rows: daos } = await this.model.findAndCountAll({
      offset: (opts.page - 1) * opts.limit,
      limit: opts.limit,
    });

    const entities: Array<Warehouse> = [];
    for (const dao of daos) {
      try {
        entities.push(this.mapDAOToEntity(dao));
      } catch (err) {
        this.logger.warn(err);
      }
    }

    return { items: entities, total };
  }

  async findById(id: Id): Promise<Warehouse | null> {
    const dao = await this.model.findByPk(id);
    if (!dao) {
      return null;
    }

    try {
      return this.mapDAOToEntity(dao);
    } catch (err) {
      this.logger.warn(err);
      return null;
    }
  }

  async deleteAll(): Promise<void> {
    await this.model.destroy({
      where: {}
    });
  }

  async save(entity: Warehouse): Promise<void> {
    await this.model.upsert(this.mapEntityToAttributes(entity));
  }

  private mapEntityToAttributes(entity: Warehouse): WarehouseAttributes {
    return {
      id: entity.id,
      name: entity.getName(),
      size: entity.getSize(),
      inventory: entity.getInventory(),
    }
  }

  private mapDAOToEntity(dao: WarehouseDAO): Warehouse {
    return new Warehouse({
      id: dao.dataValues.id,
      name: dao.dataValues.name,
      size: dao.dataValues.size,
      inventory: dao.dataValues.inventory,
    });
  }
}
