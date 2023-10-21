import { LogImplementation } from '@infrastructure/logger/LoggerFactory';
import { Config } from './Config';
import { LogLevel } from '@infrastructure/logger/Logger';
import { parseEnum, parseNumber, parseString } from './env-parsers';
import { Dialect } from 'sequelize';
import { config as loadDotEnvConfig } from 'dotenv';

loadDotEnvConfig();

const config: Config = {
  log: {
    impl: parseEnum<LogImplementation>('LOG_IMPL', Object.values(LogImplementation), LogImplementation.Console),
    level: parseEnum<LogLevel>('LOG_LEVEL', Object.values(LogLevel), LogLevel.Debug),
  },
  server: {
    port: parseNumber('SERVER_PORT', 4000),
  },
  db: {
    dialect: parseString('DB_DIALECT', 'postgres') as Dialect,
    database: parseString('DB_NAME', 'test_db'),
    username: parseString('DB_USER'),
    password: parseString('DB_PASSWORD'),
  },
};

export default config;
