import { LogLevel } from '@infrastructure/logger/Logger';
import { LogImplementation } from '@infrastructure/logger/LoggerFactory';
import { Options as SequelizeOptions } from 'sequelize';

export interface Config {
  log: {
    impl: LogImplementation;
    level: LogLevel;
  };
  server: {
    port: number;
  };
  db: SequelizeOptions,
}

