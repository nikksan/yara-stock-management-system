import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import { InjectionMode, asClass, asValue, createContainer } from "awilix";
import { loadConfig } from "./config";
import { Sequelize } from "sequelize";
import SequelizeWarehouseRepository from "@infrastructure/storage/sequelize/SequelizeWarehouseRepository";
import SequelizeProductRepository from "@infrastructure/storage/sequelize/SequelizeProductRepository";
import SequelizeAuditLog from "@infrastructure/storage/sequelize/SequelizeAuditLog";
import HttpServer from "@infrastructure/server/HttpServer";

const config = loadConfig();
const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

const loggerFactory = new LoggerFactory(config.log);
container.register({
  loggerFactory: asValue(loggerFactory),
});

const logger = loggerFactory.create('Sequelize');
container.register({
  dbConnection: asValue(new Sequelize({
    ...config.db,
    logging: (msg) => logger.debug(msg),
  })),
});

container.register({
  warehouseRepository: asClass(SequelizeWarehouseRepository).singleton(),
  productRepository: asClass(SequelizeProductRepository).singleton(),
  auditLog: asClass(SequelizeAuditLog).singleton(),
});

container.loadModules([
  __dirname + '/application/command/*.ts',
  __dirname + '/application/query/*.ts',
  __dirname + '/infrastructure/controller/*.ts',
], {
  formatName: 'camelCase'
});

container.register({
  httpServer: asClass(HttpServer, {
    injector: () => ({
      config: config.server,
    })
  }).singleton(),
});

export default container;
