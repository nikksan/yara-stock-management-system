import { Sequelize } from 'sequelize';
import createModel, { ProductAttributes, ProductDAO, ProductDB } from './models/ProductDB';
import ProductRepository from '@domain/repository/ProductRepository';
import Product from '@domain/model/Product';
import { PaginationOpts, Paginated } from '@domain/repository/Repository';
import { Id } from '@domain/model/Entity';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';
import { Logger } from '@infrastructure/logger/Logger';
import Size from '@domain/model/Size';

export default class SequelizeProductRepository implements ProductRepository {
  private model: ProductDB;
  private logger: Logger;

  constructor(
    dbConnection: Sequelize,
    loggerFactory: LoggerFactory,
  ) {
    this.model = createModel(dbConnection);
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async findByNameAndSize(name: string, size: Size): Promise<Product | null> {
    const dao = await this.model.findOne({
      where: { name, size },
    });

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

  async delete(entity: Product): Promise<boolean> {
    const deletedCount = await this.model.destroy({
      where: {
        id: entity.id,
      },
    });

    return Boolean(deletedCount);
  }

  async findAll(): Promise<Array<Product>> {
    const daos = await this.model.findAll();

    const entities: Array<Product> = [];
    for (const dao of daos) {
      try {
        entities.push(this.mapDAOToEntity(dao));
      } catch (err) {
        this.logger.warn(err);
      }
    }

    return entities;
  }

  async findAndCountByCriteria(opts: PaginationOpts): Promise<Paginated<Product>> {
    const { count: total, rows: daos } = await this.model.findAndCountAll({
      offset: (opts.page - 1) * opts.limit,
      limit: opts.limit,
    });

    const entities: Array<Product> = [];
    for (const dao of daos) {
      try {
        entities.push(this.mapDAOToEntity(dao));
      } catch (err) {
        this.logger.warn(err);
      }
    }

    return { items: entities, total };
  }

  async findById(id: Id): Promise<Product | null> {
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
      where: {},
    });
  }

  async save(entity: Product): Promise<void> {
    await this.model.upsert(this.mapEntityToAttributes(entity));
  }

  private mapEntityToAttributes(entity: Product): ProductAttributes {
    return {
      id: entity.id,
      name: entity.getName(),
      size: entity.getSize(),
      isHazardous: entity.getIsHazardous(),
    };
  }

  private mapDAOToEntity(dao: ProductDAO): Product {
    return new Product({
      id: dao.dataValues.id,
      name: dao.dataValues.name,
      size: dao.dataValues.size,
      isHazardous: dao.dataValues.isHazardous,
    });
  }
}
