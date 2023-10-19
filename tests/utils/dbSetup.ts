import { Sequelize } from 'sequelize';
import { loadConfig } from '../../src/config/index';
import { omit } from 'lodash';
import { exec } from 'child_process';
import { promisify } from 'util';

let hasRegisteredTheHooksAlready = false;

export function prepareDb(): void {
  if (hasRegisteredTheHooksAlready) {
    return;
  }

  hasRegisteredTheHooksAlready = true;

  const config = loadConfig();
  const sequelize = new Sequelize(omit(config.db, ['database']));

  beforeAll(async () => {
    await sequelize.authenticate();

    await sequelize.query(`DROP DATABASE IF EXISTS "${config.db.database}";`);
    await sequelize.query(`CREATE DATABASE "${config.db.database}";`);

    const execAsync = promisify(exec);
    await execAsync('npm run db:migrate');
  });
}
