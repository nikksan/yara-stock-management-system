import { Sequelize } from 'sequelize';
import { omit } from 'lodash';
import { exec } from 'child_process';
import { promisify } from 'util';
import { loadConfig } from '@config/index';

(async () => {
  process.env.NODE_ENV = 'test';

  const config = loadConfig();
  const sequelize = new Sequelize(omit(config.db, ['database']));

  await sequelize.authenticate();

  await sequelize.query(`DROP DATABASE IF EXISTS "${config.db.database}";`);
  await sequelize.query(`CREATE DATABASE "${config.db.database}";`);

  const execAsync = promisify(exec);
  await execAsync('npm run db:migrate');
})();
